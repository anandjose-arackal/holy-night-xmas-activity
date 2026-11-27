// Lossless geometry compression (EXT_meshopt_compression) for a .glb; drei's useGLTF decodes it out of the box.
//   node scripts/compress-glb.mjs public/villages/week1.glb [out.glb]
// Vertex data uses codec version 0: the decoder bundled with drei (three-stdlib) cannot read version 1.
// shortcut: expects one accessor per bufferView (what simplify-glb.mjs writes); no quantization, which would shrink more.

import { readFileSync, writeFileSync } from "node:fs";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";

const [src, out = src] = process.argv.slice(2);
if (!src) throw new Error("usage: compress-glb.mjs <in.glb> [out.glb]");
const file = readFileSync(src);
const jsonLen = file.readUInt32LE(12);
const gltf = JSON.parse(file.subarray(20, 20 + jsonLen).toString("utf8"));
const bin = file.subarray(20 + jsonLen + 8);
if (gltf.extensionsUsed?.includes("EXT_meshopt_compression")) throw new Error("already compressed");

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const SIZE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
const BYTES = { 5121: 1, 5123: 2, 5125: 4, 5126: 4 };

const chunks = [];
let length = 0;
const push = (bytes) => {
  const pad = (4 - (length % 4)) % 4;
  chunks.push(Buffer.alloc(pad), Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength));
  length += pad;
  const at = length;
  length += bytes.byteLength;
  return at;
};

let fallback = 0;
gltf.bufferViews = gltf.bufferViews.map((view, i) => {
  const bytes = new Uint8Array(bin.buffer, bin.byteOffset + (view.byteOffset ?? 0), view.byteLength);
  const acc = gltf.accessors.find((a) => a.bufferView === i);
  const stride = acc && BYTES[acc.componentType] * SIZE[acc.type];
  const isIndex = view.target === 34963;
  const isVertex = view.target === 34962 && stride % 4 === 0;
  if (!acc || (!isIndex && !isVertex)) return { ...view, byteOffset: push(bytes) }; // images stay as they are
  const size = isIndex ? BYTES[acc.componentType] : stride;
  const encoded = isIndex ? MeshoptEncoder.encodeIndexSequence(bytes, acc.count, size) : MeshoptEncoder.encodeVertexBufferLevel(bytes, acc.count, size, 2, 0);
  // Self-check: decoding must give back the original bytes.
  const back = new Uint8Array(acc.count * size);
  MeshoptDecoder.decodeGltfBuffer(back, acc.count, size, encoded, isIndex ? "INDICES" : "ATTRIBUTES", "NONE");
  if (!Buffer.from(back).equals(Buffer.from(bytes))) throw new Error(`bufferView ${i} did not round-trip`);
  const ext = { buffer: 0, byteOffset: push(encoded), byteLength: encoded.byteLength, byteStride: size, count: acc.count, mode: isIndex ? "INDICES" : "ATTRIBUTES" };
  const fb = fallback;
  fallback += Math.ceil(view.byteLength / 4) * 4;
  return { buffer: 1, byteOffset: fb, byteLength: view.byteLength, ...(view.target ? { target: view.target } : {}), ...(isVertex ? { byteStride: size } : {}), extensions: { EXT_meshopt_compression: ext } };
});

const body = Buffer.concat([...chunks, Buffer.alloc((4 - (length % 4)) % 4)]);
gltf.buffers = [{ byteLength: body.length }, { byteLength: fallback, extensions: { EXT_meshopt_compression: { fallback: true } } }];
gltf.extensionsUsed = [...(gltf.extensionsUsed ?? []), "EXT_meshopt_compression"];
gltf.extensionsRequired = [...(gltf.extensionsRequired ?? []), "EXT_meshopt_compression"];
let json = Buffer.from(JSON.stringify(gltf), "utf8");
json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 0x20)]);
const chunk = (len, type) => Buffer.from(new Uint32Array([len, type]).buffer);
const header = Buffer.from(new Uint32Array([0x46546c67, 2, 12 + 8 + json.length + 8 + body.length]).buffer);
const glb = Buffer.concat([header, chunk(json.length, 0x4e4f534a), json, chunk(body.length, 0x004e4942), body]);
writeFileSync(out, glb);
console.log(`${src}: ${(file.length / 1e6).toFixed(2)} -> ${(glb.length / 1e6).toFixed(2)} MB`);
