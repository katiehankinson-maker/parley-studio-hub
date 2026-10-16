import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import p1 from "@/assets/p1.jpg.asset.json";
import p2 from "@/assets/p2.jpg.asset.json";
import p3 from "@/assets/p3.jpg.asset.json";
import p4 from "@/assets/p4.jpg.asset.json";
import p5 from "@/assets/p5.jpg.asset.json";

const EMAIL = "ask@weareparley.studio";
const SUBSTACK = "https://weareparley.substack.com";
const DESC =
  "Parley helps leaders get unstuck on consequential business challenges, bringing different minds together to open new perspectives and map a way forward.";
const OG_IMAGE = `https://weareparley.studio${p1.url}`;

const PHOTOS = [
  { src: p1.url, alt: "Black and white prints on a table with guests mingling behind" },
  { src: p2.url, alt: "A guest photographing objects laid out on a table" },
  { src: p3.url, alt: "A panel seated beneath a screen beside a rubber plant" },
  { src: p4.url, alt: "An audience with their backs to us, watching a panel" },
  { src: p5.url, alt: "Guests talking around a table of objects in a loft, seen from above" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Parley" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Parley" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: Index,
});

function Index() {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const lock = useRef(false);

  const go = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const n = Math.max(0, Math.min(PHOTOS.length - 1, i));
    el.scrollTo({ left: n * el.clientWidth });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth));
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(d) < 4) return;
      e.preventDefault();
      if (lock.current) return;
      lock.current = true;
      const cur = Math.round(el.scrollLeft / el.clientWidth);
      go(cur + (d > 0 ? 1 : -1));
      setTimeout(() => (lock.current = false), 700);
    };
    const onKey = (e: KeyboardEvent) => {
      const cur = Math.round(el.scrollLeft / el.clientWidth);
      if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [go]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <main className="p-sans relative h-dvh w-screen overflow-hidden">
      <div ref={track} className="p-track" aria-label="Photos" role="region">
        {PHOTOS.map((p, i) => (
          <div key={p.src} className="p-slide" aria-roledescription="slide" aria-label={`${i + 1} of ${PHOTOS.length}`}>
            <img src={p.src} alt={p.alt} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
          </div>
        ))}
      </div>

      <div className="p-shade" aria-hidden="true" />

      <div className="p-pad pointer-events-none fixed inset-0 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-4">
          <div className="p-mono p-accent flex items-center gap-2 text-xs uppercase tracking-[0.18em]">
            <span className="p-dot" aria-hidden="true" />
            Coming soon
          </div>
          <div className="pointer-events-auto flex items-center gap-3">
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous photo" className="p-btn p-focus flex h-10 w-10 items-center justify-center">
              <Arrow dir="left" />
            </button>
            <span className="p-mono w-12 text-center text-sm tabular-nums" aria-live="polite">
              {index + 1} / {PHOTOS.length}
            </span>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next photo" className="p-btn p-focus flex h-10 w-10 items-center justify-center">
              <Arrow dir="right" />
            </button>
          </div>
        </div>

        <div>
          <h1 className="p-word">Parley</h1>
          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <p className="p-line m-0">{DESC}</p>
            <div className="p-mono pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-3 text-sm">
              <a href={`mailto:${EMAIL}`} className="p-focus underline underline-offset-4">{EMAIL}</a>
              <button type="button" onClick={copy} className="p-btn p-focus px-2.5 py-1 text-xs uppercase tracking-wider">
                {copied ? "Copied" : "Copy"}
              </button>
              <a href={SUBSTACK} target="_blank" rel="noreferrer" className="p-focus underline underline-offset-4">Substack ↗</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={dir === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
