-- 019: 29-30 November (days 1-2) are trial days. While they last everything earns XP as before; from 1 December
-- (day 3) XP counts only from day 3, so everyone starts again at 0, and the shop (buy_bonus) opens only then.
-- Trial treasures, ticks and ornaments stay. Mirrors TRIAL_DAYS / xpFromDay in lib/game/unlock.ts and earned() in
-- lib/game/xp.ts. Same names, arguments and scoring as 013 / 017 otherwise. Run after 018_27_days.sql.

-- The first day whose XP counts on the campaign's own calendar today: 1 during the trial, then 3.
create or replace function public.xp_from_day(c public.advent_campaigns)
returns int
language sql
stable
set search_path = ''
as $$
  select case when (now() at time zone c.tz)::date - c.start_date + 1 > 2 then 3 else 1 end;
$$;
revoke execute on function public.xp_from_day(public.advent_campaigns) from public, anon, authenticated;

create or replace function public.child_xp(p_child uuid, p_campaign smallint)
returns int
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  c     public.advent_campaigns;
  f     int;
  run   int;
  total int;
begin
  select * into c from public.advent_campaigns where id = p_campaign;
  f := public.xp_from_day(c);

  -- Longest run of tasks done on the date their day opened (catch-ups do not count), from day f.
  select coalesce(max(n), 0) into run from (
    select count(*) as n from (
      select day - row_number() over (order by day) as g
      from public.completions
      where child_id = p_child and campaign_id = c.id and day >= f
        and (completed_at at time zone c.tz)::date = c.start_date + (day - 1)
    ) d group by g
  ) r;

  select
    20 * (select count(*) from public.completions where child_id = p_child and campaign_id = c.id and day >= f)
    + coalesce((select sum(coalesce(xp, case step when 'story' then 5 else 10 end))
                from public.day_steps where child_id = p_child and campaign_id = c.id and day >= f), 0)
    + case when run >= 3 then 25 else 0 end
    + case when run >= 7 then 50 else 0 end
    + case when run >= 14 then 75 else 0 end
    + case when run >= 21 then 100 else 0 end
  into total;
  return total;
end;
$$;

create or replace function public.leaderboard(p_child uuid, p_scope text)
returns table (rank int, nickname text, avatar text, parish text, xp int, me boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  c        public.advent_campaigns;
  f        int;
  myparish uuid;
  parishes uuid[]; -- every parish in the asking child's diocese
begin
  if not exists (select 1 from public.children where id = p_child and guardian_id = auth.uid()) then
    raise exception 'not your child' using errcode = '42501';
  end if;
  if p_scope not in ('parish', 'all') then
    raise exception 'bad scope' using errcode = '22023';
  end if;
  select * into c from public.advent_campaigns where active;
  f := public.xp_from_day(c);
  select parish_id into myparish from public.children where id = p_child;
  select array_agg(s.id) into parishes
  from public.shakhas s join public.meghalas m on m.id = s.meghala_id
  where m.diocese_id = (select m2.diocese_id from public.shakhas s2 join public.meghalas m2 on m2.id = s2.meghala_id where s2.id = myparish);

  return query
  with listed as (
    select ch.id, ch.nickname, ch.avatar_key, ch.parish_id
    from public.children ch
    where ch.id = p_child
       or (ch.on_leaderboard and ch.parish_id = any(parishes)
           and (p_scope = 'all' or ch.parish_id = myparish))
  ),
  tasks as (
    select child_id, count(*) as n from public.completions
    where campaign_id = c.id and day >= f and child_id in (select id from listed) group by child_id
  ),
  steps as (
    select child_id, sum(coalesce(xp, case step when 'story' then 5 else 10 end)) as pts from public.day_steps
    where campaign_id = c.id and day >= f and child_id in (select id from listed) group by child_id
  ),
  -- Longest run of tasks done on the date their day opened (catch-ups do not count).
  runs as (
    select child_id, max(n) as run from (
      select child_id, count(*) as n from (
        select child_id, day - row_number() over (partition by child_id order by day) as g
        from public.completions
        where campaign_id = c.id and day >= f and child_id in (select id from listed)
          and (completed_at at time zone c.tz)::date = c.start_date + (day - 1)
      ) d group by child_id, g
    ) r group by child_id
  ),
  scored as (
    select l.nickname, l.avatar_key as avatar, p.name as parish, l.id = p_child as me,
      (20 * coalesce(t.n, 0) + coalesce(s.pts, 0)
        + case when coalesce(r.run, 0) >= 3 then 25 else 0 end
        + case when coalesce(r.run, 0) >= 7 then 50 else 0 end
        + case when coalesce(r.run, 0) >= 14 then 75 else 0 end
        + case when coalesce(r.run, 0) >= 21 then 100 else 0 end)::int as xp
    from listed l
    left join tasks t on t.child_id = l.id
    left join steps s on s.child_id = l.id
    left join runs r on r.child_id = l.id
    left join public.shakhas p on p.id = l.parish_id
  )
  select r.rank, r.nickname, r.avatar, r.parish, r.xp, r.me from (
    select (rank() over (order by x.xp desc))::int as rank, x.nickname, x.avatar, x.parish, x.xp, x.me from scored x
  ) r
  where r.rank <= 100 or r.me
  order by r.rank;
end;
$$;
revoke execute on function public.leaderboard(uuid, text) from public, anon;
grant execute on function public.leaderboard(uuid, text) to authenticated;

-- The shop opens on 1 December: trial-day XP is about to be reset, so nothing can be bought with it.
create or replace function public.buy_bonus(p_child uuid, p_item text)
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
  if public.bonus_price(p_item) is null then
    raise exception 'unknown item' using errcode = '22023';
  end if;
  select * into c from public.advent_campaigns where active;
  if c.id is null then
    raise exception 'no active campaign' using errcode = '22023';
  end if;
  if public.xp_from_day(c) = 1 then
    raise exception 'shop opens on 1 December' using errcode = '22023';
  end if;
  -- One purchase at a time per child, so two taps cannot both spend the same XP.
  perform 1 from public.children where id = p_child for update;
  if exists (select 1 from public.bonus_unlocks where child_id = p_child and campaign_id = c.id and item = p_item) then
    return;
  end if;
  if public.child_xp(p_child, c.id)
     - coalesce((select sum(public.bonus_price(item)) from public.bonus_unlocks where child_id = p_child and campaign_id = c.id), 0)
     < public.bonus_price(p_item) then
    raise exception 'not enough XP' using errcode = '22023';
  end if;
  insert into public.bonus_unlocks (child_id, campaign_id, item) values (p_child, c.id, p_item);
end;
$$;
revoke execute on function public.buy_bonus(uuid, text) from public, anon;
grant execute on function public.buy_bonus(uuid, text) to authenticated;
