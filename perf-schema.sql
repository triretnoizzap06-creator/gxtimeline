-- Helpdesk Performance Report (Best Employee) — tabel data per periode (mis. 2026-Q2).
-- Aman dijalankan ulang. Jalankan di Supabase → SQL Editor → Run.
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

notify pgrst, 'reload schema';
