// Shrinks a static .glb for the web: fewer triangles, unused vertices dropped, textures optionally resized.
//   node scripts/simplify-glb.mjs "../xmas-sources/santa2.glb" public/models/santa.glb 110000
// Land tiles made by image-to-3D also need their painted sky cut away and a height map for placing items:
//   (sources live in ../xmas-sources, outside the project, so they are not deployed)
// shortcut: static meshes only (no skins or animation), and it relies on meshoptimizer and sharp being installed through
// @react-three/drei and next; switch to @gltf-transform/cli if a rigged model needs shrinking.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { MeshoptSimplifier } from "meshoptimizer";
import sharp from "sharp";

const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}`))?.split("=")[1] ?? (args.includes(`--${name}`) ? true : undefined);
const [src, out, target = "30000"] = args.filter((a) => !a.startsWith("--"));
if (!src || !out) throw new Error("usage: simplify-glb.mjs <in.glb> <out.glb> [triangles] [--tex=1024] [--sky] [--permissive] [--height=out.json]");
const texSize = Number(flag("tex")) || 0;
const cutSky = !!flag("sky");
// Collapse across texture seams too. Smears texture islands, so only for plain-coloured models (a gold star).
const permissive = !!flag("permissive");
const heightOut = flag("height");
const uvWeight = Number(flag("uv")) || 0;

const file = readFileSync(src);
const jsonLen = file.readUInt32LE(12);
const gltf = JSON.parse(file.subarray(20, 20 + jsonLen).toString("utf8"));
const bin = file.subarray(20 + jsonLen + 8);
if (gltf.skins || gltf.animations) throw new Error("rigged or animated model: not supported");

const ARRAY = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const SIZE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
const GET = { 5120: "getInt8", 5121: "getUint8", 5122: "getInt16", 5123: "getUint16", 5125: "getUint32", 5126: "getFloat32" };

/** Accessor -> tightly packed typed array (handles byteStride). */
function read(index) {
  const a = gltf.accessors[index];
  const view = gltf.bufferViews[a.bufferView];
  const T = ARRAY[a.componentType];
  const n = SIZE[a.type];
  const stride = view.byteStride ?? n * T.BYTES_PER_ELEMENT;
  const res = new T(a.count * n);
  const dv = new DataView(bin.buffer, bin.byteOffset + (view.byteOffset ?? 0) + (a.byteOffset ?? 0));
  for (let i = 0; i < a.count; i++)
    for (let c = 0; c < n; c++) res[i * n + c] = dv[GET[a.componentType]](i * stride + c * T.BYTES_PER_ELEMENT, true);
  return res;
}
const imageBytes = (img) => {
  const v = gltf.bufferViews[img.bufferView];
  return bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength);
};

/** Drops triangles of painted sky: sky-blue texels, and the upright backdrop panel facing the viewer at the back edge. */
async function withoutSky(prim, positions, indices) {
  const tex = gltf.materials[prim.material]?.pbrMetallicRoughness?.baseColorTexture;
  if (!tex || prim.attributes.TEXCOORD_0 === undefined) throw new Error("--sky needs a base colour texture");
  const { data, info } = await sharp(imageBytes(gltf.images[gltf.textures[tex.index].source])).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const uv = read(prim.attributes.TEXCOORD_0);
  let zMin = Infinity;
  for (let i = 2; i < positions.length; i += 3) zMin = Math.min(zMin, positions[i]);
  const keep = [];
  for (let t = 0; t < indices.length; t += 3) {
    const [a, b, c] = [indices[t], indices[t + 1], indices[t + 2]];
    const u = (uv[a * 2] + uv[b * 2] + uv[c * 2]) / 3;
    const v = (uv[a * 2 + 1] + uv[b * 2 + 1] + uv[c * 2 + 1]) / 3;
    const px = Math.min(info.width - 1, Math.max(0, Math.floor((u - Math.floor(u)) * info.width)));
    const py = Math.min(info.height - 1, Math.max(0, Math.floor((v - Math.floor(v)) * info.height)));
    const k = (py * info.width + px) * 3;
    const [r, g, bl] = [data[k], data[k + 1], data[k + 2]];
    const skyBlue = bl > 90 && bl > r + 30 && bl > g + 8;

    const e1 = [0, 1, 2].map((i) => positions[b * 3 + i] - positions[a * 3 + i]);
    const e2 = [0, 1, 2].map((i) => positions[c * 3 + i] - positions[a * 3 + i]);
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const len = Math.hypot(...n) || 1;
    const cz = (positions[a * 3 + 2] + positions[b * 3 + 2] + positions[c * 3 + 2]) / 3;
    const backdrop = n[2] / len > 0.6 && cz < zMin + 0.08;

    if (!skyBlue && !backdrop) keep.push(a, b, c);
  }
  return Uint32Array.from(keep);
}

/** Highest upward-facing surface over a grid, in the model's own units, for standing things on the ground. */
function heightMap(positions, indices, res = 96) {
  let [x0, x1, z0, z1] = [Infinity, -Infinity, Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    x0 = Math.min(x0, positions[i]);
    x1 = Math.max(x1, positions[i]);
    z0 = Math.min(z0, positions[i + 2]);
    z1 = Math.max(z1, positions[i + 2]);
  }
  const nx = Math.round(res * Math.min(1, (x1 - x0) / (z1 - z0)));
  const nz = res;
  const h = new Float64Array(nx * nz).fill(-Infinity);
  const cell = (x, z) => [((x - x0) / (x1 - x0)) * (nx - 1), ((z - z0) / (z1 - z0)) * (nz - 1)];
  for (let t = 0; t < indices.length; t += 3) {
    const p = [0, 1, 2].map((j) => [positions[indices[t + j] * 3], positions[indices[t + j] * 3 + 1], positions[indices[t + j] * 3 + 2]]);
    const [[ax, ay, az], [bx, by, bz], [cx, cy, cz]] = p;
    const ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
    if (ny <= 0) continue; // only surfaces facing up
    const g = p.map(([x, , z]) => cell(x, z));
    const [gx0, gx1] = [Math.ceil(Math.min(...g.map((q) => q[0]))), Math.floor(Math.max(...g.map((q) => q[0])))];
    const [gz0, gz1] = [Math.ceil(Math.min(...g.map((q) => q[1]))), Math.floor(Math.max(...g.map((q) => q[1])))];
    const det = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
    if (Math.abs(det) < 1e-12) continue;
    for (let i = gx0; i <= gx1; i++)
      for (let k = gz0; k <= gz1; k++) {
        const x = x0 + (i / (nx - 1)) * (x1 - x0);
        const z = z0 + (k / (nz - 1)) * (z1 - z0);
        const l1 = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / det;
        const l2 = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / det;
        const l3 = 1 - l1 - l2;
        if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
        h[k * nx + i] = Math.max(h[k * nx + i], l1 * ay + l2 * by + l3 * cy);
      }
  }
  // Fill cells nothing covered (holes where sky was cut) from the nearest filled cell in the same column.
  for (let i = 0; i < nx; i++) {
    let last = -Infinity;
    for (let k = nz - 1; k >= 0; k--) {
      if (h[k * nx + i] === -Infinity) h[k * nx + i] = last;
      else last = h[k * nx + i];
    }
  }
  for (let k = 0; k < nz; k++) {
    let last = 0;
    for (let i = 0; i < nx; i++) if (h[k * nx + i] === -Infinity) h[k * nx + i] = last;
    else last = h[k * nx + i];
  }
  return { x0, x1, z0, z1, nx, nz, h: Array.from(h, (y) => Math.round(y * 1000) / 1000) };
}

// New binary: images first, then the simplified geometry.
const chunks = [];
let length = 0;
const views = [];
function addView(bytes, target) {
  const pad = (4 - (length % 4)) % 4;
  chunks.push(Buffer.alloc(pad));
  length += pad;
  views.push({ buffer: 0, byteOffset: length, byteLength: bytes.byteLength, ...(target ? { target } : {}) });
  chunks.push(Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength));
  length += bytes.byteLength;
  return views.length - 1;
}

await MeshoptSimplifier.ready;
const accessors = [];
const totalBefore = gltf.meshes.flatMap((m) => m.primitives).reduce((s, p) => s + (p.indices !== undefined ? gltf.accessors[p.indices].count : gltf.accessors[p.attributes.POSITION].count), 0);
let totalAfter = 0;
const heights = [];

// Geometry is read before images are rewritten, because --sky samples the original texture.
const geometry = [];
for (const mesh of gltf.meshes)
  for (const prim of mesh.primitives) {
    const positions = read(prim.attributes.POSITION);
    const vertexCount = positions.length / 3;
    let indices = prim.indices !== undefined ? Uint32Array.from(read(prim.indices)) : Uint32Array.from({ length: vertexCount }, (_, i) => i);
    if (cutSky) indices = await withoutSky(prim, positions, indices);
    const attributes = Object.fromEntries(Object.entries(prim.attributes).map(([name, index]) => [name, name === "POSITION" ? positions : read(index)]));
    geometry.push({ prim, positions, vertexCount, indices, attributes });
  }

for (const img of gltf.images ?? []) {
  if (img.bufferView === undefined) continue;
  let bytes = imageBytes(img);
  if (texSize) {
    const png = img.mimeType === "image/png";
    const resized = sharp(bytes).resize(texSize, texSize, { fit: "inside", withoutEnlargement: true });
    bytes = await (png ? resized.png({ compressionLevel: 9, palette: true }) : resized.jpeg({ quality: 82, mozjpeg: true })).toBuffer();
  }
  img.bufferView = addView(bytes);
}

for (const { prim, positions, vertexCount, indices, attributes } of geometry) {
  // Each primitive gets its share of the triangle budget.
  const goal = Math.max(300, Math.floor((indices.length / totalBefore) * Number(target) * 3));
  // Prune drops tiny loose pieces that otherwise block the budget. Too much allowed error prunes a scene of
  // many small parts down to nothing, so raise it step by step and stop at the first result near the budget.
  // shortcut: generated models split vertices along texture seams, which stalls simplification above the budget
  // (land tiles stop near 215k triangles). Collapsing across seams (the Permissive flag) smears texture islands into
  // coloured streaks, so it is not used; compress geometry (EXT_meshopt_compression) if the files must get smaller.
  let simplified = indices;
  for (const error of [0.01, 0.03, 0.1, 0.3, 1]) {
    const flags = permissive ? ["Prune", "Permissive"] : ["Prune"];
    // --uv=W counts texture stretching as error, so seams only collapse where the texture lines up (image-to-3D villages).
    const [next] = uvWeight && attributes.TEXCOORD_0
      ? MeshoptSimplifier.simplifyWithAttributes(indices, positions, 3, attributes.TEXCOORD_0, 2, [uvWeight, uvWeight], null, goal - (goal % 3), error, flags)
      : MeshoptSimplifier.simplify(indices, positions, 3, goal - (goal % 3), error, flags);
    if (next.length === 0) break;
    simplified = next;
    if (next.length <= goal * 1.5) break;
  }
  if (heightOut) heights.push(heightMap(positions, simplified));
  const [remap, unique] = MeshoptSimplifier.compactMesh(simplified); // simplified is rewritten to the new vertex numbers
  totalAfter += simplified.length;

  for (const [name, data] of Object.entries(attributes)) {
    const a = gltf.accessors[prim.attributes[name]];
    const n = SIZE[a.type];
    const packed = new data.constructor(unique * n);
    for (let v = 0; v < vertexCount; v++) {
      const to = remap[v];
      if (to === 0xffffffff) continue;
      for (let c = 0; c < n; c++) packed[to * n + c] = data[v * n + c];
    }
    const acc = { bufferView: addView(packed, 34962), componentType: a.componentType, count: unique, type: a.type, ...(a.normalized ? { normalized: true } : {}) };
    if (name === "POSITION") {
      acc.min = [Infinity, Infinity, Infinity];
      acc.max = [-Infinity, -Infinity, -Infinity];
      for (let i = 0; i < packed.length; i++) {
        acc.min[i % 3] = Math.min(acc.min[i % 3], packed[i]);
        acc.max[i % 3] = Math.max(acc.max[i % 3], packed[i]);
      }
    }
    prim.attributes[name] = accessors.push(acc) - 1;
  }
  const small = unique <= 65535;
  prim.indices = accessors.push({ bufferView: addView(small ? Uint16Array.from(simplified) : simplified, 34963), componentType: small ? 5123 : 5125, count: simplified.length, type: "SCALAR" }) - 1;
  delete prim.targets;
}

gltf.accessors = accessors;
gltf.bufferViews = views;
const body = Buffer.concat([...chunks, Buffer.alloc((4 - (length % 4)) % 4)]);
gltf.buffers = [{ byteLength: body.length }];
let json = Buffer.from(JSON.stringify(gltf), "utf8");
json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 0x20)]);

const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + json.length + 8 + body.length, 8);
const chunk = (len, type) => {
  const b = Buffer.alloc(8);
  b.writeUInt32LE(len, 0);
  b.writeUInt32LE(type, 4);
  return b;
};
mkdirSync(dirname(out), { recursive: true });
const glb = Buffer.concat([header, chunk(json.length, 0x4e4f534a), json, chunk(body.length, 0x004e4942), body]);
writeFileSync(out, glb);
if (heightOut) {
  if (heights.length !== 1) throw new Error("--height expects a model with one mesh");
  writeFileSync(heightOut, JSON.stringify(heights[0]));
}
console.log(`${src}: ${totalBefore / 3} -> ${totalAfter / 3} triangles, ${(file.length / 1e6).toFixed(1)} -> ${(glb.length / 1e6).toFixed(1)} MB`);
