-- 016: sharing a verse picture pays 20 XP, at most 3 times (60 XP) per campaign day.
-- Each share is a day_steps row share1..share3 with xp 20, so child_xp and the leaderboard (013) count it as is.
-- The day is today's campaign day on the server's clock; before day 1 or after day 25 sharing pays nothing.
-- Mirrors recordShare in lib/data.ts. Run after 015_voice_bonus_20.sql.

alter table public.day_steps
  drop constraint day_steps_step_check,
  add constraint day_steps_step_check check (step in ('read', 'mass', 'story', 'pray', 'share1', 'share2', 'share3'));

-- Returns the XP this share earned: 20, or 0 when today's three are used or the season is not on.
create function public.record_share(p_child uuid)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  c    public.advent_campaigns;
  d    int;
  used int;
  rows int;
begin
  if not exists (select 1 from public.children where id = p_child and guardian_id = auth.uid()) then
    raise exception 'not your child' using errcode = '42501';
  end if;
  select * into c from public.advent_campaigns where active;
  if not found then
    return 0;
  end if;
  d := (now() at time zone c.tz)::date - c.start_date + 1;
  if d not between 1 and 25 then
    return 0;
  end if;
  select count(*) into used from public.day_steps
  where child_id = p_child and campaign_id = c.id and day = d and step like 'share_';
  if used >= 3 then
    return 0;
  end if;
  insert into public.day_steps (child_id, campaign_id, day, step, xp)
  values (p_child, c.id, d, 'share' || (used + 1), 20)
  on conflict do nothing; -- two taps at once: the second finds its slot taken and pays nothing
  get diagnostics rows = row_count;
  return 20 * rows;
end;
$$;
revoke execute on function public.record_share(uuid) from public, anon;
grant execute on function public.record_share(uuid) to authenticated;
