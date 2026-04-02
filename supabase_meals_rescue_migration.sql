-- Run this in Supabase SQL Editor
-- Adds rescue-meal fields to meals table.

alter table public.meals
add column if not exists is_rescue_meal boolean not null default false;

alter table public.meals
add column if not exists original_price numeric;

-- Optional guard to keep original_price non-negative when provided.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'meals_original_price_non_negative'
  ) then
    alter table public.meals
    add constraint meals_original_price_non_negative
    check (original_price is null or original_price >= 0);
  end if;
end $$;
