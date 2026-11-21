"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useT } from "@/lib/i18n";

/** Shows `lines` lines ending in "…"; a "Read full" button appears only when the text is cut, and toggles it open. */
export function ClampText({ children, lines = 4, className = "" }: { children: ReactNode; lines?: number; className?: string }) {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [cut, setCut] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || open) return;
    const check = () => setCut(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, children]);

  return (
    <div className="flex flex-col items-start gap-1">
      <div ref={ref} className={className} style={open ? undefined : { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: lines, overflow: "hidden" }}>
        {children}
      </div>
      {(cut || open) && (
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="min-h-9 font-display text-sm font-bold text-crimson-dark underline underline-offset-4">
          {open ? t.readLess : t.readFull}
        </button>
      )}
    </div>
  );
}
