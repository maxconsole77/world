-- =====================================================================
-- World App — Supabase schema & RLS (row owner)
-- =====================================================================

-- (Facoltativo) vincolo soft sulle lingue supportate
-- create type public.lang_code as enum ('it','en','es','de','fr');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,                                        -- informativo
  language text not null default 'en',               -- o: public.lang_code
  destination_language text not null default 'it',   -- o: public.lang_code
  updated_at timestamptz not null default now(),
  constraint profiles_language_chk
    check (language in ('it','en','es','de','fr')),
  constraint profiles_destination_language_chk
    check (destination_language in ('it','en','es','de','fr'))
);

alter table public.profiles enable row level security;

-- RLS: l’utente vede/modifica solo la propria riga
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id);

grant select, insert, update on public.profiles to anon, authenticated;

-- Trigger: crea la riga profilo al signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, language, destination_language, updated_at)
  values (new.id, new.email, 'en', 'it', now())
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- (Facoltativo) indici extra
-- create index if not exists profiles_email_idx on public.profiles (email);
