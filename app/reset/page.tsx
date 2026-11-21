"use client";

// The "forgot password" email links here; Supabase signs the user in from the link, then they choose a new password.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Brand, Divider, LockIcon } from "@/components/day";
import { supabase } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { field, parch, redBtn } from "@/lib/ui";

export default function Reset() {
  const { t } = useT();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "busy" | "error">("idle");

  async function save(form: FormData) {
    setStatus("busy");
    const { error } = (await supabase?.auth.updateUser({ password: String(form.get("password")) })) ?? { error: true };
    if (error) return setStatus("error");
    router.replace("/home");
  }

  return (
    <main className="day-bg flex min-h-dvh flex-col items-center gap-6 px-4 py-8 landscape:bg-fixed">
      <Brand tag={t.journeyTag} />
      <form action={save} className={`${parch} mt-auto flex w-full max-w-md flex-col gap-4 p-6`}>
        <h2 className="text-center font-display text-3xl font-black text-crimson-dark">{t.newPassword}</h2>
        <Divider />
        <label className={field}>
          <LockIcon className="shrink-0 text-ink-soft" />
          <span className="sr-only">{t.newPassword}</span>
          <input type="password" name="password" required minLength={8} autoComplete="new-password" placeholder={t.passwordRule} className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-ink-soft/70" />
        </label>
        <button className={redBtn} disabled={status === "busy"}>
          {t.savePassword}
        </button>
        <p role="status" className="text-center text-sm font-semibold text-crimson-dark empty:hidden">
          {status === "error" && t.error}
        </p>
      </form>
    </main>
  );
}
