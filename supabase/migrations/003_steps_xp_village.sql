-- Day steps (read, Mass, story), XP and the bonus shop, the child's village layout, parishes and the leaderboard.
-- Run after 002_campaign_tree.sql. XP rules and prices mirror lib/game/xp.ts; day pieces mirror REWARDS in
-- lib/village/layout.ts. Change both together.

-- ---- Parish and the leaderboard choice ----
-- The parish is a shakha of the fest_hub database this app shares: dioceses -> meghalas -> shakhas.
-- Those tables (and their public read policies) must exist before this file runs.
alter table public.children add column parish_id uuid references public.shakhas on delete set null;
-- Off by default: a parent chooses whether the child's nickname appears on the leaderboard.
alter table public.children add column on_leaderboard boolean not null default false;

-- ---- Day steps other than the task (the task stays in completions) ----
create table public.day_steps (
  child_id    uuid not null references public.children on delete cascade,
  campaign_id smallint not null references public.advent_campaigns,
  day         smallint not null check (day between 1 and 25),
  step        text not null check (step in ('read', 'mass', 'story')),
  done_at     timestamptz not null default now(),
  primary key (child_id, campaign_id, day, step)
);
alter table public.day_steps enable row level security;
create policy day_steps_read on public.day_steps
  for select to authenticated
  using (exists (select 1 from public.children c where c.id = child_id and c.guardian_id = (select auth.uid())));

create function public.complete_step(p_child uuid, p_day int, p_step text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  c public.advent_campaigns;
begin
  if not exists (select 1 from public.children where id = p_child and guardian_id = auth.uid()) then
    raise exception 'not your child' using errcode = '42501';
  end if;
  if p_day is null or p_day not between 1 and 25 or p_step is null or p_step not in ('read', 'mass', 'story') then
    raise exception 'bad step' using errcode = '22023';
  end if;
  select * into c from public.advent_campaigns where active;
  if not found then
    raise exception 'no active campaign' using errcode = '22023';
  end if;
  if (now() at time zone c.tz)::date < c.start_date + (p_day - 1) then
    raise exception 'day locked' using errcode = '22023';
  end if;
  insert into public.day_steps (child_id, campaign_id, day, step)
  values (p_child, c.id, p_day, p_step)
  on conflict do nothing;
end;
$$;
revoke execute on function public.complete_step(uuid, int, text) from public, anon;
grant execute on function public.complete_step(uuid, int, text) to authenticated;

-- ---- XP ----
create function public.bonus_price(p_item text)
returns int
language sql
immutable
set search_path = ''
as $$
  select case
    when p_item = 'snowman' then 40
    when p_item = 'reindeer' then 80
    when p_item = 'santa' then 120
    when p_item = 'sheep' then 60
    when p_item = 'lamb' then 50
    when p_item = 'angel' then 100
    when p_item = 'trumpetAngel' then 100
    when p_item = 'candle' then 30
    when p_item = 'firewood' then 30
    when p_item ~ '^decor[0-8]$' then 30
  end
$$;

-- XP earned (before spending), for one child in one season: the leaderboard ranks by this, so buying never lowers a rank.
-- Internal: called by the functions below only.
create function public.child_xp(p_child uuid, p_campaign smallint)
returns int
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  c     public.advent_campaigns;
  run   int;
  total int;
begin
  select * into c from public.advent_campaigns where id = p_campaign;

  -- Longest run of tasks done on the date their day opened (catch-ups do not count).
  select coalesce(max(n), 0) into run from (
    select count(*) as n from (
      select day - row_number() over (order by day) as g
      from public.completions
      where child_id = p_child and campaign_id = c.id
        and (completed_at at time zone c.tz)::date = c.start_date + (day - 1)
    ) d group by g
  ) r;

  select
    20 * (select count(*) from public.completions where child_id = p_child and campaign_id = c.id)
    + coalesce((select sum(case step when 'story' then 5 else 10 end)
                from public.day_steps where child_id = p_child and campaign_id = c.id), 0)
    + case when run >= 3 then 25 else 0 end
    + case when run >= 7 then 50 else 0 end
    + case when run >= 14 then 75 else 0 end
    + case when run >= 21 then 100 else 0 end
  into total;
  return total;
end;
$$;

-- ---- Bonus shop ----
create table public.bonus_unlocks (
  child_id    uuid not null references public.children on delete cascade,
  campaign_id smallint not null references public.advent_campaigns,
  item        text not null check (public.bonus_price(item) is not null),
  bought_at   timestamptz not null default now(),
  primary key (child_id, campaign_id, item)
);
alter table public.bonus_unlocks enable row level security;
create policy bonus_read on public.bonus_unlocks
  for select to authenticated
  using (exists (select 1 from public.children c where c.id = child_id and c.guardian_id = (select auth.uid())));

revoke execute on function public.child_xp(uuid, smallint) from public, anon, authenticated;

create function public.buy_bonus(p_child uuid, p_item text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  camp smallint;
begin
  if not exists (select 1 from public.children where id = p_child and guardian_id = auth.uid()) then
    raise exception 'not your child' using errcode = '42501';
  end if;
  if public.bonus_price(p_item) is null then
    raise exception 'unknown item' using errcode = '22023';
  end if;
  select id into camp from public.advent_campaigns where active;
  if camp is null then
    raise exception 'no active campaign' using errcode = '22023';
  end if;
  -- One purchase at a time per child, so two taps cannot both spend the same XP.
  perform 1 from public.children where id = p_child for update;
  if exists (select 1 from public.bonus_unlocks where child_id = p_child and campaign_id = camp and item = p_item) then
    return;
  end if;
  if public.child_xp(p_child, camp)
     - coalesce((select sum(public.bonus_price(item)) from public.bonus_unlocks where child_id = p_child and campaign_id = camp), 0)
     < public.bonus_price(p_item) then
    raise exception 'not enough XP' using errcode = '22023';
  end if;
  insert into public.bonus_unlocks (child_id, campaign_id, item) values (p_child, camp, p_item);
end;
$$;
revoke execute on function public.buy_bonus(uuid, text) from public, anon;
grant execute on function public.buy_bonus(uuid, text) to authenticated;

-- ---- The child's village: where each placed piece stands ----
create table public.village_layout (
  child_id    uuid not null references public.children on delete cascade,
  campaign_id smallint not null references public.advent_campaigns,
  data        jsonb not null, -- {"tall": {piece: [u, v, turn]}, "wide": {...}}: spots are per painting
  updated_at  timestamptz not null default now(),
  primary key (child_id, campaign_id)
);
alter table public.village_layout enable row level security;
create policy village_read on public.village_layout
  for select to authenticated
  using (exists (select 1 from public.children c where c.id = child_id and c.guardian_id = (select auth.uid())));

-- Day of each village treasure; mirrors REWARDS in lib/village/layout.ts.
create function public.piece_day(p_key text)
returns int
language sql
immutable
set search_path = ''
as $$
  select case p_key
    when 'tree' then 1 when 'olive' then 2 when 'wreath' then 3 when 'fire' then 4 when 'bell' then 5
    when 'lilies' then 6 when 'jar' then 7 when 'lantern' then 8 when 'hay' then 9 when 'manger' then 10
    when 'donkey' then 11 when 'ox' then 12 when 'shepherd1' then 13 when 'shepherd2' then 14 when 'camel' then 15
    when 'melchior' then 16 when 'caspar' then 17 when 'balthazar' then 18 when 'gold' then 19
    when 'frankincense' then 20 when 'myrrh' then 21 when 'star' then 22 when 'joseph' then 23
    when 'mary' then 24 when 'baby' then 25
  end
$$;

create function public.save_village(p_child uuid, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  c      public.advent_campaigns;
  done   int[];
  bought text[];
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

-- ---- The tree now unlocks by reading, not by the task ----
-- Day numbers still mirror lib/tree.ts (ORNAMENTS, LIGHT_COLORS). Only the source of "done" changed.
create or replace function public.save_tree(p_child uuid, p_data jsonb)
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
  from public.day_steps where child_id = p_child and campaign_id = camp and step = 'read';

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

-- ---- Leaderboard ----
-- Only nickname, picture key (one of four), parish name and XP leave the database: no ids, no guardian details.
-- Listed: children whose parent opted in. The asking child always gets their own row, listed or not.
create function public.leaderboard(p_child uuid, p_scope text)
returns table (rank int, nickname text, avatar text, parish text, xp int, me boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  camp     smallint;
  myparish uuid;
begin
  if not exists (select 1 from public.children where id = p_child and guardian_id = auth.uid()) then
    raise exception 'not your child' using errcode = '42501';
  end if;
  if p_scope not in ('parish', 'all') then
    raise exception 'bad scope' using errcode = '22023';
  end if;
  select id into camp from public.advent_campaigns where active;
  select parish_id into myparish from public.children where id = p_child;

  return query
  select r.rank, r.nickname, r.avatar, r.parish, r.xp, r.me from (
    select
      (rank() over (order by x.xp desc))::int as rank,
      x.nickname, x.avatar, x.parish, x.xp, x.me
    from (
      select ch.nickname, ch.avatar_key as avatar, p.name as parish, public.child_xp(ch.id, camp) as xp, ch.id = p_child as me
      from public.children ch
      left join public.shakhas p on p.id = ch.parish_id
      where ch.id = p_child
         or (ch.on_leaderboard and (p_scope = 'all' or (myparish is not null and ch.parish_id = myparish)))
    ) x
  ) r
  where r.rank <= 100 or r.me
  order by r.rank;
end;
$$;
revoke execute on function public.leaderboard(uuid, text) from public, anon;
grant execute on function public.leaderboard(uuid, text) to authenticated;
