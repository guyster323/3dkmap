"use client";

import { useState, type ReactNode } from "react";
import { TREE_IDS, TREE_LABEL, type TreeId } from "@/data/pixel-times";

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
    <div className="eik-win flex min-w-0 flex-col overflow-hidden" style={{ width: collapsed ? 48 : "var(--pt-tree-w)" }}>
      {TREE_IDS.map((id) => {
        const expanded = !collapsed && open === id;
        return (
          <div key={id} className="min-w-0 border-b" style={{ borderColor: "var(--color-eik-gold-dim)" }}>
            <button
              type="button"
              className="flex min-h-[44px] w-full items-center px-3 text-left eik-src"
              style={{ color: expanded ? "var(--color-eik-gold)" : "var(--color-eik-text)" }}
              aria-expanded={expanded}
              aria-controls={`pt-tree-${id}`}
              onClick={() => setOpen(expanded ? null : id)}
            >
              {TREE_LABEL[id]}
            </button>
            {expanded ? (
              <div id={`pt-tree-${id}`} className="scroll-thin max-h-[40vh] overflow-y-auto px-2 pb-2">
                {children[id]}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
