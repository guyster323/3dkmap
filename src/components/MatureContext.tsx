"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { loadPrefs, savePrefs } from "@/lib/prefs";

type Ctx = { mature: boolean; setMature: (v: boolean) => void };

const MatureCtx = createContext<Ctx>({ mature: false, setMature: () => {} });

export function MatureProvider({ children }: { children: React.ReactNode }) {
  const [mature, setMatureState] = useState(false);

  useEffect(() => {
    setMatureState(loadPrefs().mature);
  }, []);

  const setMature = (v: boolean) => {
    setMatureState(v);
    savePrefs({ mature: v });
  };

  return <MatureCtx.Provider value={{ mature, setMature }}>{children}</MatureCtx.Provider>;
}

export function useMature() {
  return useContext(MatureCtx);
}

export function MatureToggle({ className = "" }: { className?: string }) {
  const { mature, setMature } = useMature();
  return (
    <button
      type="button"
      onClick={() => setMature(!mature)}
      className={`rounded-full border px-3 py-1 text-[11px] tracking-wide ${
        mature
          ? "border-cinnabar/60 bg-cinnabar/15 text-paper"
          : "border-paper/15 text-ash"
      } ${className}`}
    >
      {mature ? "본편 수위 열림" : "가족용 요약"}
    </button>
  );
}
