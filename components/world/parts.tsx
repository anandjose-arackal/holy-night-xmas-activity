"use client";

// Procedural low-poly models for Bethlehem. Geometries and materials are created once and shared.
// To swap one for a GLB later, replace its component here; positions and unlock rules live in lib/village/layout.ts.

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

export type V3 = [number, number, number];

/** Set once by the world from prefers-reduced-motion; animations read it every frame. */
export const motion = { on: true };

const std = (color: string, o: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.9, ...o });
const lit = (color: string) => new THREE.MeshBasicMaterial({ color, toneMapped: false });

export const M = {
  sand: std("#d6b68a"),
  stone: std("#d2b892"),
  stoneDark: std("#a88c6c"),
  rock: std("#9c8b94"),
  cobble: std("#c9ab86"),
  wood: std("#7a4b2c"),
  woodDark: std("#4f2f1c"),
  thatch: std("#cfa452"),
  hay: std("#e0bd5e"),
  grass: std("#6f8c46"),
  leaf: std("#5d8c3e"),
  leafDark: std("#436d36"),
  olive: std("#829e5a"),
  cypress: std("#3d5d39"),
  trunk: std("#6b4428"),
  wool: std("#f2ece1"),
  dark: std("#2e2220"),
  skin: std("#d39f7a"),
  cream: std("#efe3cc"),
  white: std("#f7f2e8"),
  maryBlue: std("#3d5ea6"),
  rose: std("#a6474a"),
  brown: std("#7a4a30"),
  tan: std("#b08a5a"),
  terracotta: std("#bf6a42"),
  burgundy: std("#7a2a35"),
  donkey: std("#9a948f"),
  ox: std("#8a4f2e"),
  horn: std("#efe2c4"),
  water: std("#4a7aa3", { roughness: 0.25, metalness: 0.1 }),
  gold: std("#d8ab4a", { metalness: 0.6, roughness: 0.35 }),
  window: lit("#ffc56a"),
  flame: lit("#ff9a3c"),
  flameCore: lit("#ffe08a"),
  halo: lit("#ffe6a0"),
};

export const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  ico: new THREE.IcosahedronGeometry(1, 0),
  ico1: new THREE.IcosahedronGeometry(1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 8),
  cone: new THREE.ConeGeometry(1, 1, 7),
  sphere: new THREE.SphereGeometry(1, 10, 8),
  circle: new THREE.CircleGeometry(1, 20),
  torus: new THREE.TorusGeometry(1, 0.15, 6, 18),
};

type BProps = { g?: keyof typeof G; m: THREE.Material; p?: V3; s?: number | V3; r?: V3 };
/** One shared-geometry mesh. */
export function B({ g = "box", m, p, s = 1, r }: BProps) {
  return <mesh geometry={G[g]} material={m} position={p} scale={s} rotation={r} castShadow receiveShadow />;
}

/** Star outline extruded into a flat low-poly star. */
export function starGeometry(points = 5, outer = 1, inner = 0.45, depth = 0.25) {
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
    shape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r);
  }
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.1, bevelSegments: 1 });
  g.center();
  return g;
}

let glow: THREE.Texture | null = null;
/** Soft round glow for stars and lights. */
export function glowTexture() {
  if (glow) return glow;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,240,200,0.55)");
  grad.addColorStop(1, "rgba(255,220,160,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  glow = new THREE.CanvasTexture(c);
  return glow;
}

export function Glow({ p, size, color = "#ffe9b0", opacity = 1 }: { p?: V3; size: number; color?: string; opacity?: number }) {
  return (
    <sprite position={p} scale={size}>
      <spriteMaterial map={glowTexture()} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </sprite>
  );
}

/** Makes a group tappable. A drag that started on it is not a tap. */
export function Pick({ onPick, children }: { onPick?: () => void; children: ReactNode }) {
  if (!onPick) return <>{children}</>;
  return (
    <group
      onClick={(e: ThreeEvent<MouseEvent>) => {
        if (e.delta > 6) return;
        e.stopPropagation();
        onPick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      {children}
    </group>
  );
}

/** Pops its children in with an ease-out when `pop` is set (a reward just unlocked). */
export function Appear({ pop, p, children }: { pop: boolean; p?: V3; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const t0 = useRef<number | null>(null);
  useFrame(({ clock }) => {
    if (!pop || !g.current || t0.current === -1) return;
    t0.current ??= clock.elapsedTime;
    const k = motion.on ? Math.min((clock.elapsedTime - t0.current) / 1.2, 1) : 1;
    g.current.scale.setScalar(Math.max(0.001, 1 - (1 - k) ** 3 + Math.sin(k * Math.PI) * 0.15));
    if (k === 1) {
      g.current.scale.setScalar(1);
      t0.current = -1;
    }
  });
  return (
    <group ref={g} position={p} scale={pop ? 0.001 : 1}>
      {children}
    </group>
  );
}

// ---------- Nature ----------

export const Rock = ({ p, s = 1, r = 0 }: { p: V3; s?: number; r?: number }) => (
  <B g="ico" m={M.rock} p={p} s={[s, s * 0.65, s * 0.85]} r={[0, r, 0.2]} />
);

export const Bush = ({ p, s = 1 }: { p: V3; s?: number }) => (
  <group position={p}>
    <B g="ico" m={M.leaf} p={[0, s * 0.35, 0]} s={[s * 0.6, s * 0.45, s * 0.6]} />
    <B g="ico" m={M.leafDark} p={[s * 0.35, s * 0.25, 0.1]} s={s * 0.35} />
  </group>
);

export const Cypress = ({ p, s = 1 }: { p: V3; s?: number }) => (
  <group position={p} scale={s}>
    <B g="cyl" m={M.trunk} p={[0, 0.2, 0]} s={[0.1, 0.4, 0.1]} />
    <B g="cone" m={M.cypress} p={[0, 1.5, 0]} s={[0.5, 2.6, 0.5]} />
  </group>
);

/** Sways gently; used by trees. */
function Sway({ children, amount = 0.025, phase = 0 }: { children: ReactNode; amount?: number; phase?: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (motion.on && g.current) g.current.rotation.z = Math.sin(clock.elapsedTime * 0.8 + phase) * amount;
  });
  return <group ref={g}>{children}</group>;
}

export const OliveTree = ({ p }: { p: V3 }) => (
  <group position={p}>
    <B g="cyl" m={M.trunk} p={[0, 0.8, 0]} s={[0.22, 1.6, 0.22]} r={[0, 0, 0.12]} />
    <B g="cyl" m={M.trunk} p={[0.35, 1.7, 0]} s={[0.12, 0.9, 0.12]} r={[0, 0, -0.6]} />
    <Sway>
      <B g="ico" m={M.olive} p={[0, 2.4, 0]} s={[1.5, 0.9, 1.3]} />
      <B g="ico" m={M.leaf} p={[0.9, 2.1, 0.3]} s={[0.9, 0.6, 0.8]} />
      <B g="ico" m={M.olive} p={[-0.8, 2.0, -0.2]} s={[0.9, 0.6, 0.9]} />
    </Sway>
  </group>
);

export function PalmTree({ p }: { p: V3 }) {
  const top: V3 = [0.5, 4.1, 0];
  return (
    <group position={p}>
      {[0, 1, 2, 3, 4].map((i) => (
        <B key={i} g="cyl" m={i % 2 ? M.tan : M.trunk} p={[i * 0.11, 0.4 + i * 0.8, 0]} s={[0.2 - i * 0.015, 0.82, 0.2 - i * 0.015]} r={[0, 0, -0.12]} />
      ))}
      <group position={top}>
        <Sway amount={0.05} phase={1}>
          {Array.from({ length: 7 }, (_, i) => (
            <group key={i} rotation-y={(i / 7) * Math.PI * 2}>
              <B g="cone" m={i % 2 ? M.leaf : M.leafDark} p={[0.95, -0.25, 0]} s={[0.28, 2, 0.06]} r={[0, 0, -(Math.PI / 2 + 0.35)]} />
            </group>
          ))}
        </Sway>
      </group>
    </group>
  );
}

export const Lilies = ({ p }: { p: V3 }) => (
  <group position={p}>
    {[[0, 0], [0.4, 0.2], [-0.35, 0.3], [0.15, -0.35], [-0.2, -0.15], [0.5, -0.2]].map(([x, z], i) => (
      <group key={i} position={[x, 0, z]}>
        <B g="cyl" m={M.leaf} p={[0, 0.25, 0]} s={[0.025, 0.5, 0.025]} />
        <B g="cone" m={M.white} p={[0, 0.55, 0]} s={[0.13, 0.22, 0.13]} r={[Math.PI, 0, 0]} />
        <B g="cone" m={M.leaf} p={[0.08, 0.12, 0]} s={[0.06, 0.3, 0.03]} r={[0, 0, -0.5]} />
      </group>
    ))}
  </group>
);

export function Pond({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <mesh geometry={G.circle} material={M.water} rotation-x={-Math.PI / 2} position-y={0.04} scale={[2, 1.4, 1]} receiveShadow />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <Rock key={i} p={[Math.cos(a) * 2.05, 0.1, Math.sin(a) * 1.45]} s={0.32 + (i % 3) * 0.08} r={i} />;
      })}
      {[[-1.2, -0.6], [-1, -0.9], [1.3, 0.5]].map(([x, z], i) => (
        <B key={i} g="cone" m={M.leafDark} p={[x, 0.35, z]} s={[0.05, 0.7, 0.05]} />
      ))}
    </group>
  );
}

// ---------- Village ----------

export function House({ p, w = 3, h = 2.6, d = 3, rot = 0, door = true }: { p: V3; w?: number; h?: number; d?: number; rot?: number; door?: boolean }) {
  return (
    <group position={p} rotation-y={rot}>
      <B m={M.stone} p={[0, h / 2, 0]} s={[w, h, d]} />
      <B m={M.stoneDark} p={[0, h + 0.08, 0]} s={[w + 0.2, 0.16, d + 0.2]} />
      <B m={M.stone} p={[0, h + 0.3, -d / 2 + 0.1]} s={[w + 0.2, 0.3, 0.2]} />
      <B m={M.window} p={[-w * 0.25, h * 0.62, d / 2 + 0.01]} s={[0.4, 0.5, 0.02]} />
      <B m={M.window} p={[w * 0.28, h * 0.62, d / 2 + 0.01]} s={[0.4, 0.5, 0.02]} />
      {door && <B m={M.burgundy} p={[0, 0.55, d / 2 + 0.02]} s={[0.6, 1.1, 0.04]} />}
    </group>
  );
}

export function Well({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <B g="cyl" m={M.stone} p={[0, 0.4, 0]} s={[0.95, 0.8, 0.95]} />
      <mesh geometry={G.circle} material={M.dark} rotation-x={-Math.PI / 2} position-y={0.81} scale={0.72} />
      {[-0.95, 0.95].map((x) => (
        <B key={x} m={M.wood} p={[x, 1.1, 0]} s={[0.14, 2.2, 0.14]} />
      ))}
      <B m={M.wood} p={[0, 2.15, 0]} s={[2.2, 0.14, 0.14]} />
      <B g="cyl" m={M.cream} p={[0, 1.75, 0]} s={[0.015, 0.8, 0.015]} />
      <B g="cyl" m={M.wood} p={[0, 1.28, 0]} s={[0.18, 0.25, 0.18]} />
      <B g="sphere" m={M.terracotta} p={[1.2, 0.3, 0.6]} s={[0.25, 0.3, 0.25]} />
    </group>
  );
}

export function Lantern({ p, forceOn }: { p: V3; forceOn?: boolean }) {
  const [on, setOn] = useState(true);
  const mat = useMemo(() => lit("#ffcf7a"), []);
  useFrame(({ clock }) => {
    const lightOn = on || forceOn;
    const f = lightOn ? (motion.on ? 0.9 + Math.sin(clock.elapsedTime * 9 + p[0] * 3) * 0.06 + Math.sin(clock.elapsedTime * 23 + p[2]) * 0.04 : 1) : 0.18;
    mat.color.setRGB(1 * f, 0.8 * f, 0.45 * f);
  });
  return (
    <Pick onPick={() => setOn((v) => !v)}>
      <group position={p}>
        <B g="cyl" m={M.woodDark} p={[0, 0.75, 0]} s={[0.06, 1.5, 0.06]} />
        <B m={M.woodDark} p={[0, 1.55, 0]} s={[0.36, 0.06, 0.36]} />
        <B m={M.woodDark} p={[0, 2.0, 0]} s={[0.42, 0.08, 0.42]} />
        <mesh geometry={G.box} material={mat} position={[0, 1.78, 0]} scale={[0.28, 0.38, 0.28]} />
        {(on || forceOn) && <Glow p={[0, 1.78, 0]} size={1.4} opacity={0.6} />}
      </group>
    </Pick>
  );
}

export function Campfire({ p }: { p: V3 }) {
  const f = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!motion.on || !f.current) return;
    const t = clock.elapsedTime;
    f.current.scale.set(1, 1 + Math.sin(t * 11) * 0.12 + Math.sin(t * 7) * 0.08, 1);
    if (light.current) light.current.intensity = 14 + Math.sin(t * 13) * 2;
  });
  return (
    <group position={p}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <Rock key={i} p={[Math.cos(a) * 0.6, 0.1, Math.sin(a) * 0.6]} s={0.2} r={i} />;
      })}
      {[0, 1, 2].map((i) => (
        <B key={i} g="cyl" m={M.wood} p={[0, 0.15, 0]} s={[0.07, 0.8, 0.07]} r={[Math.PI / 2 - 0.3, (i * Math.PI) / 3, 0]} />
      ))}
      <group ref={f}>
        <mesh geometry={G.cone} material={M.flame} position={[0, 0.5, 0]} scale={[0.3, 0.75, 0.3]} />
        <mesh geometry={G.cone} material={M.flameCore} position={[0, 0.42, 0]} scale={[0.16, 0.45, 0.16]} />
      </group>
      <Glow p={[0, 0.6, 0]} size={2.4} color="#ffb060" opacity={0.7} />
      <pointLight ref={light} position={[0, 1, 0]} color="#ff9a4a" intensity={14} distance={9} decay={1.6} />
    </group>
  );
}

export const Woodpile = ({ p }: { p: V3 }) => (
  <group position={p}>
    {[[-0.2, 0.12], [0, 0.12], [0.2, 0.12], [-0.1, 0.3], [0.1, 0.3], [0, 0.48]].map(([x, y], i) => (
      <B key={i} g="cyl" m={i % 2 ? M.wood : M.tan} p={[x * 1.1, y, 0]} s={[0.11, 0.9, 0.11]} r={[Math.PI / 2, 0, 0]} />
    ))}
  </group>
);

export const Gift = ({ p }: { p: V3 }) => (
  <group position={p} rotation-y={0.4}>
    <B m={M.burgundy} p={[0, 0.3, 0]} s={0.6} />
    <B m={M.gold} p={[0, 0.3, 0]} s={[0.62, 0.62, 0.12]} />
    <B m={M.gold} p={[0, 0.3, 0]} s={[0.12, 0.62, 0.62]} />
    <B g="torus" m={M.gold} p={[0, 0.66, 0]} s={0.12} r={[0, 0, 0]} />
    <B m={M.leafDark} p={[0.7, 0.2, 0.2]} s={0.4} />
    <B m={M.gold} p={[0.7, 0.2, 0.2]} s={[0.42, 0.42, 0.08]} />
  </group>
);

export const Bench = ({ p, rot = 0 }: { p: V3; rot?: number }) => (
  <group position={p} rotation-y={rot}>
    <B m={M.wood} p={[0, 0.45, 0]} s={[1.6, 0.1, 0.45]} />
    <B m={M.woodDark} p={[-0.6, 0.22, 0]} s={[0.12, 0.45, 0.4]} />
    <B m={M.woodDark} p={[0.6, 0.22, 0]} s={[0.12, 0.45, 0.4]} />
  </group>
);

// ---------- Stable ----------

export const StableFoundation = () => (
  <group>
    <B m={M.stoneDark} p={[0, 0.12, 0]} s={[6.6, 0.25, 4.4]} />
    {[[-3.2, -2.1], [3.2, -2.1], [-3.2, 2.1], [3.2, 2.1]].map(([x, z], i) => (
      <B key={i} m={M.stone} p={[x, 0.3, z]} s={0.5} />
    ))}
  </group>
);

export function StableWalls() {
  return (
    <group>
      {[[-3, -1.9], [3, -1.9], [-3, 1.9], [3, 1.9]].map(([x, z], i) => (
        <B key={i} g="cyl" m={M.wood} p={[x, 1.6, z]} s={[0.16, 3.2, 0.16]} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <B key={i} m={i % 2 ? M.wood : M.woodDark} p={[-2.63 + i * 0.75, 1.4, -1.9]} s={[0.74, 2.6, 0.14]} />
      ))}
      {[-3, 3].map((x) =>
        [0.5, 1.05].map((y) => <B key={`${x}${y}`} m={M.wood} p={[x, y, 0]} s={[0.12, 0.18, 3.8]} />),
      )}
      <B m={M.hay} p={[-2.2, 0.55, -1.2]} s={[1.1, 0.6, 0.7]} />
      <B m={M.hay} p={[2.3, 0.55, -1.3]} s={[0.9, 0.6, 0.6]} />
      <B m={M.wood} p={[0, 3.1, 1.9]} s={[6.2, 0.2, 0.2]} />
    </group>
  );
}

export const StableRoof = () => (
  <group position={[0, 3.25, 0]}>
    <B m={M.thatch} p={[0, 0.55, -1.15]} s={[7.2, 0.28, 2.75]} r={[0.45, 0, 0]} />
    <B m={M.thatch} p={[0, 0.55, 1.15]} s={[7.2, 0.28, 2.75]} r={[-0.45, 0, 0]} />
    <B g="cyl" m={M.woodDark} p={[0, 1.15, 0]} s={[0.14, 7.4, 0.14]} r={[0, 0, Math.PI / 2]} />
  </group>
);

export const Manger = ({ p }: { p: V3 }) => (
  <group position={p}>
    {[-0.45, 0.45].map((x) => (
      <group key={x} position={[x, 0.3, 0]}>
        <B m={M.wood} s={[0.08, 0.7, 0.08]} r={[0.5, 0, 0]} />
        <B m={M.wood} s={[0.08, 0.7, 0.08]} r={[-0.5, 0, 0]} />
      </group>
    ))}
    <B m={M.wood} p={[0, 0.6, 0]} s={[1.15, 0.3, 0.6]} />
    <B g="ico" m={M.hay} p={[0, 0.78, 0]} s={[0.55, 0.14, 0.3]} />
  </group>
);

// ---------- People and animals ----------

type PersonProps = { p: V3; rot?: number; robe: THREE.Material; cloth: THREE.Material; height?: number; kneel?: boolean; staff?: boolean };

export function Person({ p, rot = 0, robe, cloth, height = 1.5, kneel, staff }: PersonProps) {
  const body = kneel ? height * 0.62 : height;
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (motion.on && g.current) g.current.scale.y = 1 + Math.sin(clock.elapsedTime * 1.6 + p[0]) * 0.012; // breathing
  });
  return (
    <group position={p} rotation-y={rot}>
      <group ref={g}>
        <B g="cone" m={robe} p={[0, body / 2, 0]} s={[kneel ? 0.5 : 0.42, body, kneel ? 0.5 : 0.42]} />
        <B g="cyl" m={robe} p={[0, body * 0.72, 0.18]} s={[0.07, 0.42, 0.07]} r={[1.1, 0, 0.35]} />
        <B g="cyl" m={robe} p={[0, body * 0.72, 0.18]} s={[0.07, 0.42, 0.07]} r={[1.1, 0, -0.35]} />
        <B g="sphere" m={M.skin} p={[0, body * 0.78, 0.34]} s={0.07} />
        <B g="sphere" m={M.skin} p={[0, body + 0.12, 0.02]} s={0.2} />
        <B g="sphere" m={cloth} p={[0, body + 0.17, -0.05]} s={[0.24, 0.23, 0.24]} />
        <B g="cone" m={cloth} p={[0, body - 0.05, -0.12]} s={[0.26, 0.5, 0.2]} />
      </group>
      {staff && <B g="cyl" m={M.wood} p={[0.38, body * 0.62, 0.12]} s={[0.035, body * 1.25, 0.035]} />}
      {staff && <B g="torus" m={M.wood} p={[0.3, body * 1.24 + 0.05, 0.12]} s={0.09} r={[0, 0, 0]} />}
    </group>
  );
}

export function Angel({ p, rot = 0 }: { p: V3; rot?: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (motion.on && g.current) g.current.position.y = p[1] + Math.sin(clock.elapsedTime * 1.2 + p[0]) * 0.2;
  });
  return (
    <group ref={g} position={p} rotation-y={rot}>
      <B g="cone" m={M.white} p={[0, 0.75, 0]} s={[0.45, 1.5, 0.45]} />
      <B g="sphere" m={M.skin} p={[0, 1.62, 0]} s={0.19} />
      <B g="sphere" m={M.thatch} p={[0, 1.68, -0.05]} s={[0.21, 0.19, 0.21]} />
      <mesh geometry={G.torus} material={M.halo} position={[0, 1.95, 0]} rotation-x={Math.PI / 2} scale={0.2} />
      <B g="ico" m={M.white} p={[-0.42, 1.15, -0.25]} s={[0.5, 0.7, 0.1]} r={[0, 0.5, 0.5]} />
      <B g="ico" m={M.white} p={[0.42, 1.15, -0.25]} s={[0.5, 0.7, 0.1]} r={[0, -0.5, -0.5]} />
      <Glow p={[0, 1.1, 0]} size={3.5} opacity={0.35} />
    </group>
  );
}

export const BabyJesus = ({ p }: { p: V3 }) => (
  <group position={p}>
    <B g="sphere" m={M.cream} p={[0, 0, 0]} s={[0.3, 0.14, 0.16]} />
    <B g="sphere" m={M.skin} p={[0.27, 0.05, 0]} s={0.1} />
    <mesh geometry={G.torus} material={M.halo} position={[0.33, 0.07, 0]} rotation-y={Math.PI / 2} scale={0.14} />
    <Glow p={[0, 0.2, 0]} size={2} opacity={0.9} />
    <pointLight position={[0, 0.8, 0.4]} color="#ffdca0" intensity={4} distance={4} decay={1.5} />
  </group>
);

export function Sheep({ lying }: { lying?: boolean }) {
  return (
    <group>
      <B g="ico1" m={M.wool} p={[0, lying ? 0.28 : 0.55, 0]} s={[0.42, 0.36, 0.55]} />
      <B g="ico" m={M.tan} p={[0, lying ? 0.38 : 0.62, 0.55]} s={[0.15, 0.18, 0.2]} />
      <B g="ico" m={M.wool} p={[0, lying ? 0.5 : 0.75, 0.5]} s={0.13} />
      {!lying &&
        [[-0.2, -0.3], [0.2, -0.3], [-0.2, 0.3], [0.2, 0.3]].map(([x, z], i) => (
          <B key={i} g="cyl" m={M.dark} p={[x, 0.18, z]} s={[0.05, 0.36, 0.05]} />
        ))}
    </group>
  );
}

/** A sheep that ambles to and fro across its spot and stops now and then to graze. Deterministic, no physics. */
export function WanderSheep({ radius, phase, speed = 0.25 }: { radius: number; phase: number; speed?: number }) {
  const g = useRef<THREE.Group>(null);
  const a = useRef(phase);
  useFrame(({ clock }, dt) => {
    if (!g.current) return;
    const grazing = Math.sin(clock.elapsedTime * 0.35 + phase * 3) > 0.2;
    if (motion.on && !grazing) a.current += Math.min(dt, 0.1) * speed;
    const t = a.current;
    g.current.position.x = Math.sin(t) * radius;
    g.current.rotation.y = Math.cos(t) >= 0 ? Math.PI / 2 : -Math.PI / 2; // face the way it walks
    g.current.rotation.x = motion.on && grazing ? 0.12 : 0;
  });
  return (
    <group ref={g}>
      <Sheep />
    </group>
  );
}

export const Donkey = ({ p, rot = 0 }: { p: V3; rot?: number }) => (
  <group position={p} rotation-y={rot}>
    <B m={M.donkey} p={[0, 0.85, 0]} s={[0.55, 0.55, 1.1]} />
    {[[-0.2, -0.4], [0.2, -0.4], [-0.2, 0.4], [0.2, 0.4]].map(([x, z], i) => (
      <B key={i} m={M.donkey} p={[x, 0.32, z]} s={[0.12, 0.65, 0.12]} />
    ))}
    <B m={M.donkey} p={[0, 1.25, 0.55]} s={[0.25, 0.6, 0.25]} r={[0.5, 0, 0]} />
    <B m={M.donkey} p={[0, 1.55, 0.78]} s={[0.26, 0.28, 0.5]} />
    <B m={M.cream} p={[0, 1.5, 1.02]} s={[0.2, 0.18, 0.08]} />
    <B g="cone" m={M.donkey} p={[-0.1, 1.85, 0.65]} s={[0.06, 0.4, 0.04]} r={[-0.2, 0, -0.2]} />
    <B g="cone" m={M.donkey} p={[0.1, 1.85, 0.65]} s={[0.06, 0.4, 0.04]} r={[-0.2, 0, 0.2]} />
    <B m={M.dark} p={[0, 1.3, 0.48]} s={[0.06, 0.5, 0.25]} r={[0.5, 0, 0]} />
  </group>
);

export const Ox = ({ p, rot = 0 }: { p: V3; rot?: number }) => (
  <group position={p} rotation-y={rot}>
    <B m={M.ox} p={[0, 0.38, 0]} s={[0.85, 0.65, 1.3]} />
    <B m={M.ox} p={[0, 0.65, 0.78]} s={[0.45, 0.45, 0.45]} />
    <B m={M.cream} p={[0, 0.55, 1.02]} s={[0.32, 0.22, 0.08]} />
    <B g="cone" m={M.horn} p={[-0.3, 0.95, 0.75]} s={[0.06, 0.32, 0.06]} r={[0, 0, 0.9]} />
    <B g="cone" m={M.horn} p={[0.3, 0.95, 0.75]} s={[0.06, 0.32, 0.06]} r={[0, 0, -0.9]} />
  </group>
);
