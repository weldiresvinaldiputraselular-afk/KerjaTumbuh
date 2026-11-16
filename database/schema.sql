-- =====================================================================
-- KerjaTumbuh - Skema Database (PostgreSQL / Supabase)
-- Jalankan seluruh file ini di Supabase: SQL Editor > New query > Run
-- Disusun untuk proyek Supabase baru (kosong).
-- =====================================================================

-- ---------- TABEL ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'seeker' check (role in ('seeker','umkm','admin')),
  full_name text not null default '',
  email text,
  is_active boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.job_seekers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  headline text,
  bio text,
  city text,
  education_level text,
  years_experience int not null default 0 check (years_experience between 0 and 60)
);

create table if not exists public.umkm_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  business_name text not null,
  sector text,
  city text,
  description text,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified','pending','verified','rejected')),
  is_demo boolean not null default false
);

create table if not exists public.skills (
  id int generated always as identity primary key,
  name text not null unique,
  category text not null default 'Umum'
);

create table if not exists public.seeker_skills (
  seeker_id uuid not null references public.job_seekers(id) on delete cascade,
  skill_id int not null references public.skills(id) on delete cascade,
  level int not null default 3 check (level between 1 and 5),
  primary key (seeker_id, skill_id)
);

create table if not exists public.seeker_experiences (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references public.job_seekers(id) on delete cascade,
  title text not null,
  organization text,
  description text,
  start_year int,
  end_year int
);

create table if not exists public.seeker_portfolios (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references public.job_seekers(id) on delete cascade,
  title text not null,
  description text,
  url text
);

create table if not exists public.job_vacancies (
  id uuid primary key default gen_random_uuid(),
  umkm_id uuid not null references public.umkm_profiles(id) on delete cascade,
  title text not null,
  description text not null,
  city text,
  work_type text not null default 'full_time'
    check (work_type in ('full_time','part_time','magang','freelance','remote')),
  min_experience int not null default 0 check (min_experience between 0 and 40),
  positions int not null default 1 check (positions between 1 and 1000),
  salary_note text,
  status text not null default 'draft'
    check (status in ('draft','pending','verified','rejected','filled')),
  review_note text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.vacancy_skills (
  vacancy_id uuid not null references public.job_vacancies(id) on delete cascade,
  skill_id int not null references public.skills(id) on delete cascade,
  primary key (vacancy_id, skill_id)
);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  vacancy_id uuid not null references public.job_vacancies(id) on delete cascade,
  seeker_id uuid not null references public.job_seekers(id) on delete cascade,
  cover_note text,
  status text not null default 'submitted'
    check (status in ('submitted','reviewed','interview','accepted','rejected')),
  match_score int check (match_score between 0 and 100),
  created_at timestamptz not null default now(),
  unique (vacancy_id, seeker_id)
);

create table if not exists public.learning_resources (
  id uuid primary key default gen_random_uuid(),
  skill_id int not null references public.skills(id) on delete cascade,
  title text not null,
  url text not null,
  level text not null default 'Pemula',
  provider text
);

create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('umkm','vacancy')),
  target_id uuid not null,
  admin_id uuid references public.profiles(id) on delete set null,
  decision text not null check (decision in ('approved','rejected')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  vacancy_id uuid not null references public.job_vacancies(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at timestamptz not null default now(),
  unique (vacancy_id, reporter_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_vacancies_status on public.job_vacancies(status);
create index if not exists idx_vacancies_umkm on public.job_vacancies(umkm_id);
create index if not exists idx_applications_vacancy on public.job_applications(vacancy_id);
create index if not exists idx_applications_seeker on public.job_applications(seeker_id);
create index if not exists idx_notifications_profile on public.notifications(profile_id, is_read);

-- ---------- FUNGSI BANTU (security definer agar RLS tidak rekursif) ----------
create or replace function public.app_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.my_seeker_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.job_seekers where profile_id = auth.uid()
$$;

create or replace function public.my_umkm_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.umkm_profiles where profile_id = auth.uid()
$$;

create or replace function public.owns_vacancy(vid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.job_vacancies v
                 where v.id = vid and v.umkm_id = public.my_umkm_id())
$$;

create or replace function public.vacancy_is_verified(vid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.job_vacancies v where v.id = vid and v.status = 'verified')
$$;

-- UMKM boleh melihat data pencari kerja yang melamar ke lowongan miliknya
create or replace function public.umkm_sees_seeker(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.job_applications a
    join public.job_vacancies v on v.id = a.vacancy_id
    where a.seeker_id = sid and v.umkm_id = public.my_umkm_id())
$$;

create or replace function public.umkm_sees_profile(pid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.job_seekers s
    where s.profile_id = pid and public.umkm_sees_seeker(s.id))
$$;

-- Statistik dampak ekonomi (hanya angka agregat, tanpa data pribadi)
create or replace function public.impact_stats() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'vacancies', (select count(*) from public.job_vacancies where status in ('verified','filled')),
    'seekers',   (select count(*) from public.job_seekers),
    'umkm',      (select count(*) from public.umkm_profiles),
    'applications', (select count(*) from public.job_applications),
    'filled',    (select count(*) from public.job_vacancies where status = 'filled'),
    'monthly', (
      select coalesce(json_agg(json_build_object(
          'month', to_char(m, 'YYYY-MM'),
          'applications', (select count(*) from public.job_applications a where date_trunc('month', a.created_at) = m),
          'vacancies', (select count(*) from public.job_vacancies v where v.status in ('verified','filled') and date_trunc('month', v.created_at) = m)
        ) order by m), '[]'::json)
      from generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') as m)
  )
$$;
grant execute on function public.impact_stats() to anon, authenticated;

-- ---------- TRIGGER: pengguna baru ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare r text := coalesce(new.raw_user_meta_data->>'role', 'seeker');
begin
  if r not in ('seeker','umkm') then r := 'seeker'; end if;  -- admin tidak bisa dipilih sendiri
  insert into public.profiles (id, role, full_name, email)
  values (new.id, r, coalesce(nullif(new.raw_user_meta_data->>'full_name',''), split_part(new.email,'@',1)), new.email);
  if r = 'seeker' then
    insert into public.job_seekers (profile_id) values (new.id);
  else
    insert into public.umkm_profiles (profile_id, business_name)
    values (new.id, coalesce(nullif(new.raw_user_meta_data->>'business_name',''), 'Usaha baru'));
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- TRIGGER: penjaga status ----------
create or replace function public.guard_vacancy() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and public.app_role() is distinct from 'admin' then
    if tg_op = 'INSERT' then
      if new.status not in ('draft','pending') then
        raise exception 'Status awal lowongan harus draft atau pending';
      end if;
    elsif tg_op = 'UPDATE' then
      if new.status is distinct from old.status and new.status in ('verified','rejected') then
        raise exception 'Hanya administrator yang dapat memverifikasi lowongan';
      end if;
      if old.status = 'verified' and new.status = 'verified'
         and (new.title, new.description, new.city, new.work_type)
             is distinct from (old.title, old.description, old.city, old.work_type) then
        new.status := 'pending';  -- konten berubah: wajib diverifikasi ulang
      end if;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_guard_vacancy on public.job_vacancies;
create trigger trg_guard_vacancy before insert or update on public.job_vacancies
  for each row execute function public.guard_vacancy();

create or replace function public.guard_umkm() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and public.app_role() is distinct from 'admin'
     and new.verification_status is distinct from old.verification_status
     and new.verification_status in ('verified','rejected') then
    raise exception 'Hanya administrator yang dapat memverifikasi usaha';
  end if;
  return new;
end $$;
drop trigger if exists trg_guard_umkm on public.umkm_profiles;
create trigger trg_guard_umkm before update on public.umkm_profiles
  for each row execute function public.guard_umkm();

-- ---------- TRIGGER: notifikasi dalam aplikasi ----------
create or replace function public.notify_new_application() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (profile_id, message, link)
  select u.profile_id, 'Pelamar baru untuk lowongan: ' || v.title, '/umkm/lowongan/' || v.id || '/pelamar'
  from public.job_vacancies v join public.umkm_profiles u on u.id = v.umkm_id
  where v.id = new.vacancy_id;
  return new;
end $$;
drop trigger if exists trg_notify_new_application on public.job_applications;
create trigger trg_notify_new_application after insert on public.job_applications
  for each row execute function public.notify_new_application();

create or replace function public.notify_application_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.notifications (profile_id, message, link)
    select s.profile_id, 'Status lamaran "' || v.title || '" menjadi: ' || new.status, '/lowongan/' || v.id
    from public.job_seekers s, public.job_vacancies v
    where s.id = new.seeker_id and v.id = new.vacancy_id;
  end if;
  return new;
end $$;
drop trigger if exists trg_notify_application_status on public.job_applications;
create trigger trg_notify_application_status after update on public.job_applications
  for each row execute function public.notify_application_status();

create or replace function public.notify_vacancy_review() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status and new.status in ('verified','rejected') then
    insert into public.notifications (profile_id, message, link)
    select u.profile_id,
           'Lowongan "' || new.title || '" ' || case when new.status = 'verified' then 'disetujui (Verified).' else 'ditolak. Lihat catatan admin.' end,
           '/umkm/lowongan'
    from public.umkm_profiles u where u.id = new.umkm_id;
  end if;
  return new;
end $$;
drop trigger if exists trg_notify_vacancy_review on public.job_vacancies;
create trigger trg_notify_vacancy_review after update on public.job_vacancies
  for each row execute function public.notify_vacancy_review();

-- ---------- ROW LEVEL SECURITY ----------
alter table public.profiles           enable row level security;
alter table public.job_seekers        enable row level security;
alter table public.umkm_profiles      enable row level security;
alter table public.skills             enable row level security;
alter table public.seeker_skills      enable row level security;
alter table public.seeker_experiences enable row level security;
alter table public.seeker_portfolios  enable row level security;
alter table public.job_vacancies      enable row level security;
alter table public.vacancy_skills     enable row level security;
alter table public.job_applications   enable row level security;
alter table public.learning_resources enable row level security;
alter table public.verifications      enable row level security;
alter table public.reports            enable row level security;
alter table public.notifications      enable row level security;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.app_role() = 'admin' or public.umkm_sees_profile(id));
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.app_role());
drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles for update to authenticated
  using (public.app_role() = 'admin') with check (public.app_role() = 'admin');

-- job_seekers
drop policy if exists seekers_select on public.job_seekers;
create policy seekers_select on public.job_seekers for select to authenticated
  using (profile_id = auth.uid() or public.app_role() = 'admin' or public.umkm_sees_seeker(id));
drop policy if exists seekers_update_own on public.job_seekers;
create policy seekers_update_own on public.job_seekers for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- umkm_profiles (nama usaha publik; status verifikasi dijaga trigger)
drop policy if exists umkm_select on public.umkm_profiles;
create policy umkm_select on public.umkm_profiles for select to anon, authenticated using (true);
drop policy if exists umkm_update_own on public.umkm_profiles;
create policy umkm_update_own on public.umkm_profiles for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
drop policy if exists umkm_update_admin on public.umkm_profiles;
create policy umkm_update_admin on public.umkm_profiles for update to authenticated
  using (public.app_role() = 'admin') with check (public.app_role() = 'admin');

-- skills & learning_resources (baca publik, tulis admin)
drop policy if exists skills_select on public.skills;
create policy skills_select on public.skills for select to anon, authenticated using (true);
drop policy if exists skills_admin on public.skills;
create policy skills_admin on public.skills for all to authenticated
  using (public.app_role() = 'admin') with check (public.app_role() = 'admin');
drop policy if exists resources_select on public.learning_resources;
create policy resources_select on public.learning_resources for select to anon, authenticated using (true);
drop policy if exists resources_admin on public.learning_resources;
create policy resources_admin on public.learning_resources for all to authenticated
  using (public.app_role() = 'admin') with check (public.app_role() = 'admin');

-- seeker_skills / experiences / portfolios
drop policy if exists sskills_select on public.seeker_skills;
create policy sskills_select on public.seeker_skills for select to authenticated
  using (seeker_id = public.my_seeker_id() or public.app_role() = 'admin' or public.umkm_sees_seeker(seeker_id));
drop policy if exists sskills_write on public.seeker_skills;
create policy sskills_write on public.seeker_skills for all to authenticated
  using (seeker_id = public.my_seeker_id()) with check (seeker_id = public.my_seeker_id());

drop policy if exists sexp_select on public.seeker_experiences;
create policy sexp_select on public.seeker_experiences for select to authenticated
  using (seeker_id = public.my_seeker_id() or public.app_role() = 'admin' or public.umkm_sees_seeker(seeker_id));
drop policy if exists sexp_write on public.seeker_experiences;
create policy sexp_write on public.seeker_experiences for all to authenticated
  using (seeker_id = public.my_seeker_id()) with check (seeker_id = public.my_seeker_id());

drop policy if exists sport_select on public.seeker_portfolios;
create policy sport_select on public.seeker_portfolios for select to authenticated
  using (seeker_id = public.my_seeker_id() or public.app_role() = 'admin' or public.umkm_sees_seeker(seeker_id));
drop policy if exists sport_write on public.seeker_portfolios;
create policy sport_write on public.seeker_portfolios for all to authenticated
  using (seeker_id = public.my_seeker_id()) with check (seeker_id = public.my_seeker_id());

-- job_vacancies
drop policy if exists vac_select on public.job_vacancies;
create policy vac_select on public.job_vacancies for select to anon, authenticated
  using (status = 'verified' or umkm_id = public.my_umkm_id() or public.app_role() = 'admin');
drop policy if exists vac_insert on public.job_vacancies;
create policy vac_insert on public.job_vacancies for insert to authenticated
  with check (public.app_role() = 'umkm' and umkm_id = public.my_umkm_id());
drop policy if exists vac_update_own on public.job_vacancies;
create policy vac_update_own on public.job_vacancies for update to authenticated
  using (umkm_id = public.my_umkm_id()) with check (umkm_id = public.my_umkm_id());
drop policy if exists vac_delete_own on public.job_vacancies;
create policy vac_delete_own on public.job_vacancies for delete to authenticated
  using (umkm_id = public.my_umkm_id());
drop policy if exists vac_admin on public.job_vacancies;
create policy vac_admin on public.job_vacancies for update to authenticated
  using (public.app_role() = 'admin') with check (public.app_role() = 'admin');

-- vacancy_skills
drop policy if exists vskills_select on public.vacancy_skills;
create policy vskills_select on public.vacancy_skills for select to anon, authenticated using (true);
drop policy if exists vskills_write on public.vacancy_skills;
create policy vskills_write on public.vacancy_skills for all to authenticated
  using (public.owns_vacancy(vacancy_id)) with check (public.owns_vacancy(vacancy_id));

-- job_applications
drop policy if exists app_select on public.job_applications;
create policy app_select on public.job_applications for select to authenticated
  using (seeker_id = public.my_seeker_id() or public.owns_vacancy(vacancy_id) or public.app_role() = 'admin');
drop policy if exists app_insert on public.job_applications;
create policy app_insert on public.job_applications for insert to authenticated
  with check (seeker_id = public.my_seeker_id() and public.vacancy_is_verified(vacancy_id));
drop policy if exists app_update_umkm on public.job_applications;
create policy app_update_umkm on public.job_applications for update to authenticated
  using (public.owns_vacancy(vacancy_id)) with check (public.owns_vacancy(vacancy_id));

-- verifications (hanya admin)
drop policy if exists ver_admin on public.verifications;
create policy ver_admin on public.verifications for all to authenticated
  using (public.app_role() = 'admin') with check (public.app_role() = 'admin');

-- reports
drop policy if exists rep_insert on public.reports;
create policy rep_insert on public.reports for insert to authenticated
  with check (reporter_id = auth.uid() and public.app_role() = 'seeker');
drop policy if exists rep_select on public.reports;
create policy rep_select on public.reports for select to authenticated
  using (reporter_id = auth.uid() or public.app_role() = 'admin');
drop policy if exists rep_update_admin on public.reports;
create policy rep_update_admin on public.reports for update to authenticated
  using (public.app_role() = 'admin') with check (public.app_role() = 'admin');

-- notifications
drop policy if exists notif_select on public.notifications;
create policy notif_select on public.notifications for select to authenticated using (profile_id = auth.uid());
drop policy if exists notif_update on public.notifications;
create policy notif_update on public.notifications for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
