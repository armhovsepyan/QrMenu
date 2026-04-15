-- QRMenu Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  restaurant_name text,
  created_at timestamp with time zone default now()
);

-- Menus table
create table public.menus (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  slug text unique not null,
  restaurant_name text not null,
  logo_url text,
  primary_color text default '#F97316',
  created_at timestamp with time zone default now()
);

-- Categories table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  menu_id uuid references public.menus(id) on delete cascade not null,
  name_ru text not null,
  name_hy text,
  name_en text,
  position integer default 0,
  created_at timestamp with time zone default now()
);

-- Items table
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.categories(id) on delete cascade not null,
  name_ru text not null,
  name_hy text,
  name_en text,
  description_ru text,
  description_hy text,
  description_en text,
  price decimal(10, 2) not null default 0,
  currency text default 'AMD',
  image_url text,
  is_available boolean default true,
  position integer default 0,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.menus enable row level security;
alter table public.categories enable row level security;
alter table public.items enable row level security;

-- Users policies
create policy "Users can view own profile"
  on public.users for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert with check (auth.uid() = id);

-- Menus policies
create policy "Users can view own menus"
  on public.menus for select using (auth.uid() = user_id);

create policy "Users can create menus"
  on public.menus for insert with check (auth.uid() = user_id);

create policy "Users can update own menus"
  on public.menus for update using (auth.uid() = user_id);

create policy "Users can delete own menus"
  on public.menus for delete using (auth.uid() = user_id);

create policy "Public menus are viewable by everyone"
  on public.menus for select using (true);

-- Categories policies
create policy "Users can manage own categories"
  on public.categories for all using (
    auth.uid() = (select user_id from public.menus where id = menu_id)
  );

create policy "Public categories are viewable by everyone"
  on public.categories for select using (true);

-- Items policies
create policy "Users can manage own items"
  on public.items for all using (
    auth.uid() = (
      select m.user_id from public.menus m
      join public.categories c on c.menu_id = m.id
      where c.id = category_id
    )
  );

create policy "Public items are viewable by everyone"
  on public.items for select using (true);

-- Storage bucket for menu images
insert into storage.buckets (id, name, public) values ('menu-images', 'menu-images', true)
  on conflict (id) do nothing;

create policy "Anyone can view menu images"
  on storage.objects for select using (bucket_id = 'menu-images');

create policy "Authenticated users can upload menu images"
  on storage.objects for insert with check (
    bucket_id = 'menu-images' and auth.role() = 'authenticated'
  );

create policy "Users can update own menu images"
  on storage.objects for update using (
    bucket_id = 'menu-images' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own menu images"
  on storage.objects for delete using (
    bucket_id = 'menu-images' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();