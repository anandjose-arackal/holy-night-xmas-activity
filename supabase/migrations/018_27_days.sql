-- 018: the season is 27 days, 29 November to Christmas Day (was 25). Days 17-25 moved to 19-27; the new day 17
-- (15 Dec) and day 18 (16 Dec) unlock a flock sheep and a flock lamb in the village and two new tree ornaments.
-- Mirrors DAYS (lib/game/unlock.ts), REWARDS (lib/village/layout.ts) and ORNAMENTS/FEATURES (lib/tree.ts).
-- Rows saved before this (testing) keep their old day numbers. Run after 017_diocese_leaderboard.sql.

alter table public.completions drop constraint completions_day_check,
  add constraint completions_day_check check (day between 1 and 27);
alter table public.day_steps drop constraint day_steps_day_check,
  add constraint day_steps_day_check check (day between 1 and 27);

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

  if p_day is null or p_day not between 1 and 27 then
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
create or replace function public.complete_step(p_child uuid, p_day int, p_step text, p_church boolean default null)
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
  if p_day is null or p_day not between 1 and 27 or p_step is null or p_step not in ('read', 'mass', 'story') then
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
  if p_day is null or p_day not between 1 and 27 or p_reps is null or p_reps not between 0 and 30
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

create or replace function public.record_share(p_child uuid)
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
  if d not between 1 and 27 then
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

create or replace function public.piece_day(p_key text)
returns int
language sql
immutable
set search_path = ''
as $$
  select case p_key
    when 'tree' then 1 when 'olive' then 2 when 'wreath' then 3 when 'fire' then 4 when 'bell' then 5
    when 'lilies' then 6 when 'jar' then 7 when 'lantern' then 8 when 'hay' then 9 when 'manger' then 10
    when 'donkey' then 11 when 'ox' then 12 when 'shepherd1' then 13 when 'shepherd2' then 14 when 'camel' then 15
    when 'melchior' then 16 when 'flockSheep' then 17 when 'flockLamb' then 18 when 'caspar' then 19
    when 'balthazar' then 20 when 'gold' then 21 when 'frankincense' then 22 when 'myrrh' then 23
    when 'star' then 24 when 'joseph' then 25 when 'mary' then 26 when 'baby' then 27
  end
$$;

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
      when 'snowflake' then 13 when 'shepherd' then 15 when 'wood' then 16 when 'silverstar' then 17
      when 'rubyball' then 18 when 'sheep' then 19 when 'silverbell' then 20 when 'angel' then 21
      when 'blueribbon' then 22 when 'goldribbon' then 23 when 'goldstar' then 24 when 'dove' then 25
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