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
      className={`px-3 py-1 font-serif text-[11px] ${
        mature ? "gold-btn" : "wood-inlay text-gold"
      } ${className}`}
    >
      {mature ? "본편 수위 열림" : "가족용 요약"}
    </button>
  );
}
