"use client";

import { Bounds, Center, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { asset } from "@/lib/asset";

const NAMES = ["tree", "mary", "santa"]; // quick picks; ?m=<name> opens any file in public/models

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function ModelCheck() {
  const [name, setName] = useState(() => new URLSearchParams(location.search).get("m") ?? NAMES[0]);
  // ?cam=3,0,0 views from the side
  const [cam] = useState(() => (new URLSearchParams(location.search).get("cam") ?? "0,1,3").split(",").map(Number) as [number, number, number]);
  return (
    <main className="relative h-dvh">
      <Canvas key={name} camera={{ position: cam, fov: 40 }}>
        <color attach="background" args={["#2c2040"]} />
        <hemisphereLight args={["#ffffff", "#806050", 2]} />
        <directionalLight position={[3, 5, 4]} intensity={2} />
        <Suspense fallback={null}>
          <Bounds fit clip margin={1.2}>
            <Center>
              <Model url={asset(`/models/${name}.glb`)} />
            </Center>
          </Bounds>
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
      <nav className="absolute top-2 left-2 flex gap-2">
        {NAMES.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={n === name}
            className="min-h-11 rounded-xl border border-cream/30 bg-night/80 px-3 aria-pressed:bg-gold aria-pressed:text-night"
            onClick={() => setName(n)}
          >
            {n}
          </button>
        ))}
      </nav>
    </main>
  );
}
