"use client";

import { Bounds, Center, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Group } from "three";

function Island({ url, onReady }: { url: string; onReady: () => void }) {
  const { scene } = useGLTF(url);
  const spin = useRef<Group>(null);
  useEffect(onReady, [onReady]);
  // Sways 20° right and 20° left, never a full turn.
  useFrame(({ clock }) => {
    if (spin.current) spin.current.rotation.y = Math.sin(clock.elapsedTime * 0.4) * ((20 * Math.PI) / 180);
  });
  return (
    <group ref={spin}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

/**
 * A week's floating village as a gently swaying 3D island: a milestone to look at, not to touch.
 * The flat picture shows until the model has loaded, and stays on devices without WebGL.
 * The 3D view only exists while the island is near the screen, so phones never hold four WebGL views at once.
 */
export function VillageIsland({ glb, img, size, className = "" }: { glb: string; img: string; size: number; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const el = box.current;
    let webgl = false;
    try {
      webgl = !!document.createElement("canvas").getContext("webgl2");
    } catch {}
    if (!el || !webgl) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "300px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const show3d = near && ready;

  return (
    <div ref={box} className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- small local art */}
      <img
        src={img}
        alt=""
        width={size}
        height={size}
        className={`absolute inset-0 size-full transition-opacity duration-500 [mask-image:radial-gradient(circle,#000_50%,transparent_70%)] ${show3d ? "opacity-0" : ""}`}
      />
      {near && (
        // The view spills well past the island's box (and ignores touches), so nothing of the model is ever cut off.
        <Canvas className="pointer-events-none !absolute -inset-[40%]" style={{ width: "auto", height: "auto" }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }} camera={{ position: [0, 1.1, 3], fov: 35 }}>
          <hemisphereLight args={["#ffffff", "#806050", 2]} />
          <directionalLight position={[3, 5, 4]} intensity={2} />
          <Suspense fallback={null}>
            <Bounds fit clip margin={1.8}>
              <Island url={glb} onReady={() => setReady(true)} />
            </Bounds>
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
