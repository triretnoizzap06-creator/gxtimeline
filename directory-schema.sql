-- Helpdesk Employee Directory — data karyawan (ulang tahun & kontrak). Aman dijalankan ulang.
-- Jalankan di Supabase → SQL Editor → Run.
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

notify pgrst, 'reload schema';
