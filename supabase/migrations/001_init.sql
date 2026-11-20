-- Bethlehem 3D: one guardian (auth.users) owns many children; each child has completed days.

create table public.children (
  id          uuid primary key default gen_random_uuid(),
  guardian_id uuid not null default auth.uid() references auth.users on delete cascade,
  nickname    text not null check (char_length(nickname) between 1 and 24),
  avatar_key  text not null default 'sheep',
  lang        text not null default 'en' check (lang in ('en', 'ml')),
  created_at  timestamptz not null default now()
);
create index children_guardian_idx on public.children (guardian_id);

create table public.completions (
  child_id     uuid not null references public.children on delete cascade,
  day          smallint not null check (day between 1 and 25),
  completed_at timestamptz not null default now(),
  primary key (child_id, day)
);

alter table public.children enable row level security;
alter table public.completions enable row level security;

create policy children_own on public.children
  for all to authenticated
  using (guardian_id = (select auth.uid()))
  with check (guardian_id = (select auth.uid()));

-- Read only. Rows are written by complete_mission(), which enforces the date.
create policy completions_read on public.completions
  for select to authenticated
  using (exists (
    select 1 from public.children c
    where c.id = child_id and c.guardian_id = (select auth.uid())
  ));

create function public.complete_mission(p_child uuid, p_day int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.children where id = p_child and guardian_id = auth.uid()
  ) then
    raise exception 'not your child' using errcode = '42501';
  end if;

  if p_day is null or p_day not between 1 and 25 then
    raise exception 'bad day' using errcode = '22023';
  end if;

  -- 'Etc/GMT-14' is UTC+14, the earliest clock on Earth, so no child is blocked
  -- on a day that has already started for them. The app uses the device date.
  if (now() at time zone 'Etc/GMT-14')::date < make_date(2026, 12, p_day) then
    raise exception 'day locked' using errcode = '22023';
  end if;

  -- The primary key makes a retried request harmless.
  insert into public.completions (child_id, day)
  values (p_child, p_day)
  on conflict do nothing;
end;
$$;

revoke execute on function public.complete_mission(uuid, int) from public, anon;
grant execute on function public.complete_mission(uuid, int) to authenticated;
