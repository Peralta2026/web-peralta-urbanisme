"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Project, Locale } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const TR      = "700ms cubic-bezier(0.22, 1, 0.36, 1)";
const COOLDOWN = 750; // ms entre canvis de carta

// ─── Helpers ──────────────────────────────────────────────────────────────────

function href(slug: string, locale: Locale) {
  return locale === "ca" ? `/projectes/${slug}` : `/${locale}/projectes/${slug}`;
}

// ─── Crossfade AB d'imatges ───────────────────────────────────────────────────

function ImageCycler({ slug, images }: { slug: string; images: string[] }) {
  const aRef   = useRef<HTMLImageElement>(null);
  const bRef   = useRef<HTMLImageElement>(null);
  const topRef = useRef<"a" | "b">("a");
  const idxRef = useRef(0);
  const [idx, setIdx] = useState(0);
  const N = images.length;

  const go = useCallback(
    (newIdx: number) => {
      const a = aRef.current;
      const b = bRef.current;
      if (!a || !b || newIdx === idxRef.current) return;

      if (topRef.current === "a") {
        b.src = `/projects/${slug}/${images[newIdx]}`;
        b.style.zIndex  = "2";
        b.style.opacity = "0";
        a.style.zIndex  = "1";
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            b.style.opacity = "1";
            a.style.opacity = "0";
          })
        );
        topRef.current = "b";
      } else {
        a.src = `/projects/${slug}/${images[newIdx]}`;
        a.style.zIndex  = "2";
        a.style.opacity = "0";
        b.style.zIndex  = "1";
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            a.style.opacity = "1";
            b.style.opacity = "0";
          })
        );
        topRef.current = "a";
      }

      idxRef.current = newIdx;
      setIdx(newIdx);
    },
    [slug, images]
  );

  const btn: React.CSSProperties = {
    position: "absolute", top: "50%", transform: "translateY(-50%)", zIndex: 10,
    width: 28, height: 28, background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(0,0,0,0.12)", cursor: "pointer",
    fontFamily: "var(--font-sans)", fontSize: 13, padding: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%", cursor: N > 1 ? "pointer" : "default" }}
      onClick={N > 1 ? () => go((idxRef.current + 1) % N) : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={aRef} src={`/projects/${slug}/${images[0]}`} alt="" draggable={false}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain",
                 display: "block", opacity: 1, zIndex: 2, transition: "opacity 0.45s ease", userSelect: "none" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={bRef} src={`/projects/${slug}/${images[0]}`} alt="" draggable={false}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain",
                 display: "block", opacity: 0, zIndex: 1, transition: "opacity 0.45s ease", userSelect: "none" }}
      />
      {N > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); go((idxRef.current - 1 + N) % N); }}
            style={{ ...btn, left: 10 }}>←</button>
          <button onClick={(e) => { e.stopPropagation(); go((idxRef.current + 1) % N); }}
            style={{ ...btn, right: 10 }}>→</button>
          <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
                        zIndex: 10, display: "flex", gap: 5 }}>
            {images.map((_, i) => (
              <span key={i} style={{ width: 4, height: 4, borderRadius: "50%",
                                     background: i === idx ? "#111" : "rgba(0,0,0,0.22)" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Contingut d'una làmina ───────────────────────────────────────────────────

function CardContent({
  project, locale, isActive,
}: {
  project: Project; locale: Locale; isActive: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const data   = project[locale];
  const sans   = "var(--font-sans)";
  const images = project.images.length > 0 ? project.images : [project.coverImage];

  // Resetejar estat quan la carta deixa de ser activa
  useEffect(() => {
    if (!isActive) setExpanded(false);
  }, [isActive]);

  const paragraphs = (data.descriptionLong || data.descriptionShort)
    .split("\n\n").map((p) => p.trim()).filter(Boolean);

  const facts = [
    data.year        && ["Any",     data.year],
    data.status      && ["Estat",   data.status],
    data.tipus       && ["Tipus",   data.tipus],
    data.municipality && ["Lloc",   data.municipality],
    data.ambitM2     && ["Àmbit",  `${data.ambitM2.toLocaleString("ca-ES")} m²`],
  ].filter(Boolean) as [string, string][];

  const ui = {
    llegirMes: locale === "en" ? "Read more" : locale === "es" ? "Leer más" : "Llegir més",
    menys:     locale === "en" ? "Less"      : locale === "es" ? "Menos"    : "Menys",
    veure:     locale === "en" ? "See project →" : locale === "es" ? "Ver proyecto →" : "Veure projecte →",
  };

  return (
    <div
      className="grid grid-rows-[52%_48%] md:grid-rows-none md:grid-cols-[56%_44%]"
      style={{ width: "100%", height: "100%", background: "#fff", overflow: "hidden" }}
    >
      {/* ── COLUMNA IMATGE: fons blanc, objectFit contain ── */}
      <div style={{ background: "#fff", padding: "24px", position: "relative", overflow: "hidden" }}>
        {isActive ? (
          <ImageCycler slug={project.slug} images={images} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/projects/${project.slug}/${images[0]}`}
            alt={data.title}
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        )}
      </div>

      {/* ── COLUMNA TEXT ── */}
      {/* border-t mòbil (separador horitzontal), border-l desktop (separador vertical) */}
      <div
        className="flex flex-col overflow-hidden border-t border-black/[.06] md:border-t-0 md:border-l md:border-l-black/[.06]"
        style={{ padding: "clamp(18px, 2.4vw, 36px)" }}
      >
        {/* Metadata */}
        <p style={{ fontFamily: sans, fontSize: 10, fontWeight: 500,
                    letterSpacing: "0.10em", textTransform: "uppercase",
                    color: "#999", margin: "0 0 11px", lineHeight: 1.4 }}>
          {[data.tipus, data.municipality, data.year].filter(Boolean).join(" · ")}
        </p>

        {/* Títol */}
        <h2 style={{ fontFamily: sans, fontSize: "clamp(19px, 2vw, 30px)", fontWeight: 800,
                     lineHeight: 1.04, letterSpacing: "-0.04em", color: "#000", margin: "0 0 14px" }}>
          {data.title}
        </h2>

        {/* Text (curt o expandit) */}
        <div style={{ flex: 1, overflowY: expanded ? "auto" : "hidden", marginBottom: 10 }}>
          {!expanded ? (
            <p style={{ fontFamily: sans, fontSize: 13.5, lineHeight: 1.60, color: "#444", margin: 0 }}>
              {data.descriptionShort}
            </p>
          ) : (
            paragraphs.map((para, i) => (
              <p key={i} style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.64,
                                  letterSpacing: "-0.005em", color: "#333", margin: "0 0 12px" }}>
                {para}
              </p>
            ))
          )}
        </div>

        {/* Dades tècniques */}
        {!expanded && facts.length > 0 && (
          <dl style={{ display: "flex", flexWrap: "wrap", gap: "4px 18px", margin: "0 0 14px",
                       borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: 10 }}>
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt style={{ fontFamily: sans, fontSize: 9, fontWeight: 600,
                              letterSpacing: "0.10em", textTransform: "uppercase",
                              color: "#c8c8c8", lineHeight: 1.2, marginBottom: 1 }}>{label}</dt>
                <dd style={{ fontFamily: sans, fontSize: 11.5, color: "#555", margin: 0, lineHeight: 1.3 }}>{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* Accions */}
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: "auto", flexShrink: 0 }}>
          <button onClick={() => setExpanded((e) => !e)}
            style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, letterSpacing: "0.02em",
                     color: "#111", background: "none", border: "none", borderBottom: "1px solid #111",
                     padding: "0 0 2px", cursor: "pointer" }}>
            {expanded ? ui.menys : ui.llegirMes}
          </button>
          <Link href={href(project.slug, locale)}
            style={{ fontFamily: sans, fontSize: 12, fontWeight: 500,
                     letterSpacing: "0.02em", color: "#bbb", textDecoration: "none" }}>
            {ui.veure}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Transforms per estat de carta ───────────────────────────────────────────

type CardState = "active" | "prev" | "next" | "hidden";

function cardTransform(state: CardState): React.CSSProperties {
  const base: React.CSSProperties = {
    position:   "absolute",
    left:       "50%",
    top:        "50%",
    width:      "min(88vw, 1320px)",
    height:     "clamp(440px, 62vh, 620px)",
    transition: `transform ${TR}, opacity ${TR}`,
    willChange: "transform, opacity",
    border:     "1px solid rgba(0,0,0,0.14)",
    background: "#fff",
    overflow:   "hidden",
  };
  switch (state) {
    case "active":
      return { ...base, opacity: 1, transform: "translate(-50%,-50%) translateY(0px) scale(1)",
               zIndex: 3, pointerEvents: "auto" };
    case "prev":
      return { ...base, opacity: 0, transform: "translate(-50%,-50%) translateY(-108px) scale(0.985)",
               zIndex: 2, pointerEvents: "none" };
    case "next":
      return { ...base, opacity: 0, transform: "translate(-50%,-50%) translateY(108px) scale(0.985)",
               zIndex: 1, pointerEvents: "none" };
    case "hidden":
      return { ...base, opacity: 0, transform: "translate(-50%,-50%) translateY(108px)",
               zIndex: 0, pointerEvents: "none", visibility: "hidden" };
  }
}

function getState(i: number, active: number): CardState {
  if (i === active)      return "active";
  if (i === active - 1) return "prev";
  if (i === active + 1) return "next";
  return "hidden";
}

// ─── Accesos conceptuals ──────────────────────────────────────────────────────

const CLINKS: Record<Locale, { label: string; href: string }[]> = {
  ca: [
    { label: "Els nostres principis",    href: "/principis" },
    { label: "La nostra gent",           href: "/persones"  },
    { label: "Invitació a col·laborar",  href: "/contacte"  },
  ],
  es: [
    { label: "Nuestros principios",      href: "/es/principis" },
    { label: "Nuestro equipo",           href: "/es/persones"  },
    { label: "Invitación a colaborar",   href: "/es/contacte"  },
  ],
  en: [
    { label: "Our principles",           href: "/en/principis" },
    { label: "Our people",               href: "/en/persones"  },
    { label: "Invitation to collaborate",href: "/en/contacte"  },
  ],
};

// ─── Component principal ───────────────────────────────────────────────────────

export default function HomeProjects({
  projects, locale,
}: {
  projects: Project[]; locale: Locale;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const lastChange = useRef(0);
  const N = projects.length;
  const sans = "var(--font-sans)";
  const mono = "var(--font-mono)";

  // Canviar carta (amb cooldown per evitar salts múltiples)
  const goTo = useCallback(
    (dir: 1 | -1) => {
      const now = Date.now();
      if (now - lastChange.current < COOLDOWN) return;
      lastChange.current = now;
      setActiveIdx((i) => Math.max(0, Math.min(N - 1, i + dir)));
    },
    [N]
  );

  // Wheel (document, passive:false per poder fer preventDefault)
  useEffect(() => {
    let accum = 0;
    let timer: ReturnType<typeof setTimeout>;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); // impedeix scroll de pàgina
      accum += e.deltaY;
      clearTimeout(timer);
      timer = setTimeout(() => { accum = 0; }, 200);

      if (accum > 50)       { goTo(1);  accum = 0; }
      else if (accum < -50) { goTo(-1); accum = 0; }
    };

    document.addEventListener("wheel", onWheel, { passive: false });
    return () => document.removeEventListener("wheel", onWheel);
  }, [goTo]);

  // Touch
  useEffect(() => {
    let startY = 0;
    const onStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const onEnd   = (e: TouchEvent) => {
      const dy = startY - e.changedTouches[0].clientY;
      if (dy > 40) goTo(1);
      else if (dy < -40) goTo(-1);
    };
    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend",   onEnd,   { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend",   onEnd);
    };
  }, [goTo]);

  // Teclat (fletxes)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goTo(1);
      else if (e.key === "ArrowUp") goTo(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  // Bloquejar scroll de pàgina mentre estem a la home
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    /*
      ESCENARI FIX: position fixed, inset 0.
      L'usuari no fa scroll de pàgina; el scroll activa canvi de carta.
      z-index 5 → per sota del nav (z-50).
    */
    <div
      style={{
        position:  "fixed",
        inset:     0,
        zIndex:    5,
        background: "#fff",
        overflow:  "hidden",
      }}
    >
      {/* ── Zona per sota del nav (top: 88px) ── */}
      <div
        style={{
          position: "absolute",
          top: "88px",   // alçada del nav fix
          left:   0,
          right:  0,
          bottom: 0,
        }}
      >
        {/* ── Pila de cartes ── */}
        {projects.map((project, i) => {
          const state = getState(i, activeIdx);
          return (
            <div key={project.slug} style={cardTransform(state)}>
              <CardContent
                project={project}
                locale={locale}
                isActive={state === "active"}
              />
            </div>
          );
        })}

        {/* ── Accesos conceptuals (esquerra superior) ── */}
        <div
          style={{
            position:  "absolute",
            top:       "18px",
            left:      "clamp(20px, 4vw, 60px)",
            zIndex:    10,
            display:   "flex",
            gap:       "clamp(16px, 2.5vw, 44px)",
            flexWrap:  "wrap",
            pointerEvents: "auto",
          }}
        >
          {CLINKS[locale].map(({ label, href: h }) => (
            <Link
              key={label}
              href={h}
              style={{
                fontFamily:     sans,
                fontSize:       "11px",
                fontWeight:     450,
                letterSpacing:  "0.04em",
                color:          "#c0c0c0",
                textDecoration: "none",
                transition:     "color 0.18s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#111"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#c0c0c0"; }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* ── Indicador inferior: dots + comptador ── */}
        <div
          style={{
            position:      "absolute",
            bottom:        "24px",
            left:          "50%",
            transform:     "translateX(-50%)",
            zIndex:        10,
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            gap:           "8px",
            pointerEvents: "none",
          }}
        >
          <div style={{ display: "flex", gap: "5px" }}>
            {projects.map((_, i) => (
              <span
                key={i}
                style={{
                  width:        "4px",
                  height:       "4px",
                  borderRadius: "50%",
                  background:   i === activeIdx ? "#111" : "rgba(0,0,0,0.18)",
                  transition:   "background 0.3s",
                }}
              />
            ))}
          </div>
          <span style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.08em", color: "#ccc" }}>
            {String(activeIdx + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
          </span>
        </div>

        {/* ── Hint scroll (primera carta) ── */}
        {activeIdx === 0 && (
          <div
            style={{
              position:      "absolute",
              bottom:        "28px",
              right:         "clamp(20px, 4vw, 60px)",
              zIndex:        10,
              pointerEvents: "none",
            }}
          >
            <span style={{ fontFamily: sans, fontSize: "10px", letterSpacing: "0.08em",
                           textTransform: "uppercase", color: "#ccc" }}>
              scroll ↓
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
