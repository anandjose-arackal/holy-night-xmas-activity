"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand, Divider, EyeIcon, GoogleIcon, LockIcon, MailIcon } from "@/components/day";
import { LangToggle } from "@/components/LangToggle";
import { supabase } from "@/lib/data";
import { phoneEmail, readId } from "@/lib/loginId";
import { useT } from "@/lib/i18n";
import { field, parch, redBtn } from "@/lib/ui";

type Status = "idle" | "busy" | "confirm" | "reset" | "bad" | "badId" | "taken" | "phoneReset" | "error";

export default function SignIn() {
  const { t } = useT();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [reason, setReason] = useState(""); // the server's own words, shown small under "Something went wrong"
  const oops = (e: { message?: string }) => {
    setReason(e.message ?? "");
    setStatus("error");
  };

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/home");
    });
  }, [router]);

  async function submit(form: FormData) {
    const id = readId(String(form.get("login")));
    const password = String(form.get("password"));
    if (!id) return setStatus("badId");
    setStatus("busy");
    if (mode === "signin") {
      // A phone number signs in as its hidden email (lib/loginId.ts).
      const email = "phone" in id ? phoneEmail(id.phone) : id.email;
      const { error } = await supabase!.auth.signInWithPassword({ email, password });
      if (!error) return router.replace("/home");
      return error.status === 400 ? setStatus("bad") : oops(error);
    }
    if ("phone" in id) {
      // Created already confirmed on the server (the hidden email has no inbox), then signed in here.
      const res = await fetch("/api/phone-signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: id.phone, password }) });
      if (res.status === 409) return setStatus("taken");
      if (!res.ok) return oops(await res.json().then((j) => ({ message: j.error }), () => ({ message: String(res.status) })));
      const { error } = await supabase!.auth.signInWithPassword({ email: phoneEmail(id.phone), password });
      if (error) return oops(error);
      return router.replace("/home");
    }
    const { data, error } = await supabase!.auth.signUp({ email: id.email, password, options: { emailRedirectTo: `${location.origin}/home` } });
    if (error) return oops(error);
    if (data.session) return router.replace("/home"); // email confirmation is switched off
    setStatus("confirm");
  }

  async function forgot(form: HTMLFormElement) {
    const id = readId((form.elements.namedItem("login") as HTMLInputElement).value);
    if (!id) return setStatus("badId");
    setStatus("busy");
    if ("phone" in id) return setStatus("phoneReset"); // no inbox and no SMS: a phone account cannot reset by itself
    const { error } = await supabase!.auth.resetPasswordForEmail(id.email, { redirectTo: `${location.origin}/reset` });
    if (error) return oops(error);
    setStatus("reset");
  }


  const message = { confirm: t.confirmSent, reset: t.resetSent, bad: t.badLogin, badId: t.badId, taken: t.phoneTaken, phoneReset: t.phoneReset, error: t.error }[status as string];

  return (
    <main className="day-bg relative flex min-h-dvh flex-col items-center gap-6 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] landscape:bg-fixed">
      <div className="flex w-full max-w-md justify-end">
        <LangToggle />
      </div>

      <div className="mt-2 sm:mt-6">
        <Brand tag={t.journeyTag} />
      </div>

      <section className={`${parch} mt-auto flex w-full max-w-md flex-col gap-4 p-6 animate-[rise_.7s_ease-out] motion-reduce:animate-none`}>
        <h2 className="text-center font-display text-3xl font-black text-crimson-dark">
          {!supabase ? t.beginJourney : mode === "signin" ? t.welcomeBack : t.beginJourney}
        </h2>
        <Divider />

        {!supabase ? (
          <>
            <p className="text-center text-ink-soft">{t.demoNote}</p>
            <Link href="/home" className={redBtn}>
              {t.demoStart}
            </Link>
          </>
        ) : (
          <form action={submit} className="flex flex-col gap-3">
            <label className={field}>
              <MailIcon className="shrink-0 text-ink-soft" />
              <span className="sr-only">{t.emailOrPhone}</span>
              <input name="login" required autoComplete="username" placeholder={t.emailOrPhone} className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-ink-soft/70" />
            </label>
            <label className={field}>
              <LockIcon className="shrink-0 text-ink-soft" />
              <span className="sr-only">{t.password}</span>
              <input
                type={show ? "text" : "password"}
                name="password"
                required
                minLength={8}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder={t.password}
                className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-ink-soft/70"
              />
              <button type="button" className="-mr-2 flex size-11 items-center justify-center text-ink-soft" aria-label={show ? t.hidePassword : t.showPassword} aria-pressed={show} onClick={() => setShow((v) => !v)}>
                <EyeIcon off={!show} />
              </button>
            </label>

            {mode === "signup" && (
              <>
                <p className="-mt-1 px-2 text-sm text-ink-soft">{t.passwordRule}</p>
                {/* Consent is given once, when the account is created. */}
                <label className="flex items-start gap-2 px-1 text-sm text-ink">
                  <input type="checkbox" name="consent" required className="mt-0.5 size-5 accent-crimson" />
                  <span>
                    {t.consent}{" "}
                    <Link href="/privacy" className="underline">
                      {t.privacy}
                    </Link>
                  </span>
                </label>
              </>
            )}

            <button className={redBtn} disabled={status === "busy"}>
              {mode === "signin" ? t.signIn : t.createAccount}
            </button>

            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                className="min-h-11 font-display text-xl font-bold text-crimson-dark underline underline-offset-4"
                onClick={() => {
                  setMode((m) => (m === "signin" ? "signup" : "signin"));
                  setStatus("idle");
                }}
              >
                {mode === "signin" ? t.createAccount : t.haveAccount}
              </button>
              {mode === "signin" && (
                <button type="button" className="min-h-11 text-sm text-ink-soft underline" onClick={(e) => forgot(e.currentTarget.form!)}>
                  {t.forgot}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-ink-soft" aria-hidden>
              <span className="h-px flex-1 bg-ink-soft/30" />
              {t.or}
              <span className="h-px flex-1 bg-ink-soft/30" />
            </div>

            <button
              type="button"
              className="flex min-h-13 items-center justify-center gap-3 rounded-full border border-[#e4cfa4] bg-white px-5 text-lg font-semibold text-ink shadow-md transition active:scale-[0.98]"
              onClick={() =>
                supabase!.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/home` } })
              }
            >
              <GoogleIcon />
              {t.google}
            </button>
            {/* A first Google sign-in creates the account, so the same consent applies. */}
            <p className="text-center text-xs text-ink-soft">{t.consent}</p>

            <p role="status" className="text-center text-sm font-semibold text-crimson-dark empty:hidden">
              {message}
              {status === "error" && reason && <span className="mt-1 block text-xs font-normal break-words text-ink-soft">{reason}</span>}
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
