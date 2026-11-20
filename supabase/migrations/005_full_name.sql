-- The child's name field now asks for the full name, which can be longer than the old 24-character nickname.
-- The column keeps its name (nickname) so nothing else changes. Run after 004_add_region.sql.
alter table public.children
  drop constraint children_nickname_check,
  add constraint children_nickname_check check (char_length(nickname) between 1 and 60);
