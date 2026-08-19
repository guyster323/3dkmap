import type { SourceRef } from "@/lib/types";

export function SourceChips({ sources }: { sources: SourceRef[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {sources.map((s) => (
        <li
          key={`${s.kind}-${s.ref}`}
          className="rounded-sm border border-gold/30 bg-gold/10 px-1.5 py-0.5 text-[10px] text-gold"
        >
          {s.kind}
          <span className="ml-1 text-ash">{s.ref}</span>
        </li>
      ))}
    </ul>
  );
}
