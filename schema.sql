-- GX27 Operations — Supabase schema
-- Run this whole file once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run: it only creates what is missing and replaces functions/policies.
--
-- Model
--   site_content      two rows: 'draft' (what admins edit) and 'published' (what visitors see)
--   content_versions  every saved draft, so nothing is ever lost (restore from the admin panel)
--   site_admins       who can edit (editor) and who can publish (admin)
--   publish_log       history of saves, publishes and code deploys
-- All writes go through SECURITY DEFINER functions that check the caller's role.

-- ───────────────────────── Tables ─────────────────────────
create table if not exists public.site_content (
  id             text primary key check (id in ('draft', 'published')),
  data           jsonb       not null,
  version        integer     not null default 1,
  source_version integer,                       -- published row: the draft version that went live
  updated_at     timestamptz not null default now(),
  updated_by     text
);

create table if not exists public.content_versions (
  version  integer primary key,
  data     jsonb       not null,
  saved_at timestamptz not null default now(),
  saved_by text
);

create table if not exists public.site_admins (
  email    text primary key check (email = lower(email)),
  role     text not null check (role in ('admin', 'editor')),
  added_at timestamptz not null default now(),
  added_by text
);

create table if not exists public.publish_log (
  id         bigserial primary key,
  kind       text not null check (kind in ('save', 'content', 'deploy')),
  status     text not null check (status in ('Saved', 'Publishing', 'Published', 'Failed')),
  version    integer,
  message    text,
  actor      text,
  created_at timestamptz not null default now()
);

-- ───────────────────────── Role helpers ─────────────────────────
create or replace function public.current_email() returns text
language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.site_admins where email = public.current_email()
$$;

create or replace function public.is_editor() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.my_role() in ('admin', 'editor'), false)
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.my_role() = 'admin', false)
$$;

-- ───────────────────────── Save draft (editors + admins) ─────────────────────────
-- p_base_version = the draft version the editor started from. If someone else saved in
-- between, the call fails with 'conflict:<current version>' unless p_force is true.
-- Every save is also stored in content_versions, so overwriting never loses data.
create or replace function public.save_draft(p_data jsonb, p_base_version integer, p_force boolean default false)
returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_current integer;
  v_next    integer;
begin
  if not public.is_editor() then
    raise exception 'not_authorized';
  end if;
  if p_data is null or jsonb_typeof(p_data -> 'tasks') <> 'array' or jsonb_typeof(p_data -> 'finance') <> 'array' then
    raise exception 'invalid_data: tasks and finance must be arrays';
  end if;

  select version into v_current from public.site_content where id = 'draft' for update;

  if not found then
    v_next := coalesce((select max(version) from public.content_versions), 0) + 1;
    insert into public.site_content (id, data, version, updated_at, updated_by)
    values ('draft', p_data, v_next, now(), public.current_email());
  else
    if not p_force and v_current <> p_base_version then
      raise exception 'conflict:%', v_current;
    end if;
    v_next := greatest(v_current, coalesce((select max(version) from public.content_versions), 0)) + 1;
    update public.site_content
       set data = p_data, version = v_next, updated_at = now(), updated_by = public.current_email()
     where id = 'draft';
  end if;

  insert into public.content_versions (version, data, saved_by) values (v_next, p_data, public.current_email());
  insert into public.publish_log (kind, status, version, actor) values ('save', 'Saved', v_next, public.current_email());
  return v_next;
end;
$$;

-- ───────────────────────── Publish (admins only) ─────────────────────────
-- Copies the saved draft to the published row in one transaction.
create or replace function public.publish_content(p_note text default null)
returns json
language plpgsql security definer set search_path = public as $$
declare
  d public.site_content%rowtype;
begin
  if not public.is_admin() then
    raise exception 'not_authorized: only admins can publish';
  end if;

  select * into d from public.site_content where id = 'draft';
  if not found then
    raise exception 'no_draft: save the content first';
  end if;

  insert into public.site_content (id, data, version, source_version, updated_at, updated_by)
  values ('published', d.data, 1, d.version, now(), public.current_email())
  on conflict (id) do update
     set data = excluded.data,
         version = public.site_content.version + 1,
         source_version = excluded.source_version,
         updated_at = now(),
         updated_by = excluded.updated_by;

  insert into public.publish_log (kind, status, version, message, actor)
  values ('content', 'Published', d.version, p_note, public.current_email());

  return json_build_object('source_version', d.version, 'published_at', now(), 'published_by', public.current_email());
end;
$$;

-- Lets the admin panel record failed publishes and code deploys.
create or replace function public.log_event(p_kind text, p_status text, p_version integer default null, p_message text default null)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_editor() then
    raise exception 'not_authorized';
  end if;
  if p_kind = 'deploy' and not public.is_admin() then
    raise exception 'not_authorized';
  end if;
  insert into public.publish_log (kind, status, version, message, actor)
  values (p_kind, p_status, p_version, left(p_message, 1000), public.current_email());
end;
$$;

-- Team management with a guard against removing the last admin.
create or replace function public.set_admin(p_email text, p_role text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not_authorized'; end if;
  if p_role not in ('admin', 'editor') then raise exception 'invalid_role'; end if;
  if p_role = 'editor' and lower(p_email) in (select email from public.site_admins where role = 'admin')
     and (select count(*) from public.site_admins where role = 'admin') <= 1 then
    raise exception 'last_admin: keep at least one admin';
  end if;
  insert into public.site_admins (email, role, added_by) values (lower(trim(p_email)), p_role, public.current_email())
  on conflict (email) do update set role = excluded.role;
end;
$$;

create or replace function public.remove_admin(p_email text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not_authorized'; end if;
  if lower(p_email) in (select email from public.site_admins where role = 'admin')
     and (select count(*) from public.site_admins where role = 'admin') <= 1 then
    raise exception 'last_admin: keep at least one admin';
  end if;
  delete from public.site_admins where email = lower(p_email);
end;
$$;

-- ───────────────────────── Row Level Security ─────────────────────────
alter table public.site_content     enable row level security;
alter table public.content_versions enable row level security;
alter table public.site_admins      enable row level security;
alter table public.publish_log      enable row level security;

drop policy if exists "read published or editor"  on public.site_content;
create policy "read published or editor" on public.site_content
  for select using (id = 'published' or public.is_editor());

drop policy if exists "editors read versions" on public.content_versions;
create policy "editors read versions" on public.content_versions
  for select using (public.is_editor());

drop policy if exists "editors read team" on public.site_admins;
create policy "editors read team" on public.site_admins
  for select using (public.is_editor());

drop policy if exists "editors read log" on public.publish_log;
create policy "editors read log" on public.publish_log
  for select using (public.is_editor());
-- No insert/update/delete policies: writes only happen through the functions above.

grant execute on function public.my_role, public.is_editor, public.is_admin, public.save_draft,
  public.publish_content, public.log_event, public.set_admin, public.remove_admin to authenticated;
grant execute on function public.my_role to anon;

-- ───────────────────────── Storage (logo uploads) ─────────────────────────
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "site-assets public read"  on storage.objects;
create policy "site-assets public read" on storage.objects
  for select using (bucket_id = 'site-assets');

drop policy if exists "site-assets editors write" on storage.objects;
create policy "site-assets editors write" on storage.objects
  for insert to authenticated with check (bucket_id = 'site-assets' and public.is_editor());

-- ───────────────────────── Realtime ─────────────────────────
-- Visitors get the published row live; editors also get draft changes (RLS applies).
do $$
begin
  alter publication supabase_realtime add table public.site_content;
exception when duplicate_object then null;
end $$;

-- ───────────────────────── First admin ─────────────────────────
-- Replace the email below with yours, then run this line (or run it separately later).
-- insert into public.site_admins (email, role) values ('your.email@example.com', 'admin')
--   on conflict (email) do update set role = 'admin';
