"use client";

import { useId, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import Link from "next/link";
import { EikWindow } from "./Window";

export type CommandItem = {
  id: string;
  label: string;
  href?: string;
  onPick?: () => void;
  disabled?: boolean;
};

export type CommandWindowProps = {
  items: CommandItem[];
  onPick?: (id: string) => void;
  onCancel?: () => void;
  title?: string;
  className?: string;
};

function firstEnabledId(items: CommandItem[]): string {
  return items.find((item) => !item.disabled)?.id ?? items[0]?.id ?? "";
}

/** 세로 메뉴. ↑↓ 이동, Enter 선택, Esc 취소. 선택 항목 앞에 영걸전식 커서. */
export function CommandWindow({ items, onPick, onCancel, title, className = "" }: CommandWindowProps) {
  const uid = useId();
  const menuId = `${uid}-menu`;
  const [activeId, setActiveId] = useState(() => firstEnabledId(items));
  const [focused, setFocused] = useState(false);
  const resolvedActiveId = items.some((item) => item.id === activeId && !item.disabled)
    ? activeId
    : firstEnabledId(items);

  function itemDomId(id: string) {
    return `${uid}-item-${id}`;
  }

  function move(delta: number) {
    const enabled = items.filter((item) => !item.disabled);
    if (enabled.length === 0) return;
    const idx = enabled.findIndex((item) => item.id === resolvedActiveId);
    const from = idx < 0 ? 0 : idx;
    const next = enabled[(from + delta + enabled.length) % enabled.length];
    setActiveId(next.id);
  }

  function pick(item: CommandItem) {
    if (item.disabled) return;
    item.onPick?.();
    onPick?.(item.id);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const item = items.find((entry) => entry.id === resolvedActiveId);
      if (!item || item.disabled) return;
      if (item.href) {
        const node = document.getElementById(itemDomId(item.id));
        if (node instanceof HTMLAnchorElement) {
          node.click();
          return;
        }
      }
      pick(item);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel?.();
    }
  }

  function onItemClick(item: CommandItem, event: MouseEvent<HTMLElement>) {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    setActiveId(item.id);
    pick(item);
  }

  const itemClass = (item: CommandItem) =>
    [
      "flex min-h-[44px] w-full items-center gap-2 rounded-none border-0 bg-transparent px-1 text-left break-keep",
      item.disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
    ].join(" ");

  const itemStyle = (item: CommandItem, isActive: boolean): CSSProperties => ({
    color: item.disabled ? "var(--color-eik-text-dim)" : "var(--color-eik-text)",
    background: isActive && !item.disabled ? "rgba(216,183,74,0.14)" : "transparent",
  });

  return (
    <EikWindow title={title} active={focused} className={className}>
      <div
        id={menuId}
        role="menu"
        tabIndex={0}
        aria-label={title ?? "명령"}
        aria-activedescendant={resolvedActiveId ? itemDomId(resolvedActiveId) : undefined}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-eik-gold)]"
      >
        {items.map((item) => {
          const isActive = item.id === resolvedActiveId;
          const inner = (
            <>
              <span
                aria-hidden
                className={isActive && !item.disabled ? "cursor-blink" : "invisible"}
                style={{ width: 16, flexShrink: 0, color: "var(--color-eik-gold)" }}
              >
                ▶
              </span>
              <span className="min-w-0 flex-1">{item.label}</span>
            </>
          );

          if (item.href && !item.disabled) {
            return (
              <Link
                key={item.id}
                id={itemDomId(item.id)}
                href={item.href}
                role="menuitem"
                tabIndex={-1}
                className={itemClass(item)}
                style={itemStyle(item, isActive)}
                onMouseEnter={() => setActiveId(item.id)}
                onClick={(event) => onItemClick(item, event)}
              >
                {inner}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              id={itemDomId(item.id)}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={item.disabled}
              aria-disabled={item.disabled || undefined}
              className={itemClass(item)}
              style={itemStyle(item, isActive)}
              onMouseEnter={() => {
                if (!item.disabled) setActiveId(item.id);
              }}
              onClick={(event) => onItemClick(item, event)}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </EikWindow>
  );
}
