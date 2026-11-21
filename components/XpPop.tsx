"use client";

import { useCallback, useState } from "react";
import { xpPill } from "@/lib/ui";

/** "+N XP" chips that float up and fade wherever XP is earned. Render `node` once; call `pop("+30 XP")`. */
export function useXpPop() {
  const [pops, setPops] = useState<{ id: number; text: string }[]>([]);
  const pop = useCallback((text: string, delay = 0) => {
    const id = Math.random();
    setTimeout(() => setPops((p) => [...p, { id, text }]), delay);
    setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), delay + 1300);
  }, []);
  const node = (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-1/3 z-[70] flex flex-col items-center gap-2">
      {pops.map((p) => (
        <span key={p.id} className={`${xpPill} text-2xl animate-[xp-pop_1.3s_ease-out_forwards] motion-reduce:animate-none`}>
          {p.text}
        </span>
      ))}
    </div>
  );
  return { pop, node };
}
