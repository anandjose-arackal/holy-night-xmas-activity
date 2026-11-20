"use client";

import { Sparkles, useGLTF } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  ANCHORS,
  FEATURES,
  ORNAMENTS,
  TIERS,
  TREE_TOP,
  has,
  nearestFree,
  spiral,
  type OrnamentKind,
  type Shape,
  type TreeState,
} from "@/lib/tree";
import { asset } from "@/lib/asset";
import { PIECES } from "@/lib/village/layout";
import { B, G, Glow, M, motion, Pick, starGeometry, type V3 } from "./parts";
import { Model } from "./VillageScene";
import type { WorldApi } from "./World";


const BULB_COLORS = {
  champagne: ["#ffe2a8"],
  candle: ["#ffb25a", "#ffcf7a"],
  multi: ["#ff6b6b", "#ffd25a", "#7ad4ff", "#8af0a0", "#ffa6e0"],
};

// ---------- geometry built once ----------

function jitteredCone(r: number, h: number, seed: number) {
  const g = new THREE.ConeGeometry(r, h, 9, 2);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y > h / 2 - 0.01) continue; // keep the tip sharp
    const n = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
    const k = 1 + ((n - Math.floor(n)) - 0.5) * 0.16;
    pos.setX(i, pos.getX(i) * k);
    pos.setZ(i, pos.getZ(i) * k);
  }
  g.computeVertexNormals();
  return g;
}

const tierGeos = TIERS.map((t, i) => jitteredCone(t.r, t.h, i));
const star5 = starGeometry(5, 1, 0.45, 0.25);
const star8 = starGeometry(8, 1, 0.42, 0.3);
const bulbGeo = new THREE.SphereGeometry(0.055, 6, 5);
const ornamentMats = new Map<string, THREE.MeshStandardMaterial>();
const ornMat = (color: string) => {
  if (!ornamentMats.has(color))
    ornamentMats.set(color, new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.35, metalness: 0.35, emissive: color, emissiveIntensity: 0.12 }));
  return ornamentMats.get(color)!;
};
const ghostMat = new THREE.MeshBasicMaterial({ color: "#fff4d6", transparent: true, opacity: 0.55, depthWrite: false });
const selMat = new THREE.MeshBasicMaterial({ color: "#fff1c2", toneMapped: false });

/** Leaf tips around each tier's rim, like the faceted branches in the art direction. */
function LeafTips() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const tips = useMemo(
    () =>
      TIERS.flatMap((t, i) =>
        Array.from({ length: 12 }, (_, j) => ({ t, a: ((j + i * 0.5) / 12) * Math.PI * 2, s: 0.75 + (j % 3) * 0.12 })),
      ),
    [],
  );
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    tips.forEach(({ t, a, s }, i) => {
      const r = t.r * 0.86;
      o.position.set(Math.sin(a) * r, t.y + 0.12, Math.cos(a) * r);
      o.rotation.set(0, a, 0);
      o.rotateX(Math.PI / 2 + 0.55); // point outward and down
      o.scale.set(0.24 * s * t.r, 0.6 * s * t.r, 0.12 * t.r);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    ref.current!.computeBoundingSphere();
  }, [tips]);
  return <instancedMesh ref={ref} args={[G.cone, M.leafDark, tips.length]} castShadow />;
}

function Lights({ pts, color, on }: { pts: V3[]; color: keyof typeof BULB_COLORS; on: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    const palette = BULB_COLORS[color];
    pts.forEach((p, i) => {
      o.position.set(...p);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
      ref.current!.setColorAt(i, on ? c.set(palette[i % palette.length]) : c.set("#4a4038"));
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
    ref.current!.computeBoundingSphere();
  }, [pts, color, on]);
  useFrame(({ clock }) => {
    if (on && motion.on) mat.color.setScalar(0.85 + Math.sin(clock.elapsedTime * 2.2) * 0.15);
    else mat.color.setScalar(1);
  });
  return (
    <>
      <instancedMesh ref={ref} args={[bulbGeo, mat, pts.length]} />
      {on && <pointLight position={[0, 2.2, 1.6]} color={BULB_COLORS[color][0]} intensity={10} distance={7} decay={1.5} />}
    </>
  );
}

function Garland({ pts }: { pts: V3[] }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, 160, 0.028, 5, false);
  }, [pts]);
  return <mesh geometry={geo} material={M.gold} />;
}

// ---------- ornaments ----------

function OrnamentShape({ shape, mat }: { shape: Shape; mat: THREE.Material }) {
  switch (shape) {
    case "ball":
      return (
        <>
          <mesh geometry={G.ico1} material={mat} scale={0.12} />
          <mesh geometry={G.cyl} material={M.gold} position-y={0.13} scale={[0.035, 0.05, 0.035]} />
        </>
      );
    case "bell":
      return (
        <>
          <mesh geometry={G.cone} material={mat} position-y={0.02} scale={[0.12, 0.2, 0.12]} />
          <mesh geometry={G.sphere} material={M.gold} position-y={-0.09} scale={0.035} />
        </>
      );
    case "bow":
      return (
        <>
          <mesh geometry={G.cone} material={mat} position-x={-0.08} rotation-z={-Math.PI / 2} scale={[0.07, 0.16, 0.04]} />
          <mesh geometry={G.cone} material={mat} position-x={0.08} rotation-z={Math.PI / 2} scale={[0.07, 0.16, 0.04]} />
          <mesh geometry={G.sphere} material={mat} scale={0.04} />
          <mesh geometry={G.box} material={mat} position={[-0.04, -0.1, 0]} rotation-z={0.3} scale={[0.03, 0.16, 0.02]} />
          <mesh geometry={G.box} material={mat} position={[0.04, -0.1, 0]} rotation-z={-0.3} scale={[0.03, 0.16, 0.02]} />
        </>
      );
    case "star":
      return <mesh geometry={star5} material={mat} scale={0.13} />;
    case "snowflake":
      return (
        <>
          {[0, 1, 2].map((i) => (
            <mesh key={i} geometry={G.box} material={mat} rotation-z={(i * Math.PI) / 3} scale={[0.025, 0.26, 0.02]} />
          ))}
        </>
      );
    case "crook":
      return (
        <>
          <mesh geometry={G.cyl} material={mat} position-y={-0.04} scale={[0.02, 0.24, 0.02]} />
          <mesh geometry={G.torus} material={mat} position={[0.05, 0.08, 0]} scale={0.055} />
        </>
      );
    case "sheep":
      return (
        <>
          <mesh geometry={G.ico1} material={mat} scale={[0.11, 0.09, 0.08]} />
          <mesh geometry={G.ico} material={M.dark} position={[0.1, 0.03, 0.02]} scale={0.045} />
        </>
      );
    case "angel":
      return (
        <>
          <mesh geometry={G.cone} material={mat} position-y={-0.03} scale={[0.08, 0.2, 0.08]} />
          <mesh geometry={G.sphere} material={M.skin} position-y={0.1} scale={0.04} />
          <mesh geometry={G.ico} material={mat} position={[-0.07, 0.02, -0.02]} scale={[0.07, 0.09, 0.02]} />
          <mesh geometry={G.ico} material={mat} position={[0.07, 0.02, -0.02]} scale={[0.07, 0.09, 0.02]} />
        </>
      );
    case "dove":
      return (
        <>
          <mesh geometry={G.sphere} material={mat} scale={[0.12, 0.06, 0.06]} />
          <mesh geometry={G.ico} material={mat} position={[0, 0.06, 0]} rotation-x={0.4} scale={[0.06, 0.02, 0.1]} />
          <Glow size={0.5} opacity={0.6} />
        </>
      );
  }
}

/** Baubles with a model; the other ornaments are drawn. */
const BAUBLES: Partial<Record<OrnamentKind, string>> = { red: asset("/models/ball-red.glb"), gold: asset("/models/ball-gold.glb"), green: asset("/models/ball-green.glb") };

/** One bauble model, scaled to the drawn bauble's size (0.24 across) and centred on the hook point. */
function Bauble({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const fit = useMemo(() => {
    const obj = scene.clone(); // up to 80 on one tree: each needs its own copy
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const s = 0.26 / (Math.max(size.x, size.y, size.z) || 1);
    const c = box.getCenter(new THREE.Vector3());
    return { obj, s, p: [-c.x * s, -c.y * s, -c.z * s] as V3 };
  }, [scene]);
  return (
    <group scale={fit.s} position={fit.p}>
      <primitive object={fit.obj} />
    </group>
  );
}

function Ornament({ kind, at, ghost, selected, onDown }: { kind: OrnamentKind; at: V3; ghost?: boolean; selected?: boolean; onDown?: (e: ThreeEvent<PointerEvent>) => void }) {
  const [x, y, z] = at;
  const o = ORNAMENTS[kind];
  return (
    <group position={[x, y, z]} rotation-y={Math.atan2(x, z)} onPointerDown={onDown}>
      <mesh geometry={G.cyl} material={M.gold} position-y={0.17} scale={[0.006, 0.12, 0.006]} />
      {BAUBLES[kind] && !ghost ? (
        // Its own fallback: while the model loads, the drawn bauble shows instead of the whole scene blanking.
        <Suspense fallback={<OrnamentShape shape={o.shape} mat={ornMat(o.color)} />}>
          <Bauble url={BAUBLES[kind]} />
        </Suspense>
      ) : (
        <OrnamentShape shape={o.shape} mat={ghost ? ghostMat : ornMat(o.color)} />
      )}
      {selected && <mesh geometry={G.torus} material={selMat} rotation-x={Math.PI / 2} position-y={-0.2} scale={0.16} />}
    </group>
  );
}

// ---------- the tree ----------

type Props = {
  position: V3;
  scale: number;
  state: TreeState | null;
  days: number[];
  christmas: boolean;
  editing: boolean;
  selected: number;
  preview: { anchor: number; kind: OrnamentKind } | null;
  sparkles: boolean;
  onApi: (patch: Partial<WorldApi>) => void;
  onPick: () => void;
  onTap: (anchor: number) => void;
  onOrnamentDown: (anchor: number, e: PointerEvent) => void;
};

export function ChristmasTree({ position, scale, state, days, christmas, editing, selected, preview, sparkles, onApi, onPick, onTap, onOrnamentDown }: Props) {
  const root = useRef<THREE.Group>(null);
  const foliage = useRef<THREE.Group>(null);
  const topper = useRef<THREE.Group>(null);
  const { camera, gl, raycaster, controls } = useThree();
  const used = useMemo(() => new Set(state?.items.map((i) => i.a) ?? []), [state]);

  // Hanging points, lights and garland start on the cone outline of lib/tree and are moved onto the model's branches.
  const [surface, setSurface] = useState<{ anchors: V3[]; lights: Record<18 | 54, V3[]>; garland: V3[] } | null>(null);
  useLayoutEffect(() => {
    const r = root.current!;
    const f = foliage.current!;
    r.updateMatrixWorld(true);
    // One pass over the model's points: the outer radius of the tree per height band and angle sector.
    // (Raycasting each point against the mesh took seconds and froze phones on the loading screen.)
    const BANDS = 48;
    const SECTORS = 24;
    const top = TREE_TOP + 0.5;
    const band = (y: number) => Math.min(BANDS - 1, Math.max(0, Math.floor((y / top) * BANDS)));
    const sector = (x: number, z: number) => Math.floor((((Math.atan2(x, z) / (2 * Math.PI)) % 1) + 1) % 1 * SECTORS) % SECTORS;
    const outer = new Float32Array(BANDS * SECTORS);
    const toRoot = r.matrixWorld.clone().invert();
    const m = new THREE.Matrix4();
    const v = new THREE.Vector3();
    f.traverse((o) => {
      const mesh = o as THREE.Mesh;
      const pos = mesh.isMesh ? mesh.geometry.attributes.position : undefined;
      if (!pos || mesh.material instanceof THREE.ShaderMaterial) return; // skip the ground shadow
      m.multiplyMatrices(toRoot, mesh.matrixWorld);
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(m);
        if (v.y < 0 || v.y > top) continue;
        const k = band(v.y) * SECTORS + sector(v.x, v.z);
        outer[k] = Math.max(outer[k], Math.hypot(v.x, v.z));
      }
    });
    const onto = (pts: V3[], out: number) =>
      pts.map(([x, y, z]): V3 => {
        const rad = outer[band(y) * SECTORS + sector(x, z)];
        if (!rad) return [x, y, z];
        const k = (rad * 0.92 + out) / (Math.hypot(x, z) || 1); // just inside the outermost needle tips
        return [x * k, y, z * k];
      });
    setSurface({
      anchors: onto(ANCHORS, 0.05),
      lights: { 18: onto(spiral(18, 5.5, 0.4, 0), 0.07), 54: onto(spiral(54, 5.5, 0.4, 0), 0.07) },
      garland: onto(spiral(60, 3.5, 2.2, 0), 0.03),
    });
  }, []);
  const anchors = surface?.anchors ?? ANCHORS;

  // Screen point -> nearest free anchor, for drag and drop from the ornament tray.
  useEffect(() => {
    const pick: WorldApi["pick"] = (cx, cy, exclude) => {
      if (!foliage.current || !root.current) return -1;
      const rect = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(foliage.current, true)[0];
      if (!hit) return -1;
      const local = root.current.worldToLocal(hit.point.clone());
      const taken = new Set(used);
      if (exclude !== undefined) taken.delete(exclude);
      return nearestFree(local, taken, undefined, anchors);
    };
    onApi({ pick });
  }, [onApi, camera, gl, raycaster, used, anchors]);

  useFrame(({ clock }) => {
    if (topper.current && motion.on) topper.current.rotation.y = Math.sin(clock.elapsedTime * 0.6) * 0.4;
  });

  const lightsUnlocked = has(days, FEATURES.lights) || christmas;
  const lightsOn = (state?.lights ?? false) || christmas;
  const bulbCount = has(days, FEATURES.lightString) || christmas ? 54 : 18;
  const showTopper = has(days, FEATURES.topper) || christmas;

  // The view of the painting is fixed, so while decorating a sideways drag on the branches turns the tree instead.
  function spin(e: ThreeEvent<PointerEvent>) {
    let x = e.nativeEvent.clientX;
    const move = (ev: PointerEvent) => {
      root.current!.rotation.y += (ev.clientX - x) * 0.012;
      x = ev.clientX;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }

  function foliageClick(e: ThreeEvent<MouseEvent>) {
    if (e.delta > 6) return;
    e.stopPropagation();
    if (!editing) return onPick();
    onTap(nearestFree(root.current!.worldToLocal(e.point.clone()), used, undefined, anchors));
  }

  return (
    <group ref={root} position={position} scale={scale}>
      {/* Stone ring base with soil, for the drawn tree only: the model brings its own roots and shadow */}
      {!PIECES.tree.glb && (
        <>
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return <B key={i} m={i % 2 ? M.stone : M.stoneDark} p={[Math.sin(a) * 1.95, 0.2, Math.cos(a) * 1.95]} s={[0.85, 0.4, 0.45]} r={[0, a, 0]} />;
          })}
          <mesh geometry={G.cyl} material={M.brown} position-y={0.18} scale={[1.85, 0.36, 1.85]} receiveShadow />
        </>
      )}

      <Pick onPick={editing ? undefined : onPick}>
        <group ref={foliage} onClick={editing ? foliageClick : undefined} onPointerDown={editing ? spin : undefined}>
          {PIECES.tree.glb ? (
            <group>
              <Model url={PIECES.tree.glb} height={TREE_TOP} />
            </group>
          ) : (
            <>
              <B g="cyl" m={M.trunk} p={[0, 0.6, 0]} s={[0.24, 0.9, 0.24]} />
              {tierGeos.map((g, i) => (
                <mesh key={i} geometry={g} material={i % 2 ? M.leaf : M.grass} position-y={TIERS[i].y + TIERS[i].h / 2} castShadow receiveShadow />
              ))}
              <LeafTips />
            </>
          )}
        </group>
      </Pick>

      {surface && has(days, FEATURES.garland) && <Garland pts={surface.garland} />}
      {surface && lightsUnlocked && <Lights pts={surface.lights[bulbCount]} color={state?.color ?? "champagne"} on={lightsOn} />}

      {state?.items.map((it) => (
        <Ornament
          key={it.a}
          kind={it.k}
          at={anchors[it.a]}
          selected={editing && it.a === selected}
          onDown={
            editing
              ? (e) => {
                  e.stopPropagation();
                  const c = controls as unknown as { enabled: boolean } | null;
                  if (c) c.enabled = false; // the view must not pan while an ornament is being dragged
                  onOrnamentDown(it.a, e.nativeEvent);
                }
              : undefined
          }
        />
      ))}
      {preview && <Ornament kind={preview.kind} at={anchors[preview.anchor]} ghost />}

      {showTopper && (
        <group ref={topper} position-y={TREE_TOP + 0.3}>
          <mesh geometry={star8} scale={0.32}>
            <meshBasicMaterial color="#ffe08a" toneMapped={false} />
          </mesh>
          <Glow size={2.2} opacity={0.9} />
        </group>
      )}
      {sparkles && (has(days, FEATURES.celebration) || christmas) && (
        <Sparkles count={40} scale={[4, 4.5, 4]} position={[0, 2.4, 0]} size={3} speed={0.3} color="#ffe6a8" />
      )}
    </group>
  );
}
