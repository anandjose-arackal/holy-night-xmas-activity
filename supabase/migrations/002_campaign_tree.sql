-- Seasons, per-season progress and the Christmas tree. Run after 001_init.sql.
-- A new Advent needs only a new advent_campaigns row (and active = true on it), no code change.

create table public.advent_campaigns (
  id             smallint generated always as identity primary key,
  slug           text not null unique,
  start_date     date not null,               -- day 1 opens; day n opens on start_date + (n - 1)
  christmas_date date not null,               -- the finale; Baby Jesus appears
  tz             text not null default 'Asia/Kolkata',
  active         boolean not null default false,
  created_at     timestamptz not null default now(),
  check (christmas_date >= start_date + 24)
);
-- At most one active season.
create unique index advent_campaigns_one_active on public.advent_campaigns (active) where active;

alter table public.advent_campaigns enable row level security;
-- Dates are public. There is no write policy: seasons are managed from the SQL editor or the service role.
create policy campaigns_read on public.advent_campaigns for select to anon, authenticated using (true);

insert into public.advent_campaigns (slug, start_date, christmas_date, tz, active)
values ('advent-2026', '2026-11-29', '2026-12-25', 'Asia/Kolkata', true);

-- Progress belongs to a season.
alter table public.completions add column campaign_id smallint references public.advent_campaigns;
update public.completions set campaign_id = (select id from public.advent_campaigns where active);
alter table public.completions alter column campaign_id set not null;
alter table public.completions drop constraint completions_pkey;
alter table public.completions add primary key (child_id, campaign_id, day);

create or replace function public.complete_mission(p_child uuid, p_day int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  c public.advent_campaigns;
begin
  if not exists (
    select 1 from public.children where id = p_child and guardian_id = auth.uid()
  ) then
    raise exception 'not your child' using errcode = '42501';
  end if;

  if p_day is null or p_day not between 1 and 25 then
    raise exception 'bad day' using errcode = '22023';
  end if;

  select * into c from public.advent_campaigns where active;
  if not found then
    raise exception 'no active campaign' using errcode = '22023';
  end if;

  -- The date is counted in the campaign's time zone, the same way the app counts it.
  if (now() at time zone c.tz)::date < c.start_date + (p_day - 1) then
    raise exception 'day locked' using errcode = '22023';
  end if;

  -- The primary key makes a retried request harmless.
  insert into public.completions (child_id, campaign_id, day)
  values (p_child, c.id, p_day)
  on conflict do nothing;
end;
$$;

-- One saved tree per child and season.
create table public.tree_decorations (
  child_id    uuid not null references public.children on delete cascade,
  campaign_id smallint not null references public.advent_campaigns,
  data        jsonb not null,
  updated_at  timestamptz not null default now(),
  primary key (child_id, campaign_id)
);
alter table public.tree_decorations enable row level security;

-- Read only. Rows are written by save_tree(), which checks every ornament.
create policy tree_read on public.tree_decorations
  for select to authenticated
  using (exists (
    select 1 from public.children c
    where c.id = child_id and c.guardian_id = (select auth.uid())
  ));

-- Day numbers mirror lib/tree.ts (ORNAMENTS, LIGHT_COLORS). Change both together.
create function public.save_tree(p_child uuid, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  camp  smallint;
  done  int[];
  item  jsonb;
  need  int;
  a     int;
  seen  int[] := '{}';
  clean jsonb := '[]';
begin
  if not exists (
    select 1 from public.children where id = p_child and guardian_id = auth.uid()
  ) then
    raise exception 'not your child' using errcode = '42501';
  end if;

  select id into camp from public.advent_campaigns where active;
  if camp is null then
    raise exception 'no active campaign' using errcode = '22023';
  end if;
  select coalesce(array_agg(day::int), '{}') into done
  from public.completions where child_id = p_child and campaign_id = camp;

  if jsonb_typeof(p_data -> 'items') is distinct from 'array'
     or jsonb_array_length(p_data -> 'items') > 80
     or jsonb_typeof(p_data -> 'lights') is distinct from 'boolean' then
    raise exception 'bad tree' using errcode = '22023';
  end if;

  need := case p_data ->> 'color' when 'champagne' then 2 when 'multi' then 7 when 'candle' then 14 end;
  if need is null or ((p_data -> 'lights')::boolean and not (2 = any (done) and need = any (done))) then
    raise exception 'lights locked' using errcode = '22023';
  end if;

  for item in select * from jsonb_array_elements(p_data -> 'items') loop
    need := case item ->> 'k'
      when 'red' then 3 when 'gold' then 4 when 'ribbon' then 5 when 'bell' then 6
      when 'green' then 8 when 'white' then 9 when 'star' then 11 when 'blue' then 12
      when 'snowflake' then 13 when 'shepherd' then 15 when 'wood' then 16 when 'sheep' then 17
      when 'silverbell' then 18 when 'angel' then 19 when 'blueribbon' then 20
      when 'goldribbon' then 21 when 'goldstar' then 22 when 'dove' then 23
    end;
    if need is null or not need = any (done) then
      raise exception 'ornament locked' using errcode = '22023';
    end if;
    if jsonb_typeof(item -> 'a') is distinct from 'number' or (item ->> 'a') !~ '^\d{1,3}$' then
      raise exception 'bad branch' using errcode = '22023';
    end if;
    a := (item ->> 'a')::int;
    if a >= 200 or a = any (seen) then
      raise exception 'bad branch' using errcode = '22023';
    end if;
    seen := seen || a;
    clean := clean || jsonb_build_object('k', item ->> 'k', 'a', a);
  end loop;

  insert into public.tree_decorations (child_id, campaign_id, data)
  values (p_child, camp, jsonb_build_object('v', 1, 'items', clean, 'lights', p_data -> 'lights', 'color', p_data ->> 'color'))
  on conflict (child_id, campaign_id) do update set data = excluded.data, updated_at = now();
end;
$$;

revoke execute on function public.save_tree(uuid, jsonb) from public, anon;
grant execute on function public.save_tree(uuid, jsonb) to authenticated;
