"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MatureProvider } from "@/components/MatureContext";

const NAV = [
  { href: "/", label: "시작", match: (p: string) => p === "/" || p.startsWith("/scan") },
  { href: "/world", label: "세계", match: (p: string) => p.startsWith("/world") },
  { href: "/me", label: "내 위치", match: (p: string) => p.startsWith("/me") },
  {
    href: "/volumes",
    label: "목차",
    match: (p: string) =>
      p.startsWith("/volumes") || p.startsWith("/episodes") || p.startsWith("/characters") || p.startsWith("/places"),
  },
] as const;

function NavGlyph({ href, active }: { href: string; active: boolean }) {
  const stroke = active ? "var(--color-eik-gold)" : "var(--color-eik-text-dim)";
  if (href === "/") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="3" y="2" width="10" height="12" fill="none" stroke={stroke} strokeWidth="1.4" />
        <path d="M5 5h6M5 8h6M5 11h4" stroke={stroke} strokeWidth="1.2" />
      </svg>
    );
  }
  if (href === "/world") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="2" y="3" width="12" height="10" fill="none" stroke={stroke} strokeWidth="1.4" />
        <path d="M2 8h12M8 3v10" stroke={stroke} strokeWidth="1.1" />
      </svg>
    );
  }
  if (href === "/me") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="7" r="2.2" fill="none" stroke={stroke} strokeWidth="1.4" />
        <path d="M8 9.2 5 13h6L8 9.2Z" fill="none" stroke={stroke} strokeWidth="1.3" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 4h10M3 8h10M3 12h7" stroke={stroke} strokeWidth="1.4" />
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const worldHome = path === "/world";

  return (
    <MatureProvider>
      <div
        className={
          worldHome
            ? "flex h-dvh w-full overflow-hidden"
            : "mx-auto flex min-h-dvh w-full max-w-[1400px] overflow-x-hidden"
        }
      >
        {!worldHome ? (
        <aside className="eik-win sticky top-0 m-2 hidden h-[calc(100dvh-1rem)] w-52 shrink-0 flex-col overflow-hidden md:flex">
          <Link
            href="/"
            className="seal block border-b px-4 py-4 text-lg"
            style={{ borderColor: "var(--color-eik-gold-dim)", color: "var(--color-eik-gold)" }}
          >
            Pixel Times
          </Link>
          <p className="eik-src px-4 pt-3 leading-relaxed" style={{ color: "var(--color-eik-text-dim)" }}>
            전략 삼국지 동무
            <br />
            영걸전 문법
          </p>
          <nav className="mt-4 flex flex-col gap-1 px-3">
            {NAV.map((n) => {
              const on = n.match(path);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className="flex min-h-[44px] items-center px-3 py-2 font-serif text-sm"
                  style={{
                    color: on ? "var(--color-eik-text-ink)" : "var(--color-eik-text)",
                    background: on ? "var(--color-eik-gold)" : "transparent",
                  }}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <p
            className="eik-src mt-auto border-t px-4 py-3 leading-relaxed"
            style={{ borderColor: "var(--color-eik-gold-dim)", color: "var(--color-eik-text-dim)" }}
          >
            원본 타일 미사용.
            <br />
            본문은 연의·정사·삼국사기.
          </p>
        </aside>
        ) : null}

        <div
          className={
            worldHome
              ? "flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
              : "flex min-w-0 flex-1 flex-col overflow-x-hidden pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-2 md:pr-2 md:pt-2"
          }
        >
          {children}
        </div>

        {!worldHome ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 md:hidden"
          style={{
            background: "var(--color-eik-win-mid)",
            borderTop: "2px solid var(--color-eik-gold)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {NAV.map((n) => {
            const on = n.match(path);
            return (
              <Link
                key={n.href}
                href={n.href}
                className="relative flex min-h-14 flex-col items-center justify-center gap-0.5 pt-2 font-serif text-[11px]"
                style={{ color: on ? "var(--color-eik-gold)" : "var(--color-eik-text-dim)" }}
              >
                {on && (
                  <span
                    className="absolute inset-x-3 top-0 h-0.5"
                    style={{ background: "var(--color-eik-gold)" }}
                  />
                )}
                <NavGlyph href={n.href} active={on} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        ) : null}
      </div>
    </MatureProvider>
  );
}
