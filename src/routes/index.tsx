import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

const INTAKE_ENDPOINT = "";

const EMAIL = "question@weareparley.studio";
const SUBSTACK = "https://weareparley.substack.com";
const DESC =
  "Parley is a strategy and advisory practice that helps business leaders get unstuck on consequential challenges. We bring different minds together, through collaborative work, conversations and gatherings, to open new perspectives and map a path to action.";
const META_DESC =
  "Parley is a strategy and advisory practice that helps business leaders get unstuck on consequential challenges.";
const OG_IMAGE = "/images/p1.jpg";

const PHOTOS = [
  { src: "/images/p1.jpg", alt: "Black and white prints on a table with guests mingling behind" },
  { src: "/images/p2.jpg", alt: "A guest photographing objects laid out on a table" },
  { src: "/images/p3.jpg", alt: "An audience with their backs to us, watching a panel" },
  { src: "/images/p4.jpg", alt: "Guests talking around a table of objects in a loft, seen from above" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Parley" },
      { name: "description", content: META_DESC },
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
  const [open, setOpen] = useState(false);
  const lock = useRef(false);
  const openRef = useRef(false);
  openRef.current = open;

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
      if (openRef.current) return;
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

        <div className="p-bottom grid grid-cols-1 items-end gap-7 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12 lg:gap-20">
          <div className="min-w-0">
            <h1 className="p-word">Parley</h1>
            <p className="p-line mt-4 md:mt-5">{DESC}</p>
          </div>
          <div className="pointer-events-auto flex flex-col gap-5 md:w-[248px]">
            <div className="flex flex-col gap-2">
              <p className="p-mono p-note m-0">Occasional notes on getting unstuck, and invitations to our gatherings.</p>
              <a href={SUBSTACK} target="_blank" rel="noreferrer" className="p-cta p-focus w-full">Subscribe on Substack →</a>
            </div>
            <div className="flex flex-col gap-2">
              <p className="p-mono p-note m-0">Stuck on something?</p>
              <button type="button" onClick={() => setOpen(true)} className="p-cta p-cta-outline p-focus w-full">Tell us about it</button>
            </div>
          </div>
        </div>
      </div>

      {open && <IntakeModal onClose={() => setOpen(false)} />}
    </main>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function IntakeModal({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState({ name: "", email: "", company: "", challenge: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: f.name.trim().slice(0, 100),
      email: f.email.trim().slice(0, 255),
      company: f.company.trim().slice(0, 200),
      challenge: f.challenge.trim().slice(0, 4000),
    };
    if (!data.email) return setErr("Please add your email.");
    if (!EMAIL_RE.test(data.email)) return setErr("That email doesn't look right.");
    setErr("");
    setBusy(true);
    try {
      if (INTAKE_ENDPOINT) {
        const r = await fetch(INTAKE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!r.ok) throw new Error();
      } else {
        const subject = `Stuck on something: ${data.name || data.email}`;
        const body = `Name: ${data.name}\nEmail: ${data.email}\nCompany and role: ${data.company}\n\nWhat's the challenge?\n${data.challenge}`;
        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
      setDone(true);
    } catch {
      setErr("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-overlay" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="intake-title" className="p-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="p-mono p-close p-focus">Close</button>
        {done ? (
          <div className="py-6">
            <h2 id="intake-title" className="p-modal-title">Thank you.</h2>
            <p className="mt-3 opacity-80">We'll reply within a couple of days.</p>
          </div>
        ) : (
          <>
            <h2 id="intake-title" className="p-modal-title">Tell us what you're stuck on</h2>
            <p className="mt-2 mb-5 opacity-80">A few lines is plenty. A real person reads every one and replies.</p>
            <form onSubmit={submit} noValidate className="flex flex-col gap-4">
              <label className="p-field"><span>Name</span><input ref={first} value={f.name} onChange={set("name")} maxLength={100} autoComplete="name" /></label>
              <label className="p-field"><span>Email *</span><input type="email" required value={f.email} onChange={set("email")} maxLength={255} autoComplete="email" aria-invalid={!!err} /></label>
              <label className="p-field"><span>Company and role</span><input value={f.company} onChange={set("company")} maxLength={200} autoComplete="organization-title" /></label>
              <label className="p-field"><span>What's the challenge?</span><textarea rows={4} value={f.challenge} onChange={set("challenge")} maxLength={4000} /></label>
              {err && <p role="alert" className="p-mono p-accent m-0 text-sm">{err}</p>}
              <button type="submit" disabled={busy} className="p-cta p-focus self-start">{busy ? "Sending…" : "Send"}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={dir === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
