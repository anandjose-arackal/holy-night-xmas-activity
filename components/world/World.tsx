"use client";

// The village is a painting with the child's 3D pieces standing on it. Phones get the tall painting, laptops the wide one.
// The view looks straight at the painting: drag pans, pinch or wheel zooms, and it never shows past the picture's edge.

import { MapControls, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import type { MapControls as MapControlsImpl } from "three-stdlib";
import type { OrnamentKind, TreeState } from "@/lib/tree";
import { TREE_TOP } from "@/lib/tree";
import { PAINTINGS, PIECES, type PaintingKey, type PieceKey, type Spot, type VillageLayout } from "@/lib/village/layout";
import * as P from "./parts";
import { ChristmasTree } from "./Tree";
import { Model, VillageScene } from "./VillageScene";

export type View = "home" | "tree" | "stable" | "field" | "star" | PieceKey;
export type Quality = "low" | "balanced" | "high";
export type Pickable = "tree" | "stable" | "star";

/** Imperative hooks the page calls into the scene: screen-to-branch picking and picture capture. */
export type WorldApi = {
  pick: (clientX: number, clientY: number, exclude?: number) => number;
  capture: () => Promise<Blob | null>;
};

const H = 20; // painting height in world units
const width = (k: PaintingKey) => PAINTINGS[k].aspect * H;
const clamp = (v: number, lo: number, hi: number) => (lo > hi ? 0 : Math.min(Math.max(v, lo), hi));

/** A spot in the painting -> where to stand and how big to be. Nearer the bottom is closer, so bigger and in front. */
function place(k: PaintingKey, [u, v]: Spot, size = 1, sky = false) {
  const p = PAINTINGS[k];
  const scale = (sky ? 1 : Math.max(0.25, p.depth * (v - p.horizon))) * size;
  return {
    position: [(u - 0.5) * width(k), (0.5 - v) * H, v * 40 - 20] as P.V3,
    scale,
  };
}

const TREE_SIZE = 1.3;

function usePainting(): PaintingKey {
  return useThree((s) => (s.size.width < s.size.height ? "tall" : "wide"));
}

/** Where the view goes for each place: the centre of attention and how far to zoom in beyond "fill the screen". */
function goalFor(view: View, k: PaintingKey, size: { width: number; height: number }, layout: VillageLayout) {
  const cover = Math.max(size.width / width(k), size.height / H);
  const portrait = size.width < size.height;
  if (view === "tree") {
    const { position, scale } = place(k, PIECES.tree.spot[k], TREE_SIZE);
    const treeH = (TREE_TOP + 0.6) * scale;
    const visible = treeH / 0.48; // the tree fills about half the height
    const zoom = size.height / visible / cover;
    // On a phone the decorating sheet covers the lower part, so lift the tree into the clear upper part.
    return { x: position[0], y: position[1] + treeH / 2 - (portrait ? visible * 0.16 : 0), zoom: Math.max(zoom, 1) };
  }
  if (view === "home") return { x: 0, y: 0, zoom: 1 };
  const key: PieceKey = view === "stable" ? "manger" : view === "field" ? "shepherd1" : view;
  const at = layout[k][key];
  const spot: Spot = at ? [at[0], at[1]] : PIECES[key].spot[k];
  const { position } = place(k, spot);
  const zoom = view === "stable" ? 2.4 : 1.8;
  // A panel opens over the lower part of a phone screen, so aim lower to keep the place in the clear upper part.
  const lift = portrait ? (size.height / (cover * zoom)) * 0.22 : 0;
  return { x: position[0], y: position[1] + 1 - lift, zoom };
}

function Rig({ view, layout, locked, enabled, animate }: { view: View; layout: VillageLayout; locked: boolean; enabled: boolean; animate: boolean }) {
  const controls = useRef<MapControlsImpl>(null);
  const size = useThree((s) => s.size);
  const k = usePainting();
  const W = width(k);
  const cover = Math.max(size.width / W, size.height / H);
  const goal = useRef<{ x: number; y: number; zoom: number } | null>(null);
  const first = useRef(true);
  const layoutRef = useRef(layout); // read when the view changes; moving a piece must not move the camera
  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);
  useEffect(() => {
    goal.current = goalFor(view, k, size, layoutRef.current);
  }, [view, k, size]);

  useFrame(({ camera }) => {
    const c = controls.current;
    if (!c) return;
    const cam = camera as THREE.OrthographicCamera;
    const g = goal.current;
    if (g) {
      const f = animate && !first.current ? 0.12 : 1;
      first.current = false;
      cam.zoom += (cover * g.zoom - cam.zoom) * f;
      c.target.x += (g.x - c.target.x) * f;
      c.target.y += (g.y - c.target.y) * f;
      const arrived = Math.abs(cam.zoom - cover * g.zoom) < cam.zoom * 0.005 && Math.hypot(g.x - c.target.x, g.y - c.target.y) < 0.02;
      if (arrived && !locked) goal.current = null; // hand the view back to the child's fingers
    }
    cam.zoom = Math.min(Math.max(cam.zoom, cover), cover * 4);
    const hw = size.width / 2 / cam.zoom;
    const hh = size.height / 2 / cam.zoom;
    c.target.set(clamp(c.target.x, -W / 2 + hw, W / 2 - hw), clamp(c.target.y, -H / 2 + hh, H / 2 - hh), 0);
    cam.position.set(c.target.x, c.target.y, 100);
    cam.updateProjectionMatrix();
  });

  return (
    <MapControls
      ref={controls}
      makeDefault
      enabled={enabled && !locked}
      enableRotate={false}
      screenSpacePanning
      zoomToCursor
      onStart={() => {
        if (!locked) goal.current = null;
      }}
    />
  );
}

function Capture({ onApi }: { onApi: Props["onApi"] }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    onApi({
      capture: () =>
        new Promise((resolve) => {
          gl.render(scene, camera); // draw now so the buffer is not empty
          gl.domElement.toBlob(resolve, "image/png");
        }),
    });
  }, [onApi, gl, scene, camera]);
  return null;
}

function Painting({ k }: { k: PaintingKey }) {
  const tex = useTexture(PAINTINGS[k].url, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });
  return (
    <mesh position={[0, 0, -30]} scale={[width(k), H, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

function BethlehemStar({ glow }: { glow: number }) {
  const g = useRef<THREE.Group>(null);
  const geo = useMemo(() => P.starGeometry(8, 1, 0.3, 0.3), []);
  useFrame(({ clock }) => {
    if (P.motion.on && g.current) g.current.scale.setScalar(glow * (1 + Math.sin(clock.elapsedTime * 1.8) * 0.06));
  });
  return (
    <group ref={g} scale={glow}>
      {PIECES.star.glb ? (
        <group position={[0, -0.8, 0]}>
          <Model url={PIECES.star.glb} height={1.6} />
        </group>
      ) : (
        <mesh geometry={geo}>
          <meshBasicMaterial color="#fff2c4" toneMapped={false} />
        </mesh>
      )}
      <P.Glow size={6} opacity={0.9} />
      <mesh position={[0, -1.6, -0.2]} scale={[0.22, 3.2, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#fff0c0" transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

type Props = {
  readDays: number[];
  christmas: boolean;
  eve: boolean;
  view: View;
  mode: "world" | "tree";
  /** Arrange mode: pieces wiggle and can be moved and turned. Otherwise they stay put and a drag pans the view. */
  arranging: boolean;
  fresh: PieceKey | null;
  /** Placed and unlocked pieces to stand on the painting. */
  pieces: PieceKey[];
  layout: VillageLayout;
  showTree: boolean;
  showStar: boolean;
  quality: Quality;
  reducedMotion: boolean;
  controlsEnabled: boolean;
  tree: TreeState | null;
  selected: number;
  preview: { anchor: number; kind: OrnamentKind } | null;
  onApi: (patch: Partial<WorldApi>) => void;
  onPick: (what: Pickable) => void;
  onMove: (key: PieceKey, at: [number, number, number], painting: PaintingKey) => void;
  onMiss: () => void;
  onTreeTap: (anchor: number) => void;
  onOrnamentDown: (anchor: number, e: PointerEvent) => void;
  fallback: ReactNode;
  onReady: () => void;
};

/** Mounts only once everything in its Suspense has loaded. */
function Ready({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}

function Village(props: Props) {
  const { christmas, eve, quality, reducedMotion, onPick } = props;
  const k = usePainting();
  const tree = place(k, PIECES.tree.spot[k], TREE_SIZE);
  const star = place(k, PIECES.star.spot[k], 1, true);

  return (
    <>
      <Suspense fallback={null}>
        <Painting k={k} />
        <VillageScene
          k={k}
          H={H}
          W={width(k)}
          place={place}
          pieces={props.pieces}
          layout={props.layout[k]}
          fresh={props.fresh}
          arranging={props.arranging}
          onMove={(key, at) => props.onMove(key, at, k)}
        />
        {props.showStar && (
          <P.Pick onPick={() => onPick("star")}>
            <group position={star.position}>
              <P.Appear pop={props.fresh === "star"}>
                <BethlehemStar glow={christmas ? 1.4 : eve ? 1.1 : 0.8} />
              </P.Appear>
            </group>
          </P.Pick>
        )}
        {props.showTree && (
          <ChristmasTree
            position={tree.position}
            scale={tree.scale}
            state={props.tree}
            days={props.readDays}
            christmas={christmas}
            editing={props.mode === "tree"}
            selected={props.selected}
            preview={props.preview}
            sparkles={quality !== "low" && !reducedMotion}
            onApi={props.onApi}
            onPick={() => onPick("tree")}
            onTap={props.onTreeTap}
            onOrnamentDown={props.onOrnamentDown}
          />
        )}
        <Ready onReady={props.onReady} />
      </Suspense>
      {/* Tapping the stable no longer zooms in: it got in the way of moving pieces there. The menu still has "Stable". */}
    </>
  );
}

export default function World(props: Props) {
  const { quality, reducedMotion } = props;
  useEffect(() => {
    P.motion.on = !reducedMotion;
  }, [reducedMotion]);

  return (
    <Canvas
      orthographic
      dpr={quality === "low" ? 1 : quality === "balanced" ? [1, 1.5] : [1, 2]}
      gl={{ antialias: quality !== "low", preserveDrawingBuffer: false }}
      camera={{ position: [0, 0, 100], zoom: 20, near: 0.1, far: 300 }}
      fallback={props.fallback}
      style={{ touchAction: "none" }}
      onPointerMissed={(e) => e.type === "click" && props.onMiss()}
    >
      <color attach="background" args={["#7cc0f0"]} />
      {/* Sunny afternoon, lit from the upper left like the painting */}
      <hemisphereLight args={["#fff6e0", "#7a6040", 2.2]} />
      <directionalLight position={[-8, 12, 14]} intensity={2.4} color="#fff0d0" />
      <Village {...props} />
      <Rig view={props.view} layout={props.layout} locked={props.mode === "tree"} enabled={props.controlsEnabled} animate={!reducedMotion} />
      <Capture onApi={props.onApi} />
    </Canvas>
  );
}
