import Link from "next/link";

export function BrandMark({
  size = "compact",
  href = "/",
}: {
  size?: "lockup" | "compact";
  href?: string;
}) {
  const titleClass = size === "lockup" ? "text-3xl md:text-5xl" : "text-lg";
  return (
    <Link href={href} className="block min-h-[44px]">
      <p className={`pt-lockup seal ${titleClass}`} style={{ color: "var(--color-eik-gold)" }}>
        Pixel Times
      </p>
      <p className="eik-src mt-1" style={{ color: "var(--color-eik-gold-dim)" }}>
        픽셀 타임즈 · 전략 삼국지 동무
      </p>
    </Link>
  );
}
