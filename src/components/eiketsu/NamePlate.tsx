import type { ReactNode } from "react";

export type NamePlateProps = {
  children: ReactNode;
  className?: string;
};

/** 창 좌상단에 걸리는 명패. 금테 위에 얹히는 작은 라벨. */
export function NamePlate({ children, className = "" }: NamePlateProps) {
  return <div className={["eik-nameplate", className].filter(Boolean).join(" ")}>{children}</div>;
}
