import Link from "next/link";

// DRAFT. Have someone qualified review this before launch (India DPDP Act; COPPA if US families use it).
// Replace OPERATOR and CONTACT below with the real name and address.
const OPERATOR = "[NAME OF PERSON OR PARISH RUNNING THIS APP]";
const CONTACT = "[CONTACT EMAIL]";

export default function Privacy() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 p-4 [&_h2]:font-semibold [&_h2]:text-gold [&_li]:ml-5 [&_li]:list-disc">
      <h1 className="text-2xl font-bold text-gold">Privacy notice</h1>
      <p>
        Bethlehem is run by {OPERATOR}. It is made for children, so it collects as little as it can. Accounts
        belong to a parent or guardian; children never sign in or give an email address.
      </p>

      <h2>What we store</h2>
      <ul>
        <li>The guardian&apos;s email address or phone number, used only to sign in.</li>
        <li>
          For each child: their full name, a chosen picture, a language, their diocese, meghala and parish, and their
          progress (completed steps, XP and their village).
        </li>
      </ul>

      <h2>What we do not collect</h2>
      <ul>
        <li>No birth dates, photos, home address or location, or anything a child types.</li>
        <li>No advertising, no tracking, and no selling or sharing of data.</li>
        <li>
          No voice recordings. Pray now uses the microphone only while that prayer is open, to check that your child is
          speaking aloud. Audio stays on this phone and is never recorded, stored or uploaded, and no words are
          transcribed. We keep only that the prayer was done and the number of seconds spoken.
        </li>
      </ul>

      <h2>Where it is kept</h2>
      <p>
        Data is stored with our hosting providers, Supabase (database and sign-in) and Vercel (website). Only the
        guardian who created a child profile can read or change it.
      </p>

      <h2>The leaderboard</h2>
      <p>
        Every child appears on the Advent leaderboard with their full name, their parish and their XP. Everyone signed
        in to the app can see it. Nothing else about a child is shown to other families.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Remove a single child profile at any time from the &quot;Who is playing?&quot; screen.</li>
        <li>
          &quot;Delete my account and all data&quot; on the same screen erases the account, every child profile and
          all progress immediately and permanently.
        </li>
        <li>Questions or requests: {CONTACT}</li>
      </ul>

      <h2>Consent</h2>
      <p>
        By signing in you confirm that you are a parent or guardian aged 18 or over and that you agree to this
        notice on behalf of the children you add.
      </p>

      <Link href="/" className="underline">
        Back
      </Link>
    </main>
  );
}
