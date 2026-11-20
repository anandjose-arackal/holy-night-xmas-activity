"use client";

// The child's placed pieces standing on the painting. Drag to move (only over walkable ground);
// tap to switch a piece to turning, then a sideways drag spins it; tap again to go back to moving.
// Pieces with a GLB show it; the rest show a procedural stand-in until their model is made.

import { Html, Sparkles, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import type { MapControls as MapControlsImpl } from "three-stdlib";
import {
  PIECES,
  walkable,
  type PaintingKey,
  type PieceKey,
  type Placement,
  type Spot,
} from "@/lib/village/layout";
import { useT } from "@/lib/i18n";
import * as P from "./parts";

/** Bounds in the model's own space, ignoring wherever it is mounted now (a hot reload leaves it mounted and scaled). */
function ownBox(o: THREE.Object3D) {
  const parent = o.parent;
  parent?.remove(o);
  o.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(o);
  parent?.add(o);
  return box;
}

// Radial fade drawn in the shader: no texture to load or upload.
const shadowMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    color: { value: new THREE.Color("#1a0f05") },
    opacity: { value: 0.85 },
  },
  vertexShader:
    "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
  fragmentShader:
    "uniform vec3 color; uniform float opacity; varying vec2 vUv; void main() { float d = length(vUv - 0.5) * 2.0; gl_FragColor = vec4(color, opacity * (1.0 - smoothstep(0.15, 1.0, d))); }",
});

/** Soft contact shadow on the ground under a piece, so it sits on the painting instead of floating. */
function GroundShadow({ w }: { w: number }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.01, 0]}
      scale={[w, w, 1]}
      renderOrder={-1}
      material={shadowMaterial}
    >
      <planeGeometry />
    </mesh>
  );
}

/** One GLB, scaled to `height` units with its feet at 0. Used once, so no clone (keeps Santa's rig intact). */
export function Model({
  url,
  height,
  part,
}: {
  url: string;
  height: number;
  part?: number;
}) {
  const { scene: whole, animations } = useGLTF(url);
  const scene = useMemo(() => {
    if (part === undefined) return whole;
    ownBox(whole); // also refreshes the world matrices below
    const meshes: THREE.Mesh[] = [];
    whole.traverse(
      (o) => (o as THREE.Mesh).isMesh && meshes.push(o as THREE.Mesh),
    );
    const m = meshes[part];
    return new THREE.Mesh(
      m.geometry.clone().applyMatrix4(m.matrixWorld),
      m.material,
    );
  }, [whole, part]);
  const { actions } = useAnimations(animations, scene);
  useEffect(() => {
    Object.values(actions)[0]?.play();
  }, [actions]);
  const fit = useMemo(() => {
    const box = ownBox(scene);
    const size = ownBox(whole).getSize(new THREE.Vector3());
    const s = height / (size.y || 1);
    const c = box.getCenter(new THREE.Vector3());
    const foot = box.getSize(new THREE.Vector3()).multiplyScalar(s);
    return {
      s,
      offset: [-c.x * s, -box.min.y * s, -c.z * s] as P.V3,
      w: Math.max(foot.x, foot.z) * 1.5,
    };
  }, [scene, whole, height]);
  return (
    <>
      <GroundShadow w={fit.w} />
      <group position={fit.offset} scale={fit.s}>
        <primitive object={scene} />
      </group>
    </>
  );
}

/** A procedural stand-in, measured once and scaled to `height` with its feet at 0, like a GLB. */
function Fit({ height, children }: { height: number; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const o = g.current!;
    o.scale.setScalar(1);
    o.position.set(0, 0, 0);
    const box = ownBox(o);
    const size = box.getSize(new THREE.Vector3());
    const s = height / (size.y || 1);
    const c = box.getCenter(new THREE.Vector3());
    o.scale.setScalar(s);
    o.position.set(-c.x * s, -box.min.y * s, -c.z * s);
    setW(Math.max(size.x, size.z) * s * 1.5);
  }, [height]);
  return (
    <>
      {w > 0 && <GroundShadow w={w} />}
      <group ref={g}>{children}</group>
    </>
  );
}

const O: P.V3 = [0, 0, 0];
const king = (robe: keyof typeof P.M) => (
  <P.Person p={O} robe={P.M[robe]} cloth={P.M.gold} height={1.7} />
);
const STAND_INS: Partial<Record<PieceKey, ReactNode>> = {
  olive: <P.OliveTree p={O} />,
  lilies: <P.Lilies p={O} />,
  hay: <P.B g="box" m={P.M.hay} p={[0, 0.3, 0]} s={[1, 0.6, 0.6]} />,
  manger: <P.Manger p={O} />,
  donkey: <P.Donkey p={O} />,
  ox: <P.Ox p={O} />,
  shepherd1: (
    <P.Person p={O} robe={P.M.tan} cloth={P.M.cream} height={1.6} staff />
  ),
  shepherd2: (
    <P.Person p={O} robe={P.M.brown} cloth={P.M.cream} height={1.4} staff />
  ),
  camel: <P.Donkey p={O} />,
  melchior: king("burgundy"),
  caspar: king("maryBlue"),
  balthazar: king("leafDark"),
  gold: <P.Gift p={O} />,
  frankincense: <P.Gift p={O} />,
  myrrh: <P.Gift p={O} />,
  baby: <P.BabyJesus p={O} />,
  mary: <P.Person p={O} robe={P.M.maryBlue} cloth={P.M.white} kneel />,
  joseph: (
    <P.Person p={O} robe={P.M.brown} cloth={P.M.cream} height={1.7} staff />
  ),
};

type Place = (
  k: PaintingKey,
  spot: Spot,
  size?: number,
) => { position: P.V3; scale: number };

/** Turns its children toward `turn` smoothly, so a tap on the turn buttons reads as a turn, not a jump. */
function Turn({ turn, children }: { turn: number; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const o = g.current;
    if (!o) return;
    o.rotation.y = P.motion.on
      ? THREE.MathUtils.damp(o.rotation.y, turn, 12, dt)
      : turn;
  });
  return <group ref={g}>{children}</group>;
}

/** Marks a piece that just arrived (a new treasure): a pulsing gold ring, a soft beam, sparkles and a "New!" badge, for a few seconds. */
function Spotlight({ size, label }: { size: number; label: string }) {
  const ring = useRef<THREE.Mesh>(null);
  const beam = useRef<THREE.MeshBasicMaterial>(null);
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setOn(false), 9000);
    return () => clearTimeout(t);
  }, []);
  useFrame(({ clock }) => {
    const k = P.motion.on ? Math.sin(clock.elapsedTime * 4) : 0;
    ring.current?.scale.set(1 + k * 0.12, 1 + k * 0.12, 1);
    if (beam.current) beam.current.opacity = 0.22 + k * 0.08;
  });
  return (
    <>
      {on && (
        <>
          <mesh
            ref={ring}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.03, 0]}
          >
            <ringGeometry args={[size * 0.5, size * 0.68, 48]} />
            <meshBasicMaterial
              color="#ffd23f"
              transparent
              opacity={0.9}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, size * 1.4, 0]}>
            <cylinderGeometry
              args={[size * 0.45, size * 0.6, size * 2.8, 24, 1, true]}
            />
            <meshBasicMaterial
              ref={beam}
              color="#fff0b0"
              transparent
              opacity={0.22}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
          {P.motion.on && (
            <Sparkles
              count={28}
              scale={[size * 1.4, size * 2, size * 1.4]}
              position={[0, size, 0]}
              size={5}
              speed={0.5}
              color="#ffe6a8"
            />
          )}
        </>
      )}
      {/* Html is never unmounted mid-render (React warns about that race); its contents just go. */}
      <Html
        position={[0, size * 1.3, 0]}
        center
        zIndexRange={[20, 0]}
        style={{ pointerEvents: "none" }}
      >
        {on && (
          <span className="rounded-full border-[3px] border-[#f5c542] bg-gradient-to-b from-[#d8333a] to-crimson-dark px-3 py-1 font-display text-sm font-black whitespace-nowrap text-white shadow-lg animate-bounce motion-reduce:animate-none">
            ✨ {label}
          </span>
        )}
      </Html>
    </>
  );
}

/** The arrange-mode wiggle, like icons on a phone home screen, so the child sees the pieces can move now. */
function Wiggle({
  on,
  phase,
  children,
}: {
  on: boolean;
  phase: number;
  children: ReactNode;
}) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current)
      g.current.rotation.z =
        on && P.motion.on
          ? Math.sin(clock.elapsedTime * 16 + phase) * 0.015
          : 0;
  });
  return <group ref={g}>{children}</group>;
}

/**
 * An invisible touch area around a piece in arrange mode, never smaller than about 64 px on screen,
 * so a lamb or a gift far back is as easy to grab as a king.
 */
function HitPad({
  pieceKey,
  height,
  scale,
}: {
  pieceKey: PieceKey;
  height: number;
  scale: number;
}) {
  const m = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    const min = 32 / (camera as THREE.OrthographicCamera).zoom / scale; // 32 px radius in this piece's own units
    m.current?.scale.set(
      Math.max(height * 0.45, min),
      Math.max(height * 0.55, min),
      1,
    );
  });
  return (
    <mesh ref={m} position={[0, height * 0.5, 0]} userData={{ pieceKey }}>
      <circleGeometry args={[1, 24]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

const STEP = Math.PI / 4; // one tap of a turn button
const toolBtn =
  "flex size-12 items-center justify-center rounded-full border-[3px] border-[#f5c542] bg-gradient-to-b from-[#fffaf0] to-[#f3dfae] text-2xl font-black text-crimson-dark shadow-[0_3px_0_#c99a3b] active:translate-y-0.5";

type Props = {
  k: PaintingKey;
  H: number;
  W: number;
  place: Place;
  /** The pieces to show, already filtered to unlocked and placed. */
  pieces: PieceKey[];
  layout: Placement; // for this painting
  fresh: PieceKey | null;
  arranging: boolean;
  /** A piece was moved or turned: [u, v, turn]. */
  onMove: (key: PieceKey, at: [number, number, number]) => void;
};

export function VillageScene({
  k,
  H,
  W,
  place,
  pieces,
  layout,
  fresh,
  arranging,
  onMove,
}: Props) {
  const { camera, gl } = useThree();
  const controls = useThree((s) => s.controls) as MapControlsImpl | null;
  const [drag, setDrag] = useState<{
    key: PieceKey;
    spot: Spot;
    turn: number;
  } | null>(null);
  const [picked, setPicked] = useState<PieceKey | null>(null);
  const sel = arranging ? picked : null; // leaving arrange mode puts the piece down
  const setSel = setPicked;
  const { t, lang } = useT();
  const at = (key: PieceKey): [number, number, number] => {
    if (drag?.key === key) return [...drag.spot, drag.turn];
    return layout[key] ?? [...PIECES[key].spot[k], 0];
  };

  const down = (hit: PieceKey) => (e: ThreeEvent<PointerEvent>) => {
    if (!arranging) return; // outside arrange mode a drag on a piece pans the view like anywhere else
    e.stopPropagation();
    // Of all the pieces under the finger, take the one whose centre is nearest for its size, not simply the
    // front one, so a small piece standing behind a big one (Baby Jesus behind Mary) can still be picked up.
    const c = new THREE.Vector3();
    const sc = new THREE.Vector3();
    let key = hit;
    let best = Infinity;
    for (const i of e.intersections) {
      const k = i.object.userData.pieceKey as PieceKey | undefined;
      if (!k) continue;
      i.object.getWorldPosition(c);
      i.object.getWorldScale(sc);
      const d = Math.hypot((i.point.x - c.x) / sc.x, (i.point.y - c.y) / sc.y);
      if (d < best) [best, key] = [d, k];
    }
    if (controls) controls.enabled = false;
    const x0 = e.nativeEvent.clientX;
    const y0 = e.nativeEvent.clientY;
    const [u0, v0, r0] = at(key);
    let cur = { key, spot: [u0, v0] as Spot, turn: r0 };
    let moved = false;
    const rect = gl.domElement.getBoundingClientRect();
    const v = new THREE.Vector3();
    const under = (cx: number, cy: number): Spot => {
      v.set(
        ((cx - rect.left) / rect.width) * 2 - 1,
        -((cy - rect.top) / rect.height) * 2 + 1,
        0,
      ).unproject(camera);
      return [v.x / W + 0.5, 0.5 - v.y / H];
    };
    // Keep the grab point: the piece moves with the finger instead of jumping under it.
    const p0 = under(x0, y0);
    const off = [u0 - p0[0], v0 - p0[1]];
    const move = (ev: PointerEvent) => {
      if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) return;
      moved = true;
      setSel(key);
      {
        const p = under(ev.clientX, ev.clientY);
        const spot: Spot = [
          Math.min(Math.max(p[0] + off[0], 0), 1),
          Math.min(Math.max(p[1] + off[1], 0), 1),
        ];
        let to = spot;
        // Off the ground: stop at the edge, unless the piece itself started off it (then it follows the finger until it is back).
        if (!walkable(k, to) && walkable(k, cur.spot)) {
          const last = cur.spot;
          let [lo, hi] = [0, 1];
          for (let i = 0; i < 12; i++) {
            const m = (lo + hi) / 2;
            if (
              walkable(k, [
                last[0] + (spot[0] - last[0]) * m,
                last[1] + (spot[1] - last[1]) * m,
              ])
            )
              lo = m;
            else hi = m;
          }
          to = [
            last[0] + (spot[0] - last[0]) * lo,
            last[1] + (spot[1] - last[1]) * lo,
          ];
        }
        cur = { ...cur, spot: to };
      }
      setDrag(cur);
    };
    const up = () => {
      if (!moved) setSel(key);
      else onMove(key, [...cur.spot, cur.turn]);
      setDrag(null);
      if (controls) controls.enabled = true;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <>
      {pieces.map((key) => {
        const piece = PIECES[key];
        if (!piece.glb && !STAND_INS[key]) return null; // no model yet (water jar, oil lantern): not shown until one is added
        const [u, w, turn] = at(key);
        const { position, scale } = place(k, [u, w]);
        return (
          <group
            key={key}
            position={position}
            scale={scale}
            onPointerDown={down(key)}
            onPointerMissed={sel === key ? () => setSel(null) : undefined}
            onPointerOver={() =>
              arranging && (document.body.style.cursor = "grab")
            }
            onPointerOut={() => (document.body.style.cursor = "")}
          >
            <group rotation={[0.22, 0, 0]}>
              {arranging && (
                <HitPad pieceKey={key} height={piece.height} scale={scale} />
              )}
              {fresh === key && (
                <Spotlight size={piece.height} label={t.newBadge} />
              )}
              <P.Appear pop={fresh === key}>
                <Wiggle
                  on={arranging && drag?.key !== key}
                  phase={pieces.indexOf(key) * 1.7}
                >
                  <Turn turn={turn}>
                    {piece.glb ? (
                      // Its own loading boundary: a new treasure loading must not hide (and tear down) the whole scene.
                      <Suspense fallback={null}>
                        <Model url={piece.glb} height={piece.height} part={piece.part} />
                      </Suspense>
                    ) : (
                      <Fit height={piece.height}>{STAND_INS[key]}</Fit>
                    )}
                  </Turn>
                </Wiggle>
              </P.Appear>
              {(sel === key || drag?.key === key) && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                  <ringGeometry
                    args={[piece.height * 0.45, piece.height * 0.52, 48]}
                  />
                  <meshBasicMaterial color="#ffd23f" toneMapped={false} />
                </mesh>
              )}
            </group>
          </group>
        );
      })}
      {/* Turn bar for the selected piece, fixed under the top bar (over the sky), so it never covers pieces on the ground.
          One Html for the scene, never unmounted mid-render (React warns about that race); only its contents change. */}
      <Html>
        {sel &&
          !drag &&
          (() => {
            const [su, sw, sturn] = at(sel);
            return createPortal(
              <div
                className="fixed inset-x-0 top-[calc(3.75rem+env(safe-area-inset-top))] z-40 flex justify-center px-4 select-none"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="flex w-full max-w-md items-center gap-2 rounded-[1.75rem] border-[3px] border-[#f5c542] bg-gradient-to-b from-[#d8333a] to-crimson-dark p-2 shadow-xl">
                  <button
                    type="button"
                    aria-label={t.turnLeft}
                    className={toolBtn}
                    onClick={() => onMove(sel, [su, sw, (sturn + STEP) % (2 * Math.PI)])}
                  >
                    ⟲
                  </button>
                  <p className="min-w-0 flex-1 text-center leading-tight text-white">
                    <span className="block truncate font-display text-lg font-black">
                      {PIECES[sel].name[lang]}
                    </span>
                    <span className="block truncate text-xs text-[#ffe7a3]">
                      {t.dragHint}
                    </span>
                  </p>
                  <button
                    type="button"
                    aria-label={t.turnRight}
                    className={toolBtn}
                    onClick={() => onMove(sel, [su, sw, (sturn - STEP) % (2 * Math.PI)])}
                  >
                    ⟳
                  </button>
                  <button
                    type="button"
                    aria-label={t.close}
                    className={toolBtn}
                    onClick={() => setSel(null)}
                  >
                    ✓
                  </button>
                </div>
              </div>,
              document.body,
            );
          })()}
      </Html>
    </>
  );
}
