// Copies the voice-detection model and runtime into public/vad/ so they are served from our own domain (no CDN).
// Runs on postinstall and prebuild; public/vad/ is git-ignored.
import { copyFileSync, mkdirSync } from "node:fs";

const out = "public/vad";
mkdirSync(out, { recursive: true });
for (const f of ["silero_vad_v5.onnx", "vad.worklet.bundle.min.js"]) copyFileSync(`node_modules/@ricky0123/vad-web/dist/${f}`, `${out}/${f}`);
for (const f of ["ort-wasm-simd-threaded.wasm", "ort-wasm-simd-threaded.mjs"]) copyFileSync(`node_modules/onnxruntime-web/dist/${f}`, `${out}/${f}`);
