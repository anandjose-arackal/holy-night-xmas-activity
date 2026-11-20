import { ORNAMENTS, type OrnamentKind } from "@/lib/tree";

/** Flat picture of the 3D ornament for the tray: its shape, in its colour. */
export function OrnamentIcon({ kind }: { kind: OrnamentKind }) {
  const { shape, color: c } = ORNAMENTS[kind];
  const line = { stroke: c, strokeWidth: 3, strokeLinecap: "round", fill: "none" } as const;
  return (
    <svg aria-hidden viewBox="0 0 32 32" className="size-9 drop-shadow">
      {shape === "ball" && (
        <>
          <rect x="14" y="3" width="4" height="4" fill="#d8ab4a" />
          <circle cx="16" cy="18" r="10" fill={c} />
        </>
      )}
      {shape === "bell" && (
        <>
          <path d="M16 4c-6 3-6 12-9 18h18c-3-6-3-15-9-18z" fill={c} />
          <circle cx="16" cy="25" r="3" fill="#d8ab4a" />
        </>
      )}
      {shape === "bow" && (
        <>
          <path d="M16 13 4 6v14zM16 13l12-7v14z" fill={c} />
          <path d="M14 15l-4 13M18 15l4 13" {...line} />
          <circle cx="16" cy="13" r="3" fill={c} />
        </>
      )}
      {shape === "star" && <path d="M16 2l4 9 10 1-7.5 7 2 10-8.5-5-8.5 5 2-10L2 12l10-1z" fill={c} />}
      {shape === "snowflake" && <path d="M16 3v26M5 9.5l22 13M27 9.5l-22 13" {...line} />}
      {shape === "crook" && <path d="M12 29V11a6 6 0 0 1 12 0v3" {...line} />}
      {shape === "sheep" && (
        <>
          <ellipse cx="14" cy="17" rx="11" ry="8" fill={c} />
          <circle cx="25" cy="14" r="4" fill="#2e2220" />
        </>
      )}
      {shape === "angel" && (
        <>
          <path d="M3 12c5-2 8 0 10 4zM29 12c-5-2-8 0-10 4z" fill={c} opacity=".8" />
          <path d="M16 11 8 29h16z" fill={c} />
          <circle cx="16" cy="8" r="4" fill="#d39f7a" />
        </>
      )}
      {shape === "dove" && (
        <path d="M3 17c6-1 9-4 11-9 1 4 3 6 7 6 3-2 6-2 8 0-3 0-4 2-5 5-2 5-9 7-15 4 2-1 3-2 3-4-3 1-6 0-9-2z" fill={c} />
      )}
    </svg>
  );
}
