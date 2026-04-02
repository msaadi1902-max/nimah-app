-- Run this in Supabase SQL Editor
-- Adds quantity column and ensures created_at is present for 3-day expiration tracking.

alter table public.meals
add column if not exists quantity integer not null default 0;

alter table public.meals
add column if not exists created_at timestamptz not null default now();

-- Optional: prevent negative quantities (safe if re-run).
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'meals_quantity_non_negative'
  ) then
    alter table public.meals
    add constraint meals_quantity_non_negative check (quantity >= 0);
  end if;
end $$;
