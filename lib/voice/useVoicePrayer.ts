"use client";

// On-device voice check for Pray now. Silero VAD (via @ricky0123/vad-web) scores 32 ms frames in this browser;
// audio is never recorded, kept or sent. The mic is on only between Start and pause/finish/close.
import { useCallback, useEffect, useRef, useState } from "react";
import type { MicVAD } from "@ricky0123/vad-web";
import { SpeechCounter } from "./accumulator";

const POS = 0.5; // stricter than the library's 0.3 to ignore fans; tune in the field test
const NEG = 0.35;
const TICK_MS = 150; // publish to React ~7 times a second, not per frame
const SPEAKING_MS = 350; // "speaking" stays on this long after the last speech frame, so it does not flicker
const NUDGE_MS = 6000;

export type VoiceStatus = "idle" | "loading" | "listening" | "paused" | "done" | "timeout" | "error";
export type VoiceError = "denied" | "nomic" | "busy" | "insecure" | "old" | "download" | "unknown";

export function toVoiceError(e: unknown): VoiceError {
  const name = (e as { name?: string })?.name;
  if (name === "NotAllowedError" || name === "PermissionDeniedError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "nomic";
  if (name === "NotReadableError" || name === "AbortError") return "busy";
  if (name === "SecurityError") return "insecure";
  if (/fetch|onnx|wasm|load|import/i.test(String((e as Error)?.message ?? e))) return "download";
  return "unknown";
}

type Shown = { confirmedMs: number; optimisticMs: number; speaking: boolean; nudge: boolean };

export function useVoicePrayer({ requiredMs, onVerified }: { requiredMs: number; onVerified: (speechSeconds: number) => void }) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState<VoiceError | null>(null);
  const [autoPaused, setAutoPaused] = useState(false);
  const [shown, setShown] = useState<Shown>({ confirmedMs: 0, optimisticMs: 0, speaking: false, nudge: false });

  const op = useRef(0); // bumped by every start/stop/finish: async work started earlier sees it is stale
  const vad = useRef<MicVAD | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const streams = useRef<MediaStream[]>([]);
  const counter = useRef(new SpeechCounter(POS));
  const lastSpeech = useRef(0);
  const listened = useRef(0);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusRef = useRef<VoiceStatus>("idle");
  const verified = useRef(onVerified);
  useEffect(() => {
    verified.current = onVerified;
  }, [onVerified]);

  const set = useCallback((s: VoiceStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const stopTracks = () => {
    for (const s of streams.current) s.getTracks().forEach((t) => t.stop());
    streams.current = [];
  };

  /** Mic off, model released, audio context closed. Safe to call any time, any number of times. */
  const teardown = useCallback(() => {
    if (ticker.current) clearInterval(ticker.current);
    ticker.current = null;
    const v = vad.current;
    vad.current = null;
    v?.destroy().catch(() => {}); // throws if start() never finished; the lines below still release everything
    stopTracks();
    const c = ctx.current;
    ctx.current = null;
    if (c && c.state !== "closed") c.close().catch(() => {});
  }, []);

  const publish = useCallback(() => {
    const c = counter.current;
    const now = performance.now();
    setShown({
      confirmedMs: c.confirmedMs,
      optimisticMs: c.optimisticMs,
      speaking: now - lastSpeech.current < SPEAKING_MS,
      nudge: lastSpeech.current > 0 && now - lastSpeech.current > NUDGE_MS,
    });
  }, []);

  const check = useCallback(() => {
    const c = counter.current;
    if (c.frozen || c.confirmedMs < requiredMs) return;
    c.frozen = true; // late callbacks cannot change the result
    op.current++;
    teardown();
    publish();
    set("done");
    verified.current(Math.round(c.confirmedMs / 1000));
  }, [requiredMs, teardown, publish, set]);

  const startTicker = useCallback(() => {
    if (ticker.current) clearInterval(ticker.current);
    let last = performance.now();
    ticker.current = setInterval(() => {
      const now = performance.now();
      if (statusRef.current === "listening") listened.current += now - last; // paused time does not count
      last = now;
      publish();
      if (listened.current > requiredMs * 3 + 30000) {
        op.current++;
        counter.current.cut();
        teardown();
        set("timeout");
      }
    }, TICK_MS);
  }, [publish, requiredMs, teardown, set]);

  const pause = useCallback(
    (auto = false) => {
      if (statusRef.current !== "listening") return;
      vad.current?.pause().catch(() => {}); // stops the tracks; a half sentence is closed as end or misfire
      counter.current.cut();
      stopTracks();
      setAutoPaused(auto);
      set("paused");
      publish();
    },
    [publish, set],
  );

  /** Must run straight from the tap: iOS only allows audio started inside a user gesture. */
  const start = useCallback(() => {
    if (statusRef.current === "loading" || statusRef.current === "listening") return;
    const id = ++op.current;
    teardown();
    setError(null);
    setAutoPaused(false);
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError(window.isSecureContext ? "old" : "insecure");
      return set("error");
    }
    if (!AC || typeof WebAssembly !== "object") {
      setError("old");
      return set("error");
    }
    const audio = new AC(); // before any await
    void audio.resume();
    ctx.current = audio;
    counter.current = new SpeechCounter(POS);
    listened.current = 0;
    lastSpeech.current = 0;
    publish();
    set("loading");
    (async () => {
      try {
        const { MicVAD } = await import("@ricky0123/vad-web");
        const c = () => counter.current;
        const v = await MicVAD.new({
          model: "v5",
          startOnLoad: false,
          audioContext: audio,
          baseAssetPath: "/vad/",
          onnxWASMBasePath: "/vad/",
          positiveSpeechThreshold: POS,
          negativeSpeechThreshold: NEG,
          redemptionMs: 800,
          minSpeechMs: 250,
          preSpeechPadMs: 0,
          submitUserSpeechOnPause: true,
          ortConfig: (ort) => {
            ort.env.logLevel = "error";
            ort.env.wasm.numThreads = 1; // no SharedArrayBuffer headers needed, less heat on cheap phones
          },
          getStream: async () => {
            const s = await navigator.mediaDevices.getUserMedia({
              audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            });
            streams.current.push(s); // our own handle, so the mic is always switched off
            return s;
          },
          pauseStream: async (s) => s.getTracks().forEach((t) => t.stop()),
          resumeStream: async () => {
            const s = await navigator.mediaDevices.getUserMedia({
              audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            });
            streams.current.push(s);
            return s;
          },
          onFrameProcessed: (p) => {
            c().frame(p.isSpeech);
            if (p.isSpeech >= POS) lastSpeech.current = performance.now();
            check();
          },
          onSpeechRealStart: () => {
            c().realStart();
            check();
          },
          onSpeechEnd: () => {
            c().end(); // the audio argument is ignored on purpose
            check();
          },
          onVADMisfire: () => c().misfire(),
        });
        if (id !== op.current) return void v.destroy().catch(() => {});
        vad.current = v;
        await v.start();
        if (id !== op.current) return stopTracks(); // closed while the mic was opening
        // iOS can suspend the context (a call, the lock screen): treat it as a pause.
        audio.onstatechange = () => {
          if (audio.state !== "running") pause(true);
        };
        set("listening");
        startTicker();
      } catch (e) {
        if (id !== op.current) return;
        teardown();
        setError(toVoiceError(e));
        set("error");
      }
    })();
  }, [check, pause, publish, set, startTicker, teardown]);

  const resume = useCallback(() => {
    if (statusRef.current !== "paused" || !vad.current || !ctx.current) return start();
    const id = op.current;
    void ctx.current.resume();
    setAutoPaused(false);
    set("loading");
    vad.current.start().then(
      () => {
        if (id !== op.current) return stopTracks();
        set("listening");
      },
      (e) => {
        if (id !== op.current) return;
        teardown();
        setError(toVoiceError(e));
        set("error");
      },
    );
  }, [set, start, teardown]);

  /** Close the window: everything off, nothing saved. */
  const stop = useCallback(() => {
    op.current++;
    counter.current.cut();
    teardown();
    if (statusRef.current !== "done") set("idle");
  }, [set, teardown]);

  useEffect(() => {
    const hide = () => document.visibilityState === "hidden" && pause(true); // never auto-resume; the child taps Resume
    const gone = () => {
      op.current++;
      teardown();
    };
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", gone);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pagehide", gone);
      gone(); // unmount always releases the mic, even mid-load
    };
  }, [pause, teardown]);

  return { status, error, autoPaused, ...shown, requiredMs, start, pause: () => pause(false), resume, stop };
}
