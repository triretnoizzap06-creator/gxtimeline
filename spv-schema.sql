-- Dashboard SPV Helpdesk — to-do list (bisa di-assign ke tim Helpdesk / AM) + dokumen editable + quiz Knowledge Base.
-- Aman dijalankan ulang. Jalankan di Supabase → SQL Editor → Run (sekali saja).
create extension if not exists pgcrypto;

create table if not exists public.gx_tasks (
  id         uuid primary key default gen_random_uuid(),
  month      text not null check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  section    text not null default 'ONEOFF' check (section in ('DAILY','WEEKLY','MONTHLY','FERRE','ONEOFF')),
  sort       integer not null default 0,
  category   text not null default '',
  title      text not null,
  links      jsonb not null default '[]'::jsonb,
  priority   text not null default 'Medium' check (priority in ('High','Medium','Low')),
  status     text not null default 'NOT STARTED' check (status in ('NOT STARTED','PLAN','IN PROGRESS','DONE')),
  remarks    text not null default '',
  assignee   text not null default '',
  team       text check (team in ('HD','AM')),
  due        date,
  team_note  text not null default '',
  team_by    text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists gx_tasks_month on public.gx_tasks (month);
create index if not exists gx_tasks_team on public.gx_tasks (team) where team is not null;

create or replace function public.gx_touch() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists gx_tasks_touch on public.gx_tasks;
create trigger gx_tasks_touch before update on public.gx_tasks for each row execute function public.gx_touch();

create table if not exists public.gx_docs (
  key        text primary key check (key ~ '^[a-z0-9-]{3,40}$'),
  data       jsonb not null default '{}'::jsonb,
  revision   bigint not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.gx_tasks enable row level security;
alter table public.gx_docs enable row level security;
revoke all on table public.gx_tasks from public, anon, authenticated;
revoke all on table public.gx_docs from public, anon, authenticated;
grant select, insert, update, delete on table public.gx_tasks to service_role;
grant select, insert, update, delete on table public.gx_docs to service_role;

-- simpan dokumen dengan cek revisi (409 bila ada perubahan lebih baru dari tab/perangkat lain)
create or replace function public.gx_doc_save(p_key text, p_data jsonb, p_revision bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare cur bigint;
begin
  select revision into cur from public.gx_docs where key = p_key for update;
  if cur is null then
    insert into public.gx_docs(key, data) values (p_key, p_data);
    return jsonb_build_object('ok', true, 'revision', 1);
  end if;
  if p_revision is not null and p_revision <> cur then
    return jsonb_build_object('ok', false, 'conflict', true, 'revision', cur);
  end if;
  update public.gx_docs set data = p_data, revision = cur + 1, updated_at = now() where key = p_key;
  return jsonb_build_object('ok', true, 'revision', cur + 1);
end $$;
revoke all on function public.gx_doc_save(text, jsonb, bigint) from public, anon, authenticated;
grant execute on function public.gx_doc_save(text, jsonb, bigint) to service_role;

-- ===== Quiz Knowledge Base (ala Kahoot): sesi quiz + hasil pemain (leaderboard) =====
create table if not exists public.gx_quiz_sessions (
  code       text primary key check (code ~ '^[A-Z0-9]{5,8}$'),
  title      text not null default '',
  set_key    text not null default '',
  timer_s    integer not null default 20 check (timer_s between 5 and 120),
  questions  jsonb not null default '[]'::jsonb,
  status     text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now()
);
create table if not exists public.gx_quiz_results (
  id          uuid primary key default gen_random_uuid(),
  code        text not null references public.gx_quiz_sessions(code) on delete cascade,
  player      text not null,
  score       integer not null default 0,
  correct     integer not null default 0,
  total       integer not null default 0,
  duration_ms integer not null default 0,
  answers     jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);
create unique index if not exists gx_quiz_results_player on public.gx_quiz_results (code, lower(player));
create index if not exists gx_quiz_results_code on public.gx_quiz_results (code, score desc);
alter table public.gx_quiz_sessions enable row level security;
alter table public.gx_quiz_results enable row level security;
revoke all on table public.gx_quiz_sessions from public, anon, authenticated;
revoke all on table public.gx_quiz_results from public, anon, authenticated;
grant select, insert, update, delete on table public.gx_quiz_sessions to service_role;
grant select, insert, update, delete on table public.gx_quiz_results to service_role;

notify pgrst, 'reload schema';
