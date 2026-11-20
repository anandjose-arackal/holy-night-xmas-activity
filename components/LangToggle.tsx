"use client";

import type { Lang } from "@/content/missions";
import { setLang, useT } from "@/lib/i18n";
import { pill } from "@/lib/ui";

export function LangToggle({ onChange, className = "" }: { onChange?: (lang: Lang) => void; className?: string }) {
  const { lang } = useT();
  const next: Lang = lang === "en" ? "ml" : "en";
  return (
    <button
      type="button"
      lang={next}
      className={`${pill} px-3 text-sm ${className}`}
      onClick={() => {
        setLang(next);
        onChange?.(next);
      }}
    >
      {next === "ml" ? "മലയാളം" : "English"}
    </button>
  );
}
