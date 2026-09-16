"use client";

import { useState, type ReactNode } from "react";
import { TREE_IDS, TREE_LABEL, type TreeId } from "@/data/pixel-times";

const TREE_SHORT: Record<TreeId, string> = {
  book: "책",
  region: "지역",
  event: "사건",
  people: "인물",
};

export type TreeDockProps = {
  openId?: TreeId | null;
  onOpen?: (id: TreeId | null) => void;
  children: Record<TreeId, ReactNode>;
  collapsed?: boolean;
};

export function TreeDock({ openId, onOpen, children, collapsed = false }: TreeDockProps) {
  const [internal, setInternal] = useState<TreeId | null>("book");
  const open = openId !== undefined ? openId : internal;
  const setOpen = (id: TreeId | null) => {
    if (onOpen) onOpen(id);
    else setInternal(id);
  };

  return (
    <div
      role="navigation"
      aria-label="Pixel Times 나무 메뉴"
      className="relative max-w-[calc(100vw-0.5rem)]"
      onKeyDown={(e) => {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        const i = TREE_IDS.indexOf((open ?? "book") as TreeId);
        const next =
          e.key === "ArrowDown"
            ? TREE_IDS[(i + 1) % TREE_IDS.length]
            : TREE_IDS[(i - 1 + TREE_IDS.length) % TREE_IDS.length];
        setOpen(next);
      }}
    >
      <div
        className="eik-win flex w-[min(220px,calc(100vw-0.75rem))] flex-col overflow-hidden md:w-[220px]"
        style={{ width: collapsed ? 48 : undefined }}
      >
        <div className="flex flex-row md:flex-col">
          {TREE_IDS.map((id) => {
            const expanded = !collapsed && open === id;
            return (
              <button
                key={id}
                type="button"
                className="flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center px-2 text-left eik-src md:flex-none md:justify-start md:px-3"
                style={{
                  color: expanded ? "var(--color-eik-gold)" : "var(--color-eik-text)",
                  background: expanded ? "rgba(216,183,74,0.08)" : "transparent",
                }}
                aria-expanded={expanded}
                aria-controls={`pt-tree-${id}`}
                aria-label={TREE_LABEL[id]}
                onClick={() => setOpen(expanded ? null : id)}
              >
                <span className="md:hidden">{TREE_SHORT[id]}</span>
                <span className="hidden md:inline">{TREE_LABEL[id]}</span>
              </button>
            );
          })}
        </div>
        {!collapsed && open ? (
          <div
            id={`pt-tree-${open}`}
            className="scroll-thin max-h-[min(40vh,calc(100dvh-8rem))] overflow-y-auto border-t px-2 pb-2"
            style={{ borderColor: "var(--color-eik-gold-dim)" }}
          >
            {children[open]}
          </div>
        ) : null}
      </div>
    </div>
  );
}
