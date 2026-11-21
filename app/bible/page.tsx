import { Suspense } from "react";
import { Books } from "./Books";

export const metadata = { title: "Bible" };

// Books reads ?b= (the book to open) with useSearchParams, which needs <Suspense> here.
export default function BiblePage() {
  return (
    <Suspense>
      <Books />
    </Suspense>
  );
}
