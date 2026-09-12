"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getAllEpisodes, getVolumes } from "@/lib/content";
import { matchScan, type ScanHit } from "@/lib/match";

function hitBadge(h: ScanHit): string {
  if (h.confidence >= 0.72) return h.kind === "episode" ? "에피소드 일치" : "권수 일치";
  return "유사 제목";
}

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [streamErr, setStreamErr] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [hits, setHits] = useState<ScanHit[]>([]);
  const [searched, setSearched] = useState(false);
  const [ocrNote, setOcrNote] = useState("카메라를 켠 뒤, 제목이 보이면 아래 칸에 읽은 글자를 적어도 됩니다.");
  const [busy, setBusy] = useState(false);

  const startCamera = async () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreamErr(null);
    } catch {
      setStreamErr("카메라를 쓸 수 없습니다. 권한을 허용하거나, 권·제목을 직접 입력하세요.");
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      .then(async (stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      })
      .catch(() => {
        if (cancelled) return;
        setStreamErr("카메라를 쓸 수 없습니다. 권한을 허용하거나, 권·제목을 직접 입력하세요.");
        inputRef.current?.focus();
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const runMatch = (text: string) => {
    setManual(text);
    setSearched(Boolean(text.trim()));
    setHits(matchScan(text, getVolumes(), getAllEpisodes()));
  };

  const captureAndOcr = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      setOcrNote("카메라 화면이 아직 준비되지 않았습니다.");
      return;
    }
    setBusy(true);
    setOcrNote("글자 판독 중...");
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
    <main className="min-w-0 px-4 py-6 md:px-8">
      <p className="eik-src tracking-widest" style={{ color: "var(--color-eik-cinnabar)" }}>
        SCAN
      </p>
      <h1 className="seal mt-1 text-3xl">책을 비추세요</h1>
      <p className="eik-body mt-2 max-w-xl" style={{ color: "var(--color-eik-text-dim)" }}>
        표지, 권 숫자, 회차 제목이면 충분합니다. 만화 칸은 저장·업로드하지 않고, 기기 안에서 글자만 읽습니다.
      </p>

      {streamErr ? (
        <div className="eik-win mt-5 p-4">
          <p className="eik-body" style={{ color: "var(--color-eik-cinnabar)" }}>
            {streamErr}
          </p>
          <button
            type="button"
            onClick={() => {
              setStreamErr(null);
              void startCamera();
            }}
            className="eik-win eik-win--flat mt-3 min-h-[44px] px-4 py-2 text-sm"
            style={{ color: "var(--color-eik-gold)" }}
          >
            카메라 권한 다시 요청
          </button>
        </div>
      ) : (
        <div className="eik-win relative mt-5 overflow-hidden">
          <video ref={videoRef} playsInline muted className="aspect-[4/3] w-full object-cover md:aspect-[16/8]" />
          <div
            className="pointer-events-none absolute inset-[12%]"
            style={{ border: "2px solid color-mix(in srgb, var(--color-eik-gold) 70%, transparent)" }}
          >
            <span
              className="absolute -left-0.5 -top-0.5 h-4 w-4"
              style={{ borderLeft: "2px solid var(--color-eik-gold)", borderTop: "2px solid var(--color-eik-gold)" }}
            />
            <span
              className="absolute -right-0.5 -top-0.5 h-4 w-4"
              style={{ borderRight: "2px solid var(--color-eik-gold)", borderTop: "2px solid var(--color-eik-gold)" }}
            />
            <span
              className="absolute -bottom-0.5 -left-0.5 h-4 w-4"
              style={{ borderBottom: "2px solid var(--color-eik-gold)", borderLeft: "2px solid var(--color-eik-gold)" }}
            />
            <span
              className="absolute -bottom-0.5 -right-0.5 h-4 w-4"
              style={{ borderBottom: "2px solid var(--color-eik-gold)", borderRight: "2px solid var(--color-eik-gold)" }}
            />
          </div>
          {busy && (
            <div className="absolute inset-0 overflow-hidden" style={{ background: "rgba(6,10,20,0.4)" }}>
              <div className="scanline h-8 w-full bg-gradient-to-b from-transparent via-eik-gold/40 to-transparent" />
              <p className="absolute inset-x-0 bottom-3 text-center text-sm" style={{ color: "var(--color-eik-gold)" }}>
                글자 판독 중...
              </p>
            </div>
          )}
        </div>
      )}

      <p className="eik-src mt-2" style={{ color: "var(--color-eik-text-dim)" }}>
        {ocrNote}
      </p>

      <label className={`eik-body mt-6 block ${streamErr ? "eik-win p-2" : ""}`}>
        또는 권수·제목 직접 입력
        <input
          ref={inputRef}
          value={manual}
          onChange={(e) => runMatch(e.target.value)}
          placeholder="예: 도원결의, 적벽, 오장원"
          className="eik-win eik-win--flat mt-1 w-full px-3 py-2 outline-none"
          style={{ color: "var(--color-eik-text)" }}
        />
      </label>

      <ul className="mt-4 space-y-2">
        {hits.map((h) => (
          <li key={`${h.kind}-${h.volume}-${h.episodeId ?? ""}`}>
            <Link
              href={h.episodeId ? `/episodes/${h.episodeId}` : `/volumes/${h.volume}`}
              className="eik-win block px-4 py-3"
            >
              <span className="eik-src" style={{ color: "var(--color-eik-gold)" }}>
                {h.kind === "episode" ? "에피소드" : "권"} · {hitBadge(h)}
              </span>
              <p className="font-serif text-lg">
                {h.volume}권 · {h.title}
              </p>
            </Link>
          </li>
        ))}
        {searched && hits.length === 0 && (
          <li className="eik-win p-4 eik-body" style={{ color: "var(--color-eik-text-dim)" }}>
            일치하는 권이나 회차를 찾지 못했습니다. &apos;적벽&apos;, &apos;1권&apos;, &apos;도원결의&apos;처럼 검색해 보세요.
            <Link href="/volumes" className="mt-2 block min-h-[44px]" style={{ color: "var(--color-eik-gold)" }}>
              목차로 고르기
            </Link>
          </li>
        )}
      </ul>

      {!streamErr && (
        <div className="sticky bottom-4 z-20 mt-8 flex justify-center md:bottom-6">
          <button
            type="button"
            disabled={busy}
            onClick={captureAndOcr}
            className="min-h-[52px] min-w-[52px] px-8 py-3 text-base disabled:opacity-50"
            style={{ background: "var(--color-eik-cinnabar)", color: "var(--color-eik-text)" }}
          >
            {busy ? "읽는 중…" : "이 화면의 제목 읽기"}
          </button>
        </div>
      )}
    </main>
  );
}
