import { notFound } from "next/navigation";
import { Suspense } from "react";
import { missions } from "@/content/missions";
import { MissionView } from "./MissionView";

export const generateStaticParams = () => missions.map((m) => ({ day: String(m.day) }));

// With Partial Prefetching, params must be awaited inside <Suspense>.
export default function Day({ params }: PageProps<"/day/[day]">) {
  return (
    <Suspense>
      <DayContent params={params} />
    </Suspense>
  );
}

async function DayContent({ params }: Pick<PageProps<"/day/[day]">, "params">) {
  const { day } = await params;
  const mission = missions.find((m) => String(m.day) === day);
  if (!mission) notFound();
  return <MissionView mission={mission} />;
}
