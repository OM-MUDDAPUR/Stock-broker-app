-- Create users profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamp with time zone default now()
);

-- Create supported stocks table
create table if not exists public.supported_stocks (
  id uuid primary key default gen_random_uuid(),
  ticker text unique not null,
  name text not null,
  created_at timestamp with time zone default now()
);

-- Create user subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stock_id uuid not null references public.supported_stocks(id) on delete cascade,
  current_price decimal(10, 2) default 100.00,
  price_change decimal(10, 2) default 0,
  price_change_percent decimal(5, 2) default 0,
  subscribed_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, stock_id)
);

-- Insert default supported stocks
insert into public.supported_stocks (ticker, name) values
  ('GOOG', 'Google'),
  ('TSLA', 'Tesla'),
  ('AMZN', 'Amazon'),
  ('META', 'Meta'),
  ('NVDA', 'NVIDIA')
on conflict do nothing;

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.supported_stocks enable row level security;

-- Profiles policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Subscriptions policies
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "subscriptions_insert_own"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "subscriptions_delete_own"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

create policy "subscriptions_update_own"
  on public.subscriptions for update
  using (auth.uid() = user_id);

-- Supported stocks - allow all authenticated users to read
create policy "supported_stocks_select"
  on public.supported_stocks for select
  using (true);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (
    new.id,
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
