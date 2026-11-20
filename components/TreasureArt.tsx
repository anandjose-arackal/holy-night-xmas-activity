import { LockIcon } from "@/components/day";
import { PIECES, type PieceKey } from "@/lib/village/layout";

/** A treasure's picture: its illustration (PIECES[k].image) or a parchment medallion. Locked shows a dark silhouette and a lock. */
export function TreasureArt({ k, size = 96, locked = false, label }: { k: PieceKey; size?: number; locked?: boolean; label: string }) {
  const img = PIECES[k].image;
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element -- small local art, no optimisation needed
        <img
          src={img}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          className={`size-full object-contain ${locked ? "opacity-25 brightness-0" : "drop-shadow-[0_4px_4px_rgba(60,30,5,0.3)]"}`}
        />
      ) : (
        <span
          aria-hidden
          className={`flex size-full items-center justify-center rounded-full border-[3px] border-rim bg-gradient-to-b from-[#fff3d0] to-[#e9c98a] font-display font-black text-crimson-dark shadow-inner ${locked ? "opacity-35 grayscale" : ""}`}
          style={{ fontSize: size * 0.42 }}
        >
          {!locked && label.replace(/^(The |King |Saint |Mother )/, "").charAt(0)}
        </span>
      )}
      {locked && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex items-center justify-center rounded-lg bg-gradient-to-b from-[#f7d774] to-[#c98a12] p-1 text-[#5a3a05] shadow" style={{ width: size * 0.34, height: size * 0.34 }}>
            <LockIcon width="100%" height="100%" strokeWidth={2.4} />
          </span>
        </span>
      )}
    </span>
  );
}
