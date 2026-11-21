import { Suspense } from "react";
import { Reader } from "./Reader";

export const metadata = { title: "Bible" };

// Reader reads ?b=&c= with useSearchParams, which needs <Suspense> here.
export default function ReadPage() {
  return (
    <Suspense>
      <Reader />
    </Suspense>
  );
}
