-- Run in the Supabase SQL editor (or psql) on a STAGING project after all migrations (001 to 012).
-- Everything happens in one transaction and is rolled back.
-- Success prints "ALL RLS TESTS PASSED"; any failure raises an error.

begin;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.invalid'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.invalid');

create function pg_temp.act_as(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
end $$;

do $$
declare
  a constant uuid := '00000000-0000-0000-0000-00000000000a';
  b constant uuid := '00000000-0000-0000-0000-00000000000b';
  child_a uuid;
  child_b uuid;
  child_g uuid; -- Mass on days 1 and 2
  child_h uuid; -- Mass on day 1 only
  child_k uuid; -- Mass for days 1 and 2, but both ticked late (today)
  r1 uuid;
  r2 uuid;
  n int;
  failed boolean;
begin
  -- Seeded as the database owner, before acting as anyone: Mass steps for the gift checks (008).
  insert into public.children (guardian_id, nickname) values (a, 'Gita') returning id into child_g;
  insert into public.children (guardian_id, nickname) values (a, 'Hari') returning id into child_h;
  insert into public.children (guardian_id, nickname) values (a, 'Kiran') returning id into child_k;
  -- Gita and Hari ticked Mass on the day itself (noon, campaign time); Kiran ticked days 1 and 2 later.
  insert into public.day_steps (child_id, campaign_id, day, step, done_at)
  select x.c, c.id, x.d, 'mass', ((c.start_date + (x.d - 1))::text || ' 12:00')::timestamp at time zone c.tz
  from (values (child_g, 1), (child_g, 2), (child_h, 1)) as x(c, d), public.advent_campaigns c where c.active;
  insert into public.day_steps (child_id, campaign_id, day, step, done_at)
  select x.c, c.id, x.d, 'mass', c.start_date + 40 -- well after both days
  from (values (child_k, 1), (child_k, 2)) as x(c, d), public.advent_campaigns c where c.active;

  -- Guardian A adds a child.
  perform pg_temp.act_as(a);
  insert into public.children (nickname) values ('Anu') returning id into child_a;

  -- A cannot write completions directly (no insert policy).
  failed := false;
  begin
    insert into public.completions (child_id, day) values (child_a, 1);
  exception when insufficient_privilege then failed := true;
  end;
  assert failed, 'direct insert into completions must be denied';

  -- Guardian B sees nothing of A's and cannot act on A's child.
  perform pg_temp.act_as(b);
  select count(*) into n from public.children;
  assert n = 0, 'B must not see A''s children';

  update public.children set nickname = 'hacked' where id = child_a;
  get diagnostics n = row_count;
  assert n = 0, 'B must not update A''s child';

  failed := false;
  begin
    perform public.complete_mission(child_a, 1);
  exception when insufficient_privilege then failed := true;
  end;
  assert failed, 'B must not complete a mission for A''s child';

  failed := false;
  begin
    insert into public.children (guardian_id, nickname) values (a, 'planted');
  exception when insufficient_privilege then failed := true;
  end;
  assert failed, 'B must not create a child owned by A';

  -- B cannot save a tree for A's child, and nobody writes the table directly.
  failed := false;
  begin
    perform public.save_tree(child_a, '{"items": [], "lights": false, "color": "champagne"}');
  exception when insufficient_privilege then failed := true;
  end;
  assert failed, 'B must not save a tree for A''s child';

  perform pg_temp.act_as(a);
  failed := false;
  begin
    insert into public.tree_decorations (child_id, campaign_id, data)
    values (child_a, (select id from public.advent_campaigns where active), '{}');
  exception when insufficient_privilege then failed := true;
  end;
  assert failed, 'direct insert into tree_decorations must be denied';

  -- An empty tree saves; an ornament whose day is not completed does not.
  perform public.save_tree(child_a, '{"items": [], "lights": false, "color": "champagne"}');
  failed := false;
  begin
    perform public.save_tree(child_a, '{"items": [{"k": "dove", "a": 1}], "lights": false, "color": "champagne"}');
  exception when invalid_parameter_value then failed := true;
  end;
  assert failed, 'a locked ornament must be rejected';

  -- Date and idempotency checks only make sense once day 1 of the active campaign has begun.
  if (select (now() at time zone tz)::date >= start_date from public.advent_campaigns where active) then
    perform public.complete_mission(child_a, 1);
    perform public.complete_mission(child_a, 1);
    select count(*) into n from public.completions where child_id = child_a;
    assert n = 1, 'completing twice must leave one row';
  else
    failed := false;
    begin
      perform public.complete_mission(child_a, 1);
    exception when invalid_parameter_value then failed := true;
    end;
    assert failed, 'a future day must be rejected';
    raise notice 'Before day 1 of the campaign: idempotency check skipped, re-run in season.';
  end if;

  failed := false;
  begin
    perform public.complete_mission(child_a, 26);
  exception when invalid_parameter_value then failed := true;
  end;
  assert failed, 'day 26 must be rejected';

  -- 003: day steps, the bonus shop, the village and the leaderboard.
  perform pg_temp.act_as(a);
  failed := false;
  begin
    insert into public.day_steps (child_id, campaign_id, day, step)
    values (child_a, (select id from public.advent_campaigns where active), 1, 'read');
  exception when insufficient_privilege then failed := true;
  end;
  assert failed, 'direct insert into day_steps must be denied';

  failed := false;
  begin
    perform public.complete_step(child_a, 1, 'task');
  exception when invalid_parameter_value then failed := true;
  end;
  assert failed, 'an unknown step must be rejected';

  failed := false;
  begin
    perform public.buy_bonus(child_a, 'santa');
  exception when invalid_parameter_value then failed := true;
  end;
  assert failed, 'buying without enough XP must be rejected';

  -- A piece whose day is not done, and an unknown piece, are dropped from a saved village.
  perform public.save_village(child_a, '{"tall": {"ox": [0.5, 0.6, 0], "unicorn": [0.5, 0.6, 0]}, "wide": {}}');
  select count(*) into n from public.village_layout v, jsonb_object_keys(v.data -> 'tall') where v.child_id = child_a;
  assert n = 0, 'locked or unknown pieces must not be saved';

  perform pg_temp.act_as(b);
  failed := false;
  begin
    perform public.complete_step(child_a, 1, 'read');
  exception when insufficient_privilege then failed := true;
  end;
  assert failed, 'B must not complete a step for A''s child';

  failed := false;
  begin
    perform * from public.leaderboard(child_a, 'all');
  exception when insufficient_privilege then failed := true;
  end;
  assert failed, 'B must not read the board as A''s child';

  insert into public.children (nickname) values ('Bea') returning id into child_b;
  select count(*) into n from public.leaderboard(child_b, 'all') where nickname = 'Anu';
  assert n = 1, 'every child is listed (006)';
  select count(*) into n from public.leaderboard(child_b, 'all') where me;
  assert n = 1, 'the asking child always sees their own row';

  -- 008: a Mass gift is kept only once the run of Mass days reaches it (snowflake: 2 in a row).
  perform pg_temp.act_as(a);
  perform public.save_village(child_g, '{"tall": {"snowflake": [0.36, 0.78, 0]}, "wide": {}}');
  perform public.save_village(child_h, '{"tall": {"snowflake": [0.36, 0.78, 0]}, "wide": {}}');
  select count(*) into n from public.village_layout where child_id = child_g and data -> 'tall' ? 'snowflake';
  assert n = 1, '2 Mass days in a row must keep the snowflake';
  select count(*) into n from public.village_layout where child_id = child_h and data -> 'tall' ? 'snowflake';
  assert n = 0, '1 Mass day must not keep the snowflake';
  perform public.save_village(child_k, '{"tall": {"snowflake": [0.36, 0.78, 0]}, "wide": {}}');
  select count(*) into n from public.village_layout where child_id = child_k and data -> 'tall' ? 'snowflake';
  assert n = 0, 'Mass ticked later (catch-up) must not count towards a gift (012)';

  -- 010: the leaderboard scores by the child_xp rules: two Mass steps are 20 XP, nothing else done.
  select xp into n from public.leaderboard(child_g, 'all') where me;
  assert n = 20, 'leaderboard XP must follow the child_xp rules';

  -- 004: adding a region needs a signed-in user; the same name twice gives the same row.
  r1 := public.add_region('diocese', 'Test Diocese ZZ', null);
  r2 := public.add_region('diocese', '  test   diocese zz ', null);
  assert r1 = r2, 'the same diocese name (any case or spacing) must return the existing row';
  perform set_config('request.jwt.claims', '{"role": "authenticated"}', true); -- no user id: signed out
  failed := false;
  begin
    perform public.add_region('diocese', 'Another Diocese ZZ', null);
  exception when insufficient_privilege then failed := true;
  end;
  assert failed, 'adding a region signed out must be denied';

  raise notice 'ALL RLS TESTS PASSED';
end $$;

rollback;
