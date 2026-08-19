"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getAllEpisodes, getVolumes } from "@/lib/content";
import { matchScan, type ScanHit } from "@/lib/match";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamErr, setStreamErr] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [hits, setHits] = useState<ScanHit[]>([]);
  const [ocrNote, setOcrNote] = useState("카메라를 켠 뒤, 제목이 보이면 아래 칸에 읽은 글자를 적어도 됩니다.");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setStreamErr("카메라를 쓸 수 없습니다. 권한을 허용하거나, 권·제목을 직접 입력하세요.");
      }
    };
    start();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const runMatch = (text: string) => {
    setManual(text);
    setHits(matchScan(text, getVolumes(), getAllEpisodes()));
  };

  const captureAndOcr = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      setOcrNote("카메라 화면이 아직 준비되지 않았습니다.");
      return;
    }
    setBusy(true);
    setOcrNote("화면의 글자를 읽고 있습니다…");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      ctx.drawImage(video, 0, 0);
      const Tesseract = (await import("tesseract.js")).default;
      const result = await Tesseract.recognize(canvas, "kor+eng", {
        logger: () => {},
      });
      const text = result.data.text.replace(/\s+/g, " ").trim();
      setOcrNote(text ? `읽은 글자: ${text.slice(0, 80)}` : "글자를 거의 읽지 못했습니다. 직접 입력해 보세요.");
      if (text) runMatch(text);
    } catch {
      setOcrNote("기기 안 OCR을 불러오지 못했습니다. 제목을 직접 입력하세요. 페이지 이미지는 어디에도 보내지 않습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="px-4 py-6 md:px-8">
      <p className="text-[11px] tracking-widest text-cinnabar">SCAN</p>
      <h1 className="seal mt-1 text-3xl">책을 비추세요</h1>
      <p className="mt-2 max-w-xl text-sm text-ash">
        표지, 권 숫자, 회차 제목이면 충분합니다. 만화 칸은 저장·업로드하지 않고, 기기 안에서 글자만 읽습니다.
      </p>

      <div className="mt-5 overflow-hidden rounded-2xl border border-paper/10 bg-black">
        <video ref={videoRef} playsInline muted className="aspect-[4/3] w-full object-cover md:aspect-[16/8]" />
      </div>
      {streamErr && <p className="mt-2 text-sm text-cinnabar">{streamErr}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={captureAndOcr}
          className="rounded-full bg-cinnabar px-4 py-2 text-sm disabled:opacity-50"
        >
          {busy ? "읽는 중…" : "이 화면의 제목 읽기"}
        </button>
        <Link href="/volumes" className="rounded-full border border-paper/20 px-4 py-2 text-sm">
          목차로 고르기
        </Link>
      </div>
      <p className="mt-2 text-xs text-ash">{ocrNote}</p>

      <label className="mt-6 block text-sm">
        또는 권수·제목 직접 입력
        <input
          value={manual}
          onChange={(e) => runMatch(e.target.value)}
          placeholder="예: 도원결의, 5권, 호로관"
          className="mt-1 w-full rounded-xl border border-paper/15 bg-ink-2 px-3 py-2 text-paper outline-none focus:border-gold/50"
        />
      </label>

      <ul className="mt-4 space-y-2">
        {hits.map((h) => (
          <li key={`${h.kind}-${h.volume}-${h.episodeId ?? ""}`}>
            <Link
              href={h.episodeId ? `/episodes/${h.episodeId}` : `/volumes/${h.volume}`}
              className="block rounded-xl border border-paper/10 bg-ink-2 px-4 py-3 hover:border-gold/40"
            >
              <span className="text-[10px] text-gold">
                {h.kind === "episode" ? "에피소드" : "권"} · {Math.round(h.confidence * 100)}%
              </span>
              <p className="font-serif text-lg">
                {h.volume}권 · {h.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
