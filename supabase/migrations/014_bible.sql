-- 014: the POC Malayalam Bible, read-only, for the Bible reader (/bible). Filled by scripts/import-bible.mjs.
-- KCBC holds the copyright of the POC text: import it into a public deployment only with their permission.
-- Chapter 0 and verse 0 hold each book's introduction (ആമുഖം).

create table public.bible_books (
  id        smallint primary key check (id between 1 and 73),
  name      text not null,
  testament text not null check (testament in ('OT', 'NT')),
  chapters  smallint not null check (chapters > 0)
);

create table public.bible_verses (
  book_id smallint not null references public.bible_books on delete cascade,
  chapter smallint not null check (chapter >= 0),
  verse   smallint not null check (verse >= 0),
  text    text not null,
  primary key (book_id, chapter, verse)
);

-- Anyone may read, signed in or not; there are no write policies, so only the service role (the import) writes.
alter table public.bible_books enable row level security;
alter table public.bible_verses enable row level security;
create policy bible_books_read on public.bible_books for select to anon, authenticated using (true);
create policy bible_verses_read on public.bible_verses for select to anon, authenticated using (true);
