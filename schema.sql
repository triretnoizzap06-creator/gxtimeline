-- GX Helpdesk Report — shared report storage on Supabase
-- Run once in Supabase → SQL Editor → New query → paste this whole file → Run.
-- Safe to run again (idempotent).
--
-- Model
--   report_imports   one row per imported dataset set (Customer Support + VIP + Repeat Complaint), deduplicated by SHA-256
--   report_state     exactly one row (id = 1): which import is the "latest report" + the shared settings/fills
--   report_snapshots history ("Riwayat"): a saved report = an import + the settings at that moment
-- The browser never talks to these tables directly; /api/report on Vercel uses the service_role key.

-- ---------- tables ----------
create table if not exists public.report_imports (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  hash        text        not null unique,             -- sha256 of the datasets JSON (dedupe)
  datasets_gz text        not null,                    -- datasets JSON, gzip + base64
  size_bytes  integer     not null default 0,          -- uncompressed JSON size
  summary     jsonb       not null default '{}'::jsonb -- { cs:{name,rows,cols}, vip:{…}, rc:{…} }
);

create table if not exists public.report_state (
  id         smallint    primary key default 1 check (id = 1),
  import_id  bigint      references public.report_imports(id) on delete set null,
  revision   bigint      not null default 0,
  settings   jsonb       not null default '{}'::jsonb,   -- period, Repeat Complaint fills, edits, slide order …
  updated_at timestamptz not null default now()
);

create table if not exists public.report_snapshots (
  id         bigint      generated always as identity primary key,
  created_at timestamptz not null default now(),
  title      text        not null default 'Report',
  auto       boolean     not null default false,
  import_id  bigint      not null references public.report_imports(id) on delete cascade,
  settings   jsonb       not null default '{}'::jsonb
);

create index if not exists report_snapshots_created_at_idx on public.report_snapshots (created_at desc);
create index if not exists report_snapshots_import_id_idx  on public.report_snapshots (import_id);
create index if not exists report_state_import_id_idx      on public.report_state (import_id);

-- ---------- helpers ----------
-- upsert an import by hash and return its id
create or replace function public.gx_upsert_import(p_hash text, p_datasets_gz text, p_size integer, p_summary jsonb)
returns bigint
language plpgsql
set search_path = ''
as $$
declare v_id bigint;
begin
  select i.id into v_id from public.report_imports i where i.hash = p_hash;
  if v_id is null then
    insert into public.report_imports (hash, datasets_gz, size_bytes, summary)
    values (p_hash, p_datasets_gz, coalesce(p_size, 0), coalesce(p_summary, '{}'::jsonb))
    on conflict (hash) do nothing
    returning id into v_id;
    if v_id is null then -- concurrent insert of the same hash
      select i.id into v_id from public.report_imports i where i.hash = p_hash;
    end if;
  end if;
  return v_id;
end $$;

-- delete imports nobody uses any more (not latest, not in history), keep the 5 newest as backup
create or replace function public.gx_cleanup_imports()
returns void
language sql
set search_path = ''
as $$
  delete from public.report_imports i
  where not exists (select 1 from public.report_state s where s.import_id = i.id)
    and not exists (select 1 from public.report_snapshots n where n.import_id = i.id)
    and i.id not in (select x.id from public.report_imports x order by x.id desc limit 5);
$$;

-- ---------- 1) new import becomes the latest report for everyone (atomic) ----------
create or replace function public.gx_publish_import(p_hash text, p_datasets_gz text, p_size integer, p_summary jsonb, p_settings jsonb)
returns table (import_id bigint, revision bigint, updated_at timestamptz)
language plpgsql
set search_path = ''
as $$
#variable_conflict use_column
declare v_id bigint;
begin
  v_id := public.gx_upsert_import(p_hash, p_datasets_gz, p_size, p_summary);
  insert into public.report_state as s (id, import_id, revision, settings, updated_at)
  values (1, v_id, 1, coalesce(p_settings, '{}'::jsonb), now())
  on conflict (id) do update
    set import_id = excluded.import_id,
        revision  = s.revision + 1,
        settings  = excluded.settings,
        updated_at = now();
  perform public.gx_cleanup_imports();
  return query select s.import_id, s.revision, s.updated_at from public.report_state s where s.id = 1;
end $$;

-- ---------- 2) save fills/settings — only if the latest report is still the same import ----------
-- returns no row when another import has replaced it in the meantime (API answers 409 → browser reloads latest)
create or replace function public.gx_save_state(p_import_id bigint, p_settings jsonb)
returns table (import_id bigint, revision bigint, updated_at timestamptz)
language plpgsql
set search_path = ''
as $$
#variable_conflict use_column
begin
  return query
  update public.report_state s
     set settings = coalesce(p_settings, '{}'::jsonb),
         revision = s.revision + 1,
         updated_at = now()
   where s.id = 1 and s.import_id = p_import_id
  returning s.import_id, s.revision, s.updated_at;
end $$;

-- ---------- 3) history snapshot ----------
-- automatic snapshots with the same title in the last 3 hours are replaced (no pile-up); max 80 snapshots,
-- the oldest automatic ones are removed first
create or replace function public.gx_save_snapshot(p_hash text, p_datasets_gz text, p_size integer, p_summary jsonb, p_settings jsonb, p_title text, p_auto boolean)
returns table (id bigint, created_at timestamptz)
language plpgsql
set search_path = ''
as $$
#variable_conflict use_column
declare v_imp bigint; v_id bigint; v_at timestamptz;
begin
  v_imp := public.gx_upsert_import(p_hash, p_datasets_gz, p_size, p_summary);
  if coalesce(p_auto, false) then
    delete from public.report_snapshots n
     where n.auto and n.title = coalesce(p_title, 'Report') and n.created_at > now() - interval '3 hours';
  end if;
  insert into public.report_snapshots (title, auto, import_id, settings)
  values (left(coalesce(nullif(p_title, ''), 'Report'), 200), coalesce(p_auto, false), v_imp, coalesce(p_settings, '{}'::jsonb))
  returning report_snapshots.id, report_snapshots.created_at into v_id, v_at;
  delete from public.report_snapshots n
   where n.auto
     and n.id in (select x.id from public.report_snapshots x order by x.created_at desc offset 80);
  perform public.gx_cleanup_imports();
  return query select v_id, v_at;
end $$;

-- ---------- security ----------
-- RLS on, no policies, no grants for anon/authenticated: only the server (service_role) can read/write.
alter table public.report_imports   enable row level security;
alter table public.report_state     enable row level security;
alter table public.report_snapshots enable row level security;

revoke all on public.report_imports, public.report_state, public.report_snapshots from anon, authenticated;
grant select, insert, update, delete on public.report_imports, public.report_state, public.report_snapshots to service_role;

revoke all on function public.gx_upsert_import(text, text, integer, jsonb)                              from public, anon, authenticated;
revoke all on function public.gx_cleanup_imports()                                                     from public, anon, authenticated;
revoke all on function public.gx_publish_import(text, text, integer, jsonb, jsonb)                     from public, anon, authenticated;
revoke all on function public.gx_save_state(bigint, jsonb)                                             from public, anon, authenticated;
revoke all on function public.gx_save_snapshot(text, text, integer, jsonb, jsonb, text, boolean)       from public, anon, authenticated;
grant execute on function public.gx_upsert_import(text, text, integer, jsonb)                          to service_role;
grant execute on function public.gx_cleanup_imports()                                                 to service_role;
grant execute on function public.gx_publish_import(text, text, integer, jsonb, jsonb)                 to service_role;
grant execute on function public.gx_save_state(bigint, jsonb)                                         to service_role;
grant execute on function public.gx_save_snapshot(text, text, integer, jsonb, jsonb, text, boolean)   to service_role;

-- ---------- 4) browser access (no server needed) ----------
-- The website can talk to Supabase directly with the public anon / publishable key (config.js).
-- The browser can NOT touch the tables; it can only call these functions (SECURITY DEFINER).
-- Optional password: set it once with
--   update public.report_config set publish_key_sha256 = encode(sha256(convert_to('YOUR-PASSWORD','UTF8')),'hex') where id = 1;
-- (set it back to null for open mode: everyone using the site can import/edit).
create table if not exists public.report_config (
  id                 smallint primary key default 1 check (id = 1),
  publish_key_sha256 text
);
insert into public.report_config (id) values (1) on conflict (id) do nothing;
alter table public.report_config enable row level security;
revoke all on public.report_config from anon, authenticated;
grant select, update on public.report_config to service_role;

create or replace function public.gxp_open() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select c.publish_key_sha256 is null or c.publish_key_sha256 = '' from public.report_config c where c.id = 1), true);
$$;

create or replace function public.gxp_require_key(p_key text) returns void
language plpgsql stable security definer set search_path = '' as $$
declare v text;
begin
  select c.publish_key_sha256 into v from public.report_config c where c.id = 1;
  if v is not null and v <> '' and v <> encode(sha256(convert_to(coalesce(p_key, ''), 'UTF8')), 'hex') then
    raise exception 'unauthorized' using errcode = 'P0001', hint = 'gx-unauthorized';
  end if;
end $$;

create or replace function public.gxp_check_key(p_key text) returns boolean
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.gxp_require_key(p_key);
  return true;
exception when others then
  return false;
end $$;

create or replace function public.gxp_meta() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select jsonb_build_object('empty', s.import_id is null, 'at', floor(extract(epoch from s.updated_at) * 1000),
                               'import_id', s.import_id, 'revision', s.revision, 'open', public.gxp_open())
       from public.report_state s where s.id = 1),
    jsonb_build_object('empty', true, 'at', 0, 'import_id', null, 'revision', 0, 'open', public.gxp_open()));
$$;

create or replace function public.gxp_latest() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('at', floor(extract(epoch from s.updated_at) * 1000), 'import_id', s.import_id,
                            'revision', s.revision, 'settings', s.settings, 'datasets_gz', i.datasets_gz)
    from public.report_state s join public.report_imports i on i.id = s.import_id
   where s.id = 1;
$$;

create or replace function public.gxp_publish_import(p_key text, p_hash text, p_datasets_gz text, p_size integer, p_summary jsonb, p_settings jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r record;
begin
  perform public.gxp_require_key(p_key);
  if p_hash is null or length(p_hash) <> 64 or p_datasets_gz is null or length(p_datasets_gz) = 0 then
    raise exception 'bad-payload' using errcode = 'P0001';
  end if;
  if length(p_datasets_gz) > 12000000 then raise exception 'too-large' using errcode = 'P0001'; end if;
  select * into r from public.gx_publish_import(p_hash, p_datasets_gz, p_size, p_summary, p_settings);
  return jsonb_build_object('ok', true, 'import_id', r.import_id, 'revision', r.revision, 'at', floor(extract(epoch from r.updated_at) * 1000));
end $$;

create or replace function public.gxp_save_state(p_key text, p_import_id bigint, p_settings jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r record;
begin
  perform public.gxp_require_key(p_key);
  select * into r from public.gx_save_state(p_import_id, p_settings);
  if r.import_id is null then
    return jsonb_build_object('ok', false, 'error', 'conflict');
  end if;
  return jsonb_build_object('ok', true, 'import_id', r.import_id, 'revision', r.revision, 'at', floor(extract(epoch from r.updated_at) * 1000));
end $$;

create or replace function public.gxp_save_snapshot(p_key text, p_hash text, p_datasets_gz text, p_size integer, p_summary jsonb, p_settings jsonb, p_title text, p_auto boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r record;
begin
  perform public.gxp_require_key(p_key);
  if p_hash is null or length(p_hash) <> 64 or p_datasets_gz is null then raise exception 'bad-payload' using errcode = 'P0001'; end if;
  if length(p_datasets_gz) > 12000000 then raise exception 'too-large' using errcode = 'P0001'; end if;
  select * into r from public.gx_save_snapshot(p_hash, p_datasets_gz, p_size, p_summary, p_settings, p_title, p_auto);
  return jsonb_build_object('ok', true, 'id', r.id::text, 'at', floor(extract(epoch from r.created_at) * 1000), 'title', p_title, 'auto', coalesce(p_auto, false));
end $$;

create or replace function public.gxp_list_snapshots() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x order by x.at desc), '[]'::jsonb) from (
    select n.id::text as id, floor(extract(epoch from n.created_at) * 1000) as at, n.title, n.auto, i.size_bytes as size
      from public.report_snapshots n join public.report_imports i on i.id = n.import_id
     order by n.created_at desc limit 100) x;
$$;

create or replace function public.gxp_get_snapshot(p_id bigint) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('at', floor(extract(epoch from n.created_at) * 1000), 'import_id', n.import_id, 'settings', n.settings, 'datasets_gz', i.datasets_gz)
    from public.report_snapshots n join public.report_imports i on i.id = n.import_id where n.id = p_id;
$$;

create or replace function public.gxp_delete_snapshot(p_key text, p_id bigint) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform public.gxp_require_key(p_key);
  delete from public.report_snapshots where id = p_id;
  perform public.gx_cleanup_imports();
  return jsonb_build_object('ok', true);
end $$;

-- browser (anon / authenticated) may call ONLY the gxp_* functions
revoke all on function public.gxp_open(), public.gxp_require_key(text) from public, anon, authenticated;
grant execute on function public.gxp_open(), public.gxp_require_key(text) to service_role;
do $$
declare f text;
begin
  foreach f in array array[
    'public.gxp_check_key(text)', 'public.gxp_meta()', 'public.gxp_latest()',
    'public.gxp_publish_import(text, text, text, integer, jsonb, jsonb)', 'public.gxp_save_state(text, bigint, jsonb)',
    'public.gxp_save_snapshot(text, text, text, integer, jsonb, jsonb, text, boolean)',
    'public.gxp_list_snapshots()', 'public.gxp_get_snapshot(bigint)', 'public.gxp_delete_snapshot(text, bigint)'] loop
    execute format('revoke all on function %s from public', f);
    execute format('grant execute on function %s to anon, authenticated, service_role', f);
  end loop;
end $$;

-- ===== Helpdesk Performance Report =====
create table if not exists public.perf_reports (
  period     text primary key check (period ~ '^[0-9]{4}-Q[1-4]$'),
  data       jsonb not null default '{}'::jsonb,
  revision   bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.perf_reports enable row level security;
revoke all on table public.perf_reports from public, anon, authenticated;
grant select, insert, update, delete on table public.perf_reports to service_role;

-- simpan dengan cek revisi (409 bila ada perubahan lebih baru dari tab/perangkat lain)
create or replace function public.gx_perf_save(p_period text, p_data jsonb, p_revision bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare cur bigint;
begin
  select revision into cur from public.perf_reports where period = p_period for update;
  if cur is null then
    insert into public.perf_reports(period, data) values (p_period, p_data);
    return jsonb_build_object('ok', true, 'revision', 1);
  end if;
  if p_revision is not null and p_revision <> cur then
    return jsonb_build_object('ok', false, 'conflict', true, 'revision', cur);
  end if;
  update public.perf_reports set data = p_data, revision = cur + 1, updated_at = now() where period = p_period;
  return jsonb_build_object('ok', true, 'revision', cur + 1);
end $$;
revoke all on function public.gx_perf_save(text, jsonb, bigint) from public, anon, authenticated;
grant execute on function public.gx_perf_save(text, jsonb, bigint) to service_role;


-- ===== Helpdesk Employee Directory =====
create table if not exists public.hd_employees (
  id               bigserial primary key,
  full_name        text not null unique,
  employee_id      text,
  birthday         date,
  start_contract   date,
  end_contract     date,
  photo            text,
  active           boolean not null default true,
  contract_history jsonb not null default '[]'::jsonb,
  sort_order       integer not null default 100,
  updated_at       timestamptz not null default now()
);
alter table public.hd_employees enable row level security;
revoke all on table public.hd_employees from public, anon, authenticated;
grant select, insert, update, delete on table public.hd_employees to service_role;
grant usage, select on sequence public.hd_employees_id_seq to service_role;

-- kontrak diperpanjang → kontrak lama disimpan di contract_history, reminder memakai tanggal terbaru
create or replace function public.gx_emp_touch() returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if tg_op = 'UPDATE' and (old.end_contract is distinct from new.end_contract or old.start_contract is distinct from new.start_contract)
     and old.end_contract is not null then
    new.contract_history := coalesce(old.contract_history, '[]'::jsonb)
      || jsonb_build_array(jsonb_build_object('start', old.start_contract, 'end', old.end_contract, 'replaced_at', now()));
  end if;
  return new;
end $$;
drop trigger if exists gx_emp_touch on public.hd_employees;
create trigger gx_emp_touch before insert or update on public.hd_employees for each row execute function public.gx_emp_touch();

alter table public.hd_employees add column if not exists nickname text;
alter table public.hd_employees add column if not exists subdivision text;

-- 7 karyawan Helpdesk + foto existing. Dijalankan ulang = hanya mengisi kolom yang masih kosong (edit dari web tidak tertimpa).
insert into public.hd_employees (full_name, nickname, subdivision, birthday, start_contract, end_contract, photo, sort_order) values
  ('Aulia Sevi Diana',                     null,    'Account Manager', '2002-10-14', '2026-10-05', '2027-04-04', 'photo-aulia-sevi-diana.jpg', 1),
  ('Ni Kadek Desi Mirayani',               null,    'Account Manager', '2000-12-02', '2025-08-04', '2026-11-04', 'photo-ni-kadek-desi-mirayani.jpg', 2),
  ('Devin Bagaskara',                      'Bagas', 'Account Manager', '2005-01-03', '2026-10-04', '2027-10-04', 'photo-devin-bagaskara.jpg', 3),
  ('Kadek Arisita Dhyana Putri',           'Sita',  'Account Manager', '2002-02-22', '2026-01-12', '2026-10-12', 'photo-kadek-arisita-dhyana-putri.jpg', 4),
  ('A.A Ngurah Kiyana Adhisa Oka Pertama', 'Oka',   'Helpdesk',        '2002-09-10', '2026-07-13', '2026-10-13', 'photo-aa-ngurah-kiyana-adhisa-oka-pertama.jpg', 5),
  ('Nilma Syahrani',                       'Rani',  'Helpdesk',        '2000-10-31', '2026-07-20', '2026-10-20', 'photo-nilma-syahrani.jpg', 6),
  ('Gede Dimas Pery Narendra',             null,    'Helpdesk',        '2003-10-30', '2026-09-29', '2026-12-28', 'photo-gede-dimas-pery-narendra.jpg', 7)
on conflict (full_name) do update set
  nickname       = coalesce(public.hd_employees.nickname, excluded.nickname),
  subdivision    = coalesce(public.hd_employees.subdivision, excluded.subdivision),
  birthday       = coalesce(public.hd_employees.birthday, excluded.birthday),
  start_contract = coalesce(public.hd_employees.start_contract, excluded.start_contract),
  end_contract   = coalesce(public.hd_employees.end_contract, excluded.end_contract),
  photo          = coalesce(public.hd_employees.photo, excluded.photo);


-- make the API see the new tables/functions immediately
notify pgrst, 'reload schema';
