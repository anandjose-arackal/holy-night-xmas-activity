-- Two more bonus items for the village: the trumpet angel and the candle. Prices mirror PRICES in lib/game/xp.ts.
-- Run after 006_everyone_on_leaderboard.sql.
create or replace function public.bonus_price(p_item text)
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
