"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { loadPrefs, savePrefs } from "@/lib/prefs";

type Ctx = { mature: boolean; setMature: (v: boolean) => void };

const MatureCtx = createContext<Ctx>({ mature: false, setMature: () => {} });

const PREFS_EVENT = "3kdmap-prefs-changed";

export function subscribePrefs(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(PREFS_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PREFS_EVENT, onChange);
  };
}

export function notifyPrefs() {
  window.dispatchEvent(new Event(PREFS_EVENT));
}

export function MatureProvider({ children }: { children: React.ReactNode }) {
  const mature = useSyncExternalStore(
    subscribePrefs,
    () => loadPrefs().mature,
    () => false,
  );

  const setMature = (v: boolean) => {
    savePrefs({ mature: v });
    notifyPrefs();
  };

  return <MatureCtx.Provider value={{ mature, setMature }}>{children}</MatureCtx.Provider>;
}

export function useMature() {
  return useContext(MatureCtx);
}

export function MatureToggle({ className = "" }: { className?: string }) {
  const { mature, setMature } = useMature();
  return (
    <div
      role="group"
      aria-label="수위"
      className={`eik-win eik-win--flat inline-flex overflow-hidden ${className}`}
    >
      <button
        type="button"
        aria-pressed={!mature}
        onClick={() => setMature(false)}
        className="min-h-[44px] min-w-[44px] px-3 py-1.5 font-serif text-[11px]"
        style={
          !mature
            ? { background: "var(--color-eik-gold)", color: "var(--color-eik-text-ink)" }
            : { color: "var(--color-eik-gold)" }
        }
      >
        가족용 요약
      </button>
      <button
        type="button"
        aria-pressed={mature}
        onClick={() => setMature(true)}
        className="min-h-[44px] min-w-[44px] px-3 py-1.5 font-serif text-[11px]"
        style={
          mature
            ? { background: "var(--color-eik-gold)", color: "var(--color-eik-text-ink)" }
            : { color: "var(--color-eik-gold)" }
        }
      >
        본편 수위
      </button>
    </div>
  );
}

export function MatureHint() {
  const { mature, setMature } = useMature();
  if (mature) return null;
  return (
    <p className="eik-src mt-3" style={{ color: "var(--color-eik-text-dim)" }}>
      정사와 연의가 갈리는 부분, 잔혹한 기록은{" "}
      <button type="button" onClick={() => setMature(true)} className="underline" style={{ color: "var(--color-eik-gold)" }}>
        「본편 수위」를 여세요
      </button>
      .
    </p>
  );
}

export function DirectRecord({ text }: { text: string }) {
  return (
    <p
      className="eik-body mt-2 px-2 py-1.5"
      style={{
        border: "1px solid color-mix(in srgb, var(--color-eik-cinnabar) 40%, transparent)",
        background: "color-mix(in srgb, var(--color-eik-cinnabar) 8%, transparent)",
      }}
    >
      <span className="mr-1" style={{ color: "var(--color-eik-cinnabar)" }}>
        [정사 직필]
      </span>
      {text}
    </p>
  );
}
