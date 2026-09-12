import type { ReactNode } from "react";
import { NamePlate } from "./NamePlate";

export type EikWindowVariant = "default" | "flat";

export type EikWindowProps = {
  title?: string;
  variant?: EikWindowVariant;
  active?: boolean;
  className?: string;
  children?: ReactNode;
};

/** 4겹 창틀 기본형. 나머지 영걸전 크롬이 전부 이것을 쓴다. */
export function EikWindow({
  title,
  variant = "default",
  active = false,
  className = "",
  children,
}: EikWindowProps) {
  const classes = [
    "eik-win",
    variant === "flat" ? "eik-win--flat" : "",
    active ? "eik-win--active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes}>
      {title ? (
        <header className="relative z-[1] px-2" style={{ marginTop: -7 }}>
          <NamePlate>{title}</NamePlate>
        </header>
      ) : null}
      <div className="eik-body min-w-0 px-3 py-2">{children}</div>
    </section>
  );
}
