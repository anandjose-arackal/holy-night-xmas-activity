"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LangToggle } from "@/components/LangToggle";
import { RegionPicker } from "@/components/RegionPicker";
import type { Lang } from "@/content/missions";
import { type Child, addChild, deleteAccount, listChildren, removeChild, setChildParish, signedIn, signOut } from "@/lib/data";
import { BackIcon, PencilIcon, Ribbon, roundBtn } from "@/components/day";
import { REAL_DAYS, isTrial } from "@/lib/game/unlock";
import { setLang, useT } from "@/lib/i18n";
import { avatars, field, parch, pill, redBtn } from "@/lib/ui";

export default function Children() {
  const { t, lang } = useT();
  const router = useRouter();
  const [children, setChildren] = useState<Child[] | null>(null);
  const [error, setError] = useState<string | false>(false);
  const fail = (e: unknown) => setError((e as { message?: string })?.message || "?");

  const [version, setVersion] = useState(0); // bump to reload the list
  const [newParish, setNewParish] = useState<string | null>(null); // the new child's parish, required
  const [needParish, setNeedParish] = useState(false);
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState<string | null>(null); // the child playing on this device
  const [switched, setSwitched] = useState<Child | null>(null); // the "Now playing" card shown before Home opens
  useEffect(() => setCurrent(localStorage.getItem("child")), []); // eslint-disable-line react-hooks/set-state-in-effect -- localStorage is only readable after mount

  useEffect(() => {
    (async () => {
      try {
        if (!(await signedIn())) return router.replace("/");
        setChildren(await listChildren());
        setError(false);
      } catch (e) {
        fail(e);
      }
    })();
  }, [router, version]);

  const run = (job: () => Promise<unknown>) =>
    job().then(
      () => setVersion((v) => v + 1),
      (e) => fail(e),
    );

  const first = children?.length === 0; // first-time setup: only the add-child form

  function play(c: Pick<Child, "id" | "lang">) {
    localStorage.setItem("child", c.id);
    setCurrent(c.id); // the card lights up first, so the switch is seen before the page changes
    setLang(c.lang);
    const known = children?.find((x) => x.id === c.id);
    if (known && c.id !== current) setSwitched(known); // a switch: say who is playing now
    setTimeout(() => router.push("/home"), known && c.id !== current ? 1300 : 350);
  }

  const addForm = (
    <form
      className={`${first ? parch : ""} flex flex-col gap-3 p-5`}
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const childLang = f.get("lang") as Lang;
        if (!newParish) return setNeedParish(true);
        if (saving) return;
        setSaving(true);
        setError(false);
        // A new child goes straight into their village.
        addChild(String(f.get("nickname")), String(f.get("avatar")), childLang, newParish)
          .then((id) => play({ id, lang: childLang }))
          .catch((e) => {
            fail(e);
            setSaving(false);
          });
      }}
    >
      <label className="flex flex-col gap-1 text-sm font-semibold">
        {t.nickname}
        <span className={field}>
          <input name="nickname" required maxLength={60} autoComplete="off" className="min-w-0 flex-1 bg-transparent text-lg outline-none" />
        </span>
      </label>
      <fieldset>
        <legend className="text-sm font-semibold">{t.avatar}</legend>
        <div className="mt-1 flex gap-2">
          {Object.entries(avatars).map(([key, emoji], i) => (
            <label key={key} className="cursor-pointer">
              <input type="radio" name="avatar" value={key} defaultChecked={i === 0} className="peer sr-only" />
              <span className="flex size-14 items-center justify-center rounded-full border-2 border-[#e4cfa4] bg-white/70 text-3xl peer-checked:border-4 peer-checked:border-crimson peer-focus-visible:outline-3 peer-focus-visible:outline-crimson">
                <span aria-hidden>{emoji}</span>
                <span className="sr-only">{key}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        {t.language}
        <select name="lang" defaultValue={lang} key={lang} className={`${field} text-lg`}>
          <option value="en">English</option>
          <option value="ml">മലയാളം</option>
        </select>
      </label>
      <fieldset className="flex flex-col gap-1">
        <legend className="text-sm font-semibold">{t.parish}</legend>
        <RegionPicker
          parishId={newParish}
          onChange={(p) => {
            setNewParish(p);
            setNeedParish(false);
          }}
        />
        {needParish && (
          <p role="alert" className="text-sm font-semibold text-crimson-dark">
            {t.pickParish}
          </p>
        )}
      </fieldset>
      {/* Errors also show here, next to the button: on a phone the one at the top is out of sight. */}
      {error && (
        <p role="alert" className="text-center text-sm font-semibold text-crimson-dark">
          {t.error}
          <span className="mt-1 block text-xs font-normal break-words text-ink-soft">{error}</span>
        </p>
      )}
      <button className={redBtn} disabled={saving}>
        {saving ? t.saving : t.save}
      </button>
    </form>
  );

  return (
    <main className="day-bg flex min-h-dvh flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-ink">
     <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        {/* Opened from the dashboard: a way back. First-time setup has nowhere to go back to. */}
        {children?.length ? (
          <Link href="/home" aria-label={t.back} className={roundBtn}>
            <BackIcon width={24} height={24} strokeWidth={3} />
          </Link>
        ) : (
          <span />
        )}
        <LangToggle />
      </div>
      <Ribbon title={first ? t.addChild : t.whoPlays} />

      {error && (
        <p role="alert" className={`${parch} p-3 font-semibold text-crimson-dark`}>
          {t.error}
          <span className="mt-1 block text-xs font-normal break-words text-ink-soft">{error}</span>
        </p>
      )}
      {!children && !error && <p className={`${parch} p-3`}>{t.loading}</p>}

      <ul className="flex flex-col gap-3">
        {children?.map((c) => (
          <li key={c.id} className={`${parch} flex flex-wrap items-center gap-3 p-3 transition ${c.id === current ? "ring-4 ring-[#f5c542]" : ""}`}>
            <button type="button" aria-current={c.id === current || undefined} onClick={() => play(c)} className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left transition active:scale-[0.97]">
              <span className={`flex size-16 shrink-0 items-center justify-center rounded-full border-4 bg-white/70 text-4xl ${c.id === current ? "border-[#f5c542]" : "border-rim"}`} aria-hidden>
                {avatars[c.avatar_key] ?? "🐑"}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-display text-2xl font-black text-crimson-dark">{c.nickname}</span>
                  {c.id === current && (
                    <span className="shrink-0 rounded-full bg-[#2f7a3b] px-2 py-0.5 text-xs font-bold text-white">✓ {t.playingNow}</span>
                  )}
                </span>
                <span className="h-2.5 overflow-hidden rounded-full bg-[#ead6ae]">
                  <span className="block h-full rounded-full bg-gradient-to-b from-[#e0464c] to-crimson-dark" style={{ width: `${Math.max((c.days.filter((d) => !isTrial(d)).length / REAL_DAYS) * 100, 3)}%` }} />
                </span>
                <span className="text-sm font-semibold text-ink-soft">
                  {c.days.filter((d) => !isTrial(d)).length}/{REAL_DAYS}
                </span>
              </span>
            </button>
            {/* The card shows picture, name and progress; the parent's settings (parish, remove) open on "Edit". */}
            <details className="text-sm open:w-full">
              <summary aria-label={t.edit} title={t.edit} className={`${roundBtn} size-11! cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
                <PencilIcon width={20} height={20} strokeWidth={2.5} />
              </summary>
              <div className="mt-2 flex flex-col gap-2 border-t border-rim/50 pt-2 pb-1">
                <RegionPicker parishId={c.parish_id ?? null} onChange={(p) => run(() => setChildParish(c.id, p))} />
                <button
                  type="button"
                  className="min-h-11 self-start px-2 text-sm text-ink-soft underline"
                  onClick={() => confirm(t.confirmRemove) && run(() => removeChild(c.id))}
                >
                  {t.remove}
                </button>
              </div>
            </details>
          </li>
        ))}
      </ul>

      {/* First-time setup shows the form; once a child is saved it folds away behind "Add a child". */}
      {first ? (
        addForm
      ) : (
        <details className={`${parch} group`}>
          <summary className="flex min-h-12 cursor-pointer items-center justify-center gap-2 p-3 font-display text-xl font-black text-crimson-dark group-open:border-b group-open:border-rim/50">
            + {t.addChild}
          </summary>
          {addForm}
        </details>
      )}

      <footer className={`${parch} mt-auto flex flex-col gap-2 p-4 text-sm`}>
        <button type="button" className={pill} onClick={() => signOut().then(() => router.replace("/"))}>
          {t.signOut}
        </button>
        <Link href="/privacy" className="text-center underline">
          {t.privacy}
        </Link>
        <button
          type="button"
          // Hidden during first-time setup: nothing to delete yet, and it sits right under Save.
          className={`min-h-11 text-crimson underline ${first ? "hidden" : ""}`}
          onClick={() =>
            confirm(t.confirmDelete) &&
            deleteAccount().then(
              () => router.replace("/"),
              (e) => fail(e),
            )
          }
        >
          {t.deleteAccount}
        </button>
      </footer>
     </div>
      {switched && (
        <div role="status" className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <p className={`${parch} flex flex-col items-center gap-2 px-8 py-6 text-center animate-[rise_.4s_ease-out] motion-reduce:animate-none`}>
            <span className="flex size-20 items-center justify-center rounded-full border-4 border-[#f5c542] bg-white/80 text-5xl" aria-hidden>
              {avatars[switched.avatar_key] ?? "🐑"}
            </span>
            <span className="text-sm font-semibold text-ink-soft">{t.switchedTo}</span>
            <span className="font-display text-3xl font-black text-crimson-dark">{switched.nickname}</span>
          </p>
        </div>
      )}
    </main>
  );
}
