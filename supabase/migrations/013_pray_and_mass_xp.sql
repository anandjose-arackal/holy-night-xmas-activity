-- 013: Pray now (voice prayer) and Mass in church vs at home.
-- XP for a step is now stored on its day_steps row: Mass in church 30, at home 15; a prayer set pays 1 per
-- repetition (max 30), +10 for a big prayer, and a voice bonus when speech was detected (+5, or +10 with a big prayer).
-- Rows from before this migration have null xp and keep the old rate (read and Mass 10, story 5), so no one loses XP.
-- Mirrors lib/game/xp.ts and prayXp in lib/voice/accumulator.ts: change them together. Run after 012_mass_on_the_day.sql.

alter table public.day_steps
  drop constraint day_steps_step_check,
  add constraint day_steps_step_check check (step in ('read', 'mass', 'story', 'pray')),
  add column xp smallint check (xp between 0 and 50),
  add column speech_seconds smallint check (speech_seconds between 0 and 600); -- null = no voice check. Never audio.

-- Same checks as before, plus where the child went to Mass. Old clients (no p_church) get the home rate.
drop function public.complete_step(uuid, int, text);
create function public.complete_step(p_child uuid, p_day int, p_step text, p_church boolean default null)
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
  insert into public.day_steps (child_id, campaign_id, day, step, xp)
  values (p_child, c.id, p_day, p_step,
          case p_step when 'read' then 10 when 'story' then 5 else case when p_church then 30 else 15 end end)
  on conflict do nothing;
end;
$$;
revoke execute on function public.complete_step(uuid, int, text, boolean) from public, anon;
grant execute on function public.complete_step(uuid, int, text, boolean) to authenticated;

-- A day's prayer set. The server prices it (capped at 50) so a client cannot claim more.
-- A manual "I prayed" can later be upgraded once by a voice-checked one; nothing pays twice.
create function public.complete_prayer(p_child uuid, p_day int, p_reps int, p_big boolean, p_speech_seconds int default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  c  public.advent_campaigns;
  pts int;
begin
  if not exists (select 1 from public.children where id = p_child and guardian_id = auth.uid()) then
    raise exception 'not your child' using errcode = '42501';
  end if;
  if p_day is null or p_day not between 1 and 25 or p_reps is null or p_reps not between 0 and 30
     or p_speech_seconds not between 0 and 600 then
    raise exception 'bad prayer' using errcode = '22023';
  end if;
  select * into c from public.advent_campaigns where active;
  if not found then
    raise exception 'no active campaign' using errcode = '22023';
  end if;
  if (now() at time zone c.tz)::date < c.start_date + (p_day - 1) then
    raise exception 'day locked' using errcode = '22023';
  end if;
  pts := p_reps
    + case when p_big then 10 else 0 end
    + case when p_speech_seconds is null then 0 when p_big then 10 else 5 end;
  insert into public.day_steps (child_id, campaign_id, day, step, xp, speech_seconds)
  values (p_child, c.id, p_day, 'pray', pts, p_speech_seconds)
  on conflict (child_id, campaign_id, day, step) do update
    set xp = excluded.xp, speech_seconds = excluded.speech_seconds, done_at = now()
    where public.day_steps.speech_seconds is null and excluded.speech_seconds is not null;
end;
$$;
revoke execute on function public.complete_prayer(uuid, int, int, boolean, int) from public, anon;
grant execute on function public.complete_prayer(uuid, int, int, boolean, int) to authenticated;

create or replace function public.child_xp(p_child uuid, p_campaign smallint)
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
    + coalesce((select sum(coalesce(xp, case step when 'story' then 5 else 10 end))
                from public.day_steps where child_id = p_child and campaign_id = c.id), 0)
    + case when run >= 3 then 25 else 0 end
    + case when run >= 7 then 50 else 0 end
    + case when run >= 14 then 75 else 0 end
    + case when run >= 21 then 100 else 0 end
  into total;
  return total;
end;
$$;

-- The leaderboard (010) with the same stored-xp rule.
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
  myparish uuid;
begin
  if not exists (select 1 from public.children where id = p_child and guardian_id = auth.uid()) then
    raise exception 'not your child' using errcode = '42501';
  end if;
  if p_scope not in ('parish', 'all') then
    raise exception 'bad scope' using errcode = '22023';
  end if;
  select * into c from public.advent_campaigns where active;
  select parish_id into myparish from public.children where id = p_child;

  return query
  with listed as (
    select ch.id, ch.nickname, ch.avatar_key, ch.parish_id
    from public.children ch
    where ch.id = p_child
       or (ch.on_leaderboard and (p_scope = 'all' or (myparish is not null and ch.parish_id = myparish)))
  ),
  tasks as (
    select child_id, count(*) as n from public.completions
    where campaign_id = c.id and child_id in (select id from listed) group by child_id
  ),
  steps as (
    select child_id, sum(coalesce(xp, case step when 'story' then 5 else 10 end)) as pts from public.day_steps
    where campaign_id = c.id and child_id in (select id from listed) group by child_id
  ),
  -- Longest run of tasks done on the date their day opened (catch-ups do not count).
  runs as (
    select child_id, max(n) as run from (
      select child_id, count(*) as n from (
        select child_id, day - row_number() over (partition by child_id order by day) as g
        from public.completions
        where campaign_id = c.id and child_id in (select id from listed)
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
