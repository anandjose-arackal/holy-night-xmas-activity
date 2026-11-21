import type { Metadata, Viewport } from "next";
import { Anek_Malayalam, Merriweather, Noto_Sans, Noto_Sans_Malayalam } from "next/font/google";
import "./globals.css";

const latin = Noto_Sans({ variable: "--font-latin", subsets: ["latin"] });
const malayalam = Noto_Sans_Malayalam({ variable: "--font-ml", subsets: ["malayalam"] });
// Condensed Malayalam for headings and tight labels; the width axis lets font-stretch narrow it.
const malayalamTight = Anek_Malayalam({ variable: "--font-ml-tight", subsets: ["malayalam"], axes: ["wdth"] });
// Headings on the day screens; Malayalam falls back to Anek Malayalam.
const serif = Merriweather({ variable: "--font-serif", subsets: ["latin"], weight: ["700", "900"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "Bethlehem — 25 days to Christmas",
  description: "A daily Scripture, prayer and kindness journey for children, building a Bethlehem village on the way to Christmas.",
};

export const viewport: Viewport = { themeColor: "#24151a", viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${latin.variable} ${malayalam.variable} ${malayalamTight.variable} ${serif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
