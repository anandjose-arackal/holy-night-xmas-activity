-- Every child is on the leaderboard (full name and parish); the parent's opt-in box is gone.
-- The column stays so the leaderboard function is unchanged. Run after 005_full_name.sql.
alter table public.children alter column on_leaderboard set default true;
update public.children set on_leaderboard = true where not on_leaderboard;
