-- Free village gifts for doing the Holy Mass step on days in a row (MASS_GIFTS in lib/village/layout.ts).
-- save_village now also keeps these pieces once the child's longest run of Mass days reaches each gift.
-- Run after 007_more_bonus_items.sql.

-- Days in a row needed for each gift; null for anything else.
create or replace function public.mass_gift_days(p_item text)
returns int
language sql
immutable
set search_path = ''
as $$
  select case p_item
    when 'snowflake' then 2
    when 'candy' then 4
    when 'gingerbread' then 6
    when 'socks' then 9
    when 'gift' then 12
  end
$$;

-- The longest run of consecutive day numbers with the Mass step done, for one child in one season.
create or replace function public.mass_run(p_child uuid, p_campaign smallint)
returns int
language sql
stable
set search_path = ''
as $$
  select coalesce(max(n), 0)::int from (
    select count(*) as n
    from (select day, day - row_number() over (order by day) as grp
          from public.day_steps where child_id = p_child and campaign_id = p_campaign and step = 'mass') d
    group by grp
  ) runs
$$;
revoke execute on function public.mass_run(uuid, smallint) from public, anon, authenticated;

create or replace function public.save_village(p_child uuid, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  c      public.advent_campaigns;
  done   int[];
  bought text[];
  run    int;
  xmas   boolean;
  k      text;
  v      jsonb;
  d      int;
  pk     text;
  part   jsonb;
  clean  jsonb := '{}';
  out    jsonb := '{}';
begin
  if not exists (select 1 from public.children where id = p_child and guardian_id = auth.uid()) then
    raise exception 'not your child' using errcode = '42501';
  end if;
  select * into c from public.advent_campaigns where active;
  if not found then
    raise exception 'no active campaign' using errcode = '22023';
  end if;
  if jsonb_typeof(p_data) is distinct from 'object' then
    raise exception 'bad village' using errcode = '22023';
  end if;
  select coalesce(array_agg(day::int), '{}') into done from public.completions where child_id = p_child and campaign_id = c.id;
  select coalesce(array_agg(item), '{}') into bought from public.bonus_unlocks where child_id = p_child and campaign_id = c.id;
  xmas := (now() at time zone c.tz)::date >= c.christmas_date;
  run := public.mass_run(p_child, c.id);

  foreach pk in array array['tall', 'wide'] loop
  part := p_data -> pk;
  clean := '{}';
  if jsonb_typeof(part) = 'object' and (select count(*) from jsonb_object_keys(part)) <= 60 then
  for k, v in select * from jsonb_each(part) loop
    d := public.piece_day(k);
    -- Unlocked: a bought bonus item, a day piece whose task is done (Baby Jesus only from Christmas),
    -- or the Holy Family and the manger on Christmas for everyone.
    if not (
      k = any (bought)
      or run >= coalesce(public.mass_gift_days(k), 999)
      or (d is not null and d = any (done) and (k <> 'baby' or xmas))
      or (xmas and k in ('manger', 'mary', 'joseph', 'baby'))
    ) then
      continue;
    end if;
    if jsonb_typeof(v) is distinct from 'array' or jsonb_array_length(v) <> 3
       or jsonb_typeof(v -> 0) <> 'number' or jsonb_typeof(v -> 1) <> 'number' or jsonb_typeof(v -> 2) <> 'number'
       or (v ->> 0)::numeric not between 0 and 1 or (v ->> 1)::numeric not between 0 and 1
       or abs((v ->> 2)::numeric) > 1000 then
      continue;
    end if;
    clean := clean || jsonb_build_object(k, v);
  end loop;
  end if;
  out := out || jsonb_build_object(pk, clean);
  end loop;

  insert into public.village_layout (child_id, campaign_id, data)
  values (p_child, c.id, out)
  on conflict (child_id, campaign_id) do update set data = excluded.data, updated_at = now();
end;
$$;
revoke execute on function public.save_village(uuid, jsonb) from public, anon;
grant execute on function public.save_village(uuid, jsonb) to authenticated;
