"use client";

// Model check page: /models?m=santa shows public/models/santa.glb on its own. For trying new assets, not for players.

import dynamic from "next/dynamic";

const ModelCheck = dynamic(() => import("./Viewer"), { ssr: false });

export default function Models() {
  return <ModelCheck />;
}
