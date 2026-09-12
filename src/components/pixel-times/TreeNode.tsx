"use client";

import type { ReactNode } from "react";

export function TreeNode({
  label,
  level,
  expanded,
  selected,
  onToggle,
  onSelect,
  children,
}: {
  label: string;
  level: number;
  expanded?: boolean;
  selected?: boolean;
  onToggle?: () => void;
  onSelect?: () => void;
  children?: ReactNode;
}) {
  const hasKids = children != null;
  return (
    <div style={{ paddingLeft: Math.min(level, 4) * 12 }}>
      <div className="flex min-h-[44px] items-stretch">
        {hasKids ? (
          <button
            type="button"
            className="min-h-[44px] min-w-[44px] eik-src"
            aria-expanded={expanded}
            onClick={onToggle}
          >
            {expanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="inline-block min-w-[44px]" />
        )}
        <button
          type="button"
          className="min-h-[44px] flex-1 px-1 text-left font-serif text-sm break-keep"
          style={{
            color: selected ? "var(--color-eik-text-ink)" : "var(--color-eik-text)",
            background: selected ? "var(--color-eik-gold)" : "transparent",
          }}
          aria-pressed={selected}
          onClick={onSelect}
        >
          {label}
        </button>
      </div>
      {hasKids && expanded ? <div>{children}</div> : null}
    </div>
  );
}
