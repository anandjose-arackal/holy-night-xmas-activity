-- A sign-up limit for /api/phone-signup, which creates accounts with the service role key and so skips
-- Supabase's own sign-up limits. At most 5 accounts per IP address per hour. Run after 008_mass_streak_gifts.sql.
create table public.signup_attempts (
  ip text not null,
  at timestamptz not null default now()
);
create index signup_attempts_ip_at on public.signup_attempts (ip, at);
alter table public.signup_attempts enable row level security; -- no policies: only the server (service role) reaches it

-- Records one attempt and says whether it is allowed. Old rows (over a day) are cleared as it goes.
create function public.signup_allowed(p_ip text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.signup_attempts where at < now() - interval '1 day';
  if (select count(*) from public.signup_attempts where ip = p_ip and at > now() - interval '1 hour') >= 5 then
    return false;
  end if;
  insert into public.signup_attempts (ip) values (p_ip);
  return true;
end;
$$;
revoke execute on function public.signup_allowed(text) from public, anon, authenticated;
grant execute on function public.signup_allowed(text) to service_role;
