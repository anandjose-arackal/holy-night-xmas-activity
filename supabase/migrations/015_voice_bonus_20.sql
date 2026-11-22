-- 015: the voice bonus for Pray now is a flat +20 (was +5, or +10 with a big prayer), capped at 50 in all.
-- Mirrors prayXp in lib/voice/accumulator.ts. Rows saved earlier keep their XP. Run after 014_bible.sql.

create or replace function public.complete_prayer(p_child uuid, p_day int, p_reps int, p_big boolean, p_speech_seconds int default null)
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
  pts := least(50, p_reps
    + case when p_big then 10 else 0 end
    + case when p_speech_seconds is null then 0 else 20 end);
  insert into public.day_steps (child_id, campaign_id, day, step, xp, speech_seconds)
  values (p_child, c.id, p_day, 'pray', pts, p_speech_seconds)
  on conflict (child_id, campaign_id, day, step) do update
    set xp = excluded.xp, speech_seconds = excluded.speech_seconds, done_at = now()
    where public.day_steps.speech_seconds is null and excluded.speech_seconds is not null;
end;
$$;
revoke execute on function public.complete_prayer(uuid, int, int, boolean, int) from public, anon;
grant execute on function public.complete_prayer(uuid, int, int, boolean, int) to authenticated;
