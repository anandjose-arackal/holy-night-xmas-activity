"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type Child, getCampaign, listChildren, signedIn } from "@/lib/data";
import type { Campaign } from "@/lib/game/unlock";

/** The child chosen on /children and the active season. Sends the visitor back (or to sign-in) when there is none. */
export function useChild() {
  const router = useRouter();
  const [ctx, setCtx] = useState<{ child: Child; campaign: Campaign } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!(await signedIn())) return router.replace("/");
        const id = localStorage.getItem("child");
        const [campaign, children] = await Promise.all([getCampaign(), listChildren()]);
        // No saved choice (first visit on this device): take the first child. No child yet: first-time setup.
        const child = children.find((c) => c.id === id) ?? children[0];
        if (child) {
          localStorage.setItem("child", child.id);
          setCtx({ child, campaign });
        } else router.replace("/children");
      } catch {
        router.replace("/children");
      }
    })();
  }, [router]);

  return ctx;
}
