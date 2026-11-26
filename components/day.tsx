"use client";

// Shared pieces of the day screens (sign-in, home, who is taking part): title, divider, icons, bottom tab bar.

import Link from "next/link";
import { useEffect, useState, type ReactNode, type SVGProps } from "react";
import { asset } from "@/lib/asset";
import { site } from "@/lib/site";
import { useT } from "@/lib/i18n";
import { xpPill } from "@/lib/ui";

/** Gold rule with a diamond in the middle. */
export const Divider = () => (
  <div aria-hidden className="mx-auto flex w-2/3 items-center gap-2">
    <span className="h-0.5 flex-1 rounded bg-gradient-to-r from-transparent to-rim" />
    <span className="size-2.5 rotate-45 bg-rim" />
    <span className="h-0.5 flex-1 rounded bg-gradient-to-l from-transparent to-rim" />
  </div>
);

/** The gold "Holy Night" headline with its subtitle. */
export function Brand({ tag }: { tag: string }) {
  const [logo, setLogo] = useState<{ src: string; alt: string } | null>(null);
  useEffect(() => setLogo(site().logo), []); // eslint-disable-line react-hooks/set-state-in-effect -- the hostname is known only in the browser
  return (
    <header className="flex flex-col items-center gap-1 text-center animate-[rise_.6s_ease-out] motion-reduce:animate-none">
      <h1 className="w-full max-w-md">
        {/* eslint-disable-next-line @next/next/no-img-element -- local art with alpha, sized by CSS */}
        {logo && <img src={asset(logo.src)} alt={logo.alt} width={1000} height={334} className="h-auto w-full drop-shadow-[0_4px_6px_rgba(60,20,0,0.45)]" />}
      </h1>
      <p className="font-display text-xl font-bold text-white italic drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] sm:text-2xl">{tag}</p>
      <div className="mt-1 w-56">
        <Divider />
      </div>
    </header>
  );
}

type Icon = SVGProps<SVGSVGElement>;
const svg = (p: Icon, children: ReactNode) => (
  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={24} height={24} {...p}>
    {children}
  </svg>
);
export const MailIcon = (p: Icon) => svg(p, <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>);
export const LockIcon = (p: Icon) => svg(p, <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>);
export const EyeIcon = ({ off, ...p }: Icon & { off?: boolean }) =>
  svg(p, <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{off && <path d="m4 4 16 16" />}</>);
export const HomeIcon = (p: Icon) => svg(p, <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></>);
export const ListIcon = (p: Icon) => svg(p, <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2h6v2M9 12l2 2 4-4" /></>);
export const VillageIcon = (p: Icon) => svg(p, <><path d="M3 21V11l5-4 5 4v10" /><path d="M13 21v-6l4-3 4 3v6M3 21h18M7 21v-4h2v4" /></>);
export const ProfileIcon = (p: Icon) => svg(p, <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>);
export const ChestIcon = (p: Icon) => svg(p, <><path d="M3 10a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v10H3z" /><path d="M3 12h18M10 12v3h4v-3" /></>);
export const TrophyIcon = (p: Icon) => svg(p, <><path d="M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8" /></>);
export const GearIcon = (p: Icon) => svg(p, <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>);
export const PencilIcon = (p: Icon) => svg(p, <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></>);
export const Chevron = (p: Icon) => svg(p, <path d="m9 5 7 7-7 7" />);
export const CloseIcon = (p: Icon) => svg(p, <path d="M6 6l12 12M18 6 6 18" />);
export const BackIcon = (p: Icon) => svg(p, <path d="m15 5-7 7 7 7" />);
export const CheckIcon = (p: Icon) => svg(p, <path d="m5 12 5 5 9-10" />);
export const BookIcon = (p: Icon) => svg(p, <><path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5z" /><path d="M12 6v14" /></>);
export const StarIcon = (p: Icon) => svg(p, <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />);
export const HeartIcon = (p: Icon) => svg(p, <path d="M12 20s-7-4.5-9-9a4.5 4.5 0 0 1 9-3 4.5 4.5 0 0 1 9 3c-2 4.5-9 9-9 9z" />);
export const MicIcon = (p: Icon) => svg(p, <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>);
export const ShareIcon = (p: Icon) => svg(p, <><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6" /></>);
export const SpeakerIcon = ({ off, ...p }: Icon & { off?: boolean }) =>
  svg(p, <><path d="M4 9h4l5-4v14l-5-4H4z" />{off ? <path d="m16 9 6 6M22 9l-6 6" /> : <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" />}</>);
export const DownloadIcon = (p: Icon) => svg(p, <path d="M12 4v11m-5-5 5 5 5-5M5 20h14" />);

const TABS = [
  { href: "/home", key: "home", Icon: HomeIcon },
  { href: "/calendar", key: "activities", Icon: ListIcon },
  { href: "/treasure", key: "treasure", Icon: ChestIcon },
  { href: "/play", key: "village", Icon: VillageIcon },
  { href: "/leaderboard", key: "leaderboard", Icon: TrophyIcon },
] as const;

/** Bottom tab bar, floating over the page; the spacer keeps the last content and buttons above it. */

export function TabBar({ current }: { current: (typeof TABS)[number]["key"] }) {
  const { t } = useT();
  return (
    <>
    <div aria-hidden className="h-[calc(5.5rem+env(safe-area-inset-bottom))] shrink-0" />
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
    <nav className="pointer-events-auto mx-auto flex w-full max-w-md gap-1 rounded-[1.75rem] border-[3px] border-rim bg-gradient-to-b from-[#24478f] to-[#0f2556] p-1.5 shadow-[0_8px_24px_rgba(10,20,50,0.45)]">
      {TABS.map(({ href, key, Icon }) => {
        const on = key === current;
        return (
          <Link
            key={key}
            href={href}
            aria-current={on ? "page" : undefined}
            className={`flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[1.25rem] text-[0.7rem] font-semibold sm:text-sm transition ${
              on ? "border-2 border-[#f5c542] bg-gradient-to-b from-[#d8333a] to-crimson-dark text-white shadow-[0_3px_0_#5a0e12]" : "text-white hover:bg-white/10"
            }`}
          >
            <Icon width={24} height={24} className="text-[#f5c542]" />
            <span className="max-w-full truncate px-0.5 font-tight">{t[key]}</span>
          </Link>
        );
      })}
    </nav>
    </div>
    </>
  );
}

/** XP with a gold star, the same everywhere. */
export function XpPill({ xp, className = "" }: { xp: number | string; className?: string }) {
  return (
    <span className={`${xpPill} ${className}`}>
      <StarIcon width={18} height={18} fill="#f5c542" stroke="#9a6a12" />
      {xp} XP
    </span>
  );
}

/** Round gold button of the treasure and leaderboard headers. */
export const roundBtn =
  "flex size-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#f5c542] bg-gradient-to-b from-[#fff3d0] to-[#e9c98a] text-crimson-dark shadow-lg transition active:scale-95";

/** Crimson banner with folded tails, a picture on top and a pill below, as on the treasure and leaderboard screens. */
export function Ribbon({ title, top, sub }: { title: ReactNode; top?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="relative flex flex-col items-center">
      {top}
      <div className="relative z-10 -mt-3 w-full max-w-sm px-2">
        <span aria-hidden className="absolute inset-x-0 top-4 -bottom-2 bg-gradient-to-b from-[#a51d24] to-[#5a0e12] [clip-path:polygon(0_0,100%_0,93%_50%,100%_100%,0_100%,7%_50%)]" />
        <h1 className="relative mx-6 rounded-2xl border-[3px] border-[#f5c542] bg-gradient-to-b from-[#d8333a] to-crimson-dark px-4 py-1.5 text-center font-display text-[clamp(1.35rem,7vw,2.3rem)] leading-tight text-balance font-black text-white shadow-lg [text-shadow:0_2px_0_#5a0e12]">
          {title}
        </h1>
      </div>
      {sub && <div className="relative z-20 -mt-2 [:lang(ml)_&]:mt-1">{sub}</div>}
    </div>
  );
}
