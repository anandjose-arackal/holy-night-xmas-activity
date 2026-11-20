-- Fixes after review. Run after 010_leaderboard_fast.sql.
--
-- 1. add_region (004) wrote add_region.slug for a declared variable. In PL/pgSQL only parameters can be
--    prefixed with the function name, so every new name failed with "missing FROM-clause entry".
--    The variable is now v_slug, used without a prefix.
-- 2. The phone sign-up limit (009) was 5 per IP address per hour. Families share IPs (mobile carriers,
--    church Wi-Fi after Mass), so it is now 30.

create or replace function public.add_region(p_level text, p_name text, p_parent uuid default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  nm   text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
  v_slug text;
  hit  record;
  out  uuid;
begin
  if auth.uid() is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  if p_level not in ('diocese', 'meghala', 'parish') then
    raise exception 'bad level' using errcode = '22023';
  end if;
  if length(nm) < 2 or length(nm) > 80 then
    raise exception 'name must be 2 to 80 characters' using errcode = '22023';
  end if;
  if p_level <> 'diocese' and p_parent is null then
    raise exception 'choose the level above first' using errcode = '22023';
  end if;
  if p_level = 'meghala' and not exists (select 1 from public.dioceses where id = p_parent)
     or p_level = 'parish' and not exists (select 1 from public.meghalas where id = p_parent) then
    raise exception 'unknown parent' using errcode = '22023';
  end if;

  -- Same name already there?
  if p_level = 'diocese' then
    select id, null::uuid as parent into hit from public.dioceses where lower(name) = lower(nm);
  elsif p_level = 'meghala' then
    select id, diocese_id as parent into hit from public.meghalas where lower(name) = lower(nm);
  else
    select id, meghala_id as parent into hit from public.shakhas where lower(name) = lower(nm);
  end if;
  if hit.id is not null then
    if p_level = 'diocese' or hit.parent = p_parent then
      return hit.id;
    end if;
    raise exception 'name already used elsewhere' using errcode = '23505';
  end if;

  -- A unique slug like fest_hub's: lowercase letters and digits joined by "-", plus a short tail if taken or empty.
  v_slug := btrim(regexp_replace(lower(nm), '[^a-z0-9]+', '-', 'g'), '-');
  if v_slug = ''
     or p_level = 'diocese' and exists (select 1 from public.dioceses d where d.slug = v_slug)
     or p_level = 'meghala' and exists (select 1 from public.meghalas m where m.slug = v_slug)
     or p_level = 'parish' and exists (select 1 from public.shakhas s where s.slug = v_slug) then
    v_slug := btrim(v_slug || '-' || substr(md5(random()::text), 1, 6), '-');
  end if;

  if p_level = 'diocese' then
    insert into public.dioceses (name, slug) values (nm, v_slug) returning id into out;
  elsif p_level = 'meghala' then
    insert into public.meghalas (name, slug, diocese_id) values (nm, v_slug, p_parent) returning id into out;
  else
    insert into public.shakhas (name, slug, meghala_id) values (nm, v_slug, p_parent) returning id into out;
  end if;
  return out;
end;
$$;

create or replace function public.signup_allowed(p_ip text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.signup_attempts where at < now() - interval '1 day';
  if (select count(*) from public.signup_attempts where ip = p_ip and at > now() - interval '1 hour') >= 30 then
    return false;
  end if;
  insert into public.signup_attempts (ip) values (p_ip);
  return true;
end;
$$;
