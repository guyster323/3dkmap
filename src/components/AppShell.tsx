"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MatureProvider } from "@/components/MatureContext";

const NAV = [
  { href: "/", label: "시작", match: (p: string) => p === "/" || p.startsWith("/scan") },
  { href: "/world", label: "세계", match: (p: string) => p.startsWith("/world") },
  { href: "/me", label: "내 위치", match: (p: string) => p.startsWith("/me") },
  { href: "/volumes", label: "목차", match: (p: string) => p.startsWith("/volumes") || p.startsWith("/episodes") || p.startsWith("/characters") || p.startsWith("/places") },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <MatureProvider>
      <div className="mx-auto flex min-h-dvh w-full max-w-[1400px]">
        <aside className="sticky top-0 hidden h-dvh w-52 shrink-0 flex-col border-r border-paper/10 px-4 py-6 md:flex">
          <Link href="/" className="seal mb-8 text-lg text-paper">
            천하동시
          </Link>
          <p className="mb-8 text-[11px] leading-relaxed text-ash">
            전략 삼국지 동무
            <br />
            같은 시각, 다른 땅
          </p>
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => {
              const on = n.match(path);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`rounded-lg px-3 py-2.5 text-sm tracking-wide ${
                    on ? "bg-cinnabar/15 text-paper" : "text-ash hover:bg-ink-3 hover:text-paper"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <p className="mt-auto text-[10px] leading-relaxed text-ash/70">
            요코야마 작화는 쓰지 않습니다.
            <br />
            본문은 연의·정사·삼국사기.
          </p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">{children}</div>

        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-paper/10 bg-ink/95 backdrop-blur md:hidden">
          {NAV.map((n) => {
            const on = n.match(path);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex flex-col items-center py-3 text-[11px] ${on ? "text-cinnabar" : "text-ash"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </MatureProvider>
  );
}
