import Link from "next/link";

export default function NotFound() {
  return (
    <main className="px-6 py-16">
      <h1 className="seal text-3xl">이 길은 아직 지도에 없습니다</h1>
      <Link href="/" className="mt-4 inline-block text-gold">
        시작으로
      </Link>
    </main>
  );
}
