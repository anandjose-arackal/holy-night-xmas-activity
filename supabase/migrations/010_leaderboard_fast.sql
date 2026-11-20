-- The leaderboard used to call child_xp once per child (about 7 queries each): with thousands of children
-- every view ran tens of thousands of queries. This version computes everyone's XP in one pass, with the
-- same rules as child_xp (003) and lib/game/xp.ts: task 20, read and Mass 10, story 5, and a bonus for the
-- longest run of tasks done on their own day (3: +25, 7: +50, 14: +75, 21: +100).
-- Same name, arguments and result as before, so the app does not change. Run after 009_signup_limit.sql.
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
    select child_id, sum(case step when 'story' then 5 else 10 end) as pts from public.day_steps
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
