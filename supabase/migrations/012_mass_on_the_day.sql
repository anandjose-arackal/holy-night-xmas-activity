-- Mass gifts (008) count only Mass ticked on its own day, like the task streak: a child cannot tick Mass for
-- past days later to unlock them. Mirrors massOnTimeDays in lib/data.ts. Run after 011_review_fixes.sql.
create or replace function public.mass_run(p_child uuid, p_campaign smallint)
returns int
language sql
stable
set search_path = ''
as $$
  select coalesce(max(n), 0)::int from (
    select count(*) as n
    from (select s.day, s.day - row_number() over (order by s.day) as grp
          from public.day_steps s
          join public.advent_campaigns c on c.id = s.campaign_id
          where s.child_id = p_child and s.campaign_id = p_campaign and s.step = 'mass'
            and (s.done_at at time zone c.tz)::date = c.start_date + (s.day - 1)) d
    group by grp
  ) runs
$$;
revoke execute on function public.mass_run(uuid, smallint) from public, anon, authenticated;
