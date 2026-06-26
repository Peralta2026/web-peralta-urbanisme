"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import type { Project, Locale } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function projectHref(slug: string, locale: Locale) {
  return locale === "ca" ? `/projectes/${slug}` : `/${locale}/projectes/${slug}`;
}

// ─── Crossfade d'imatges ──────────────────────────────────────────────────────
// Dos layers A/B en posició absoluta. Alternem quin té opacity:1 via DOM.

function ImageCycler({ slug, images }: { slug: string; images: string[] }) {
  const imgARef  = useRef<HTMLImageElement>(null);
  const imgBRef  = useRef<HTMLImageElement>(null);
  const topRef   = useRef<"A" | "B">("A");
  const idxRef   = useRef(0);
  const [idx, setIdx] = useState(0);
  const N = images.length;

  const go = useCallback(
    (newIdx: number) => {
      const a = imgARef.current;
      const b = imgBRef.current;
      if (!a || !b || newIdx === idxRef.current) return;

      // Carreguem la nova imatge al layer ocult i després encrenem opacitats
      if (topRef.current === "A") {
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
        topRef.current = "B";
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
        topRef.current = "A";
      }

      idxRef.current = newIdx;
      setIdx(newIdx);
    },
    [slug, images]
  );

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); go((idxRef.current - 1 + N) % N); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); go((idxRef.current + 1) % N); };

  const btn: React.CSSProperties = {
    position:       "absolute",
    top:            "50%",
    transform:      "translateY(-50%)",
    zIndex:         10,
    width:          "28px",
    height:         "28px",
    background:     "rgba(255,255,255,0.88)",
    border:         "1px solid rgba(0,0,0,0.14)",
    cursor:         "pointer",
    fontFamily:     "var(--font-sans)",
    fontSize:       "13px",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    lineHeight:     1,
    padding:        0,
  };

  return (
    <div
      style={{
        position: "relative",
        width:    "100%",
        height:   "100%",
        background: "#f5f5f5",
        overflow: "hidden",
        cursor:   N > 1 ? "pointer" : "default",
      }}
      onClick={N > 1 ? (e) => { e.stopPropagation(); go((idxRef.current + 1) % N); } : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgARef} src={`/projects/${slug}/${images[0]}`} alt=""
        draggable={false}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                 objectFit: "contain", display: "block", opacity: 1, zIndex: 2,
                 transition: "opacity 0.45s ease", userSelect: "none" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgBRef} src={`/projects/${slug}/${images[0]}`} alt=""
        draggable={false}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                 objectFit: "contain", display: "block", opacity: 0, zIndex: 1,
                 transition: "opacity 0.45s ease", userSelect: "none" }}
      />

      {N > 1 && (
        <>
          <button onClick={prev} aria-label="Imatge anterior" style={{ ...btn, left: "12px" }}>←</button>
          <button onClick={next} aria-label="Imatge següent"  style={{ ...btn, right: "12px" }}>→</button>
          <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)",
                        zIndex: 10, display: "flex", gap: "5px", alignItems: "center" }}>
            {images.map((_, i) => (
              <span key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", display: "block",
                                     background: i === idx ? "#111" : "rgba(0,0,0,0.28)" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Una làmina de projecte ────────────────────────────────────────────────────

function ProjectSlide({
  project,
  locale,
  isFirst,
}: {
  project: Project;
  locale: Locale;
  isFirst: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible,  setVisible]  = useState(isFirst);
  const [above,    setAbove]    = useState(false);
  const [expanded, setExpanded] = useState(false);

  const data   = project[locale];
  const sans   = "var(--font-sans)";
  const images = project.images.length > 0 ? project.images : [project.coverImage];

  const paragraphs = (data.descriptionLong || data.descriptionShort)
    .split("\n\n").map((p) => p.trim()).filter(Boolean);

  const facts = [
    data.year        && ["Any",      data.year],
    data.status      && ["Estat",    data.status],
    data.tipus       && ["Tipus",    data.tipus],
    data.municipality && ["Municipi", data.municipality],
    data.ambitM2     && ["Àmbit",    `${data.ambitM2.toLocaleString("ca-ES")} m²`],
  ].filter(Boolean) as [string, string][];

  const ui = {
    llegirMes: locale === "en" ? "Read more" : locale === "es" ? "Leer más" : "Llegir més",
    menys:     locale === "en" ? "Less"      : locale === "es" ? "Menos"    : "Menys",
    veure:     locale === "en" ? "See project →" : locale === "es" ? "Ver proyecto →" : "Veure projecte →",
  };

  // IntersectionObserver per controlar l'animació de scroll
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          setAbove(false);
        } else {
          setAbove(entry.boundingClientRect.top < 0);
          setVisible(false);
        }
      },
      { threshold: 0.18 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        minHeight:      "100vh",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        paddingTop:     "100px",  // nav fix (88px) + marge
        paddingBottom:  "28px",
        paddingLeft:    "16px",
        paddingRight:   "16px",
        boxSizing:      "border-box",
      }}
    >
      {/*
        La làmina: horitzontal en desktop, vertical en mòbil.
        md:h-[clamp(460px,64vh,620px)] fixa l'alçada en desktop.
      */}
      <article
        className="flex flex-col md:flex-row md:h-[clamp(460px,64vh,620px)]"
        style={{
          width:      "min(calc(100vw - 32px), 1320px)",
          border:     "1px solid rgba(0,0,0,0.13)",
          overflow:   "hidden",
          background: "#fff",
          opacity:    visible ? 1 : 0,
          transform:  visible
            ? "translateY(0px)"
            : above
            ? "translateY(-56px)"
            : "translateY(56px)",
          transition: "opacity 0.68s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.68s cubic-bezier(0.25,0.46,0.45,0.94)",
          willChange: "opacity, transform",
        }}
      >
        {/* ── IMATGE: 56% desktop, 280px mòbil ── */}
        <div
          className="relative flex-shrink-0 w-full md:w-[56%] h-[280px] md:h-full overflow-hidden"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
        >
          <ImageCycler slug={project.slug} images={images} />
        </div>

        {/* ── TEXT: la resta de l'amplada ── */}
        <div
          className="flex flex-col flex-1 overflow-hidden"
          style={{
            padding:   "clamp(22px, 2.8vw, 40px)",
            borderLeft: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {/* Metadata */}
          <p style={{
            fontFamily: sans, fontSize: "10px", fontWeight: 500,
            letterSpacing: "0.10em", textTransform: "uppercase",
            color: "#999", margin: "0 0 14px", lineHeight: 1.4,
          }}>
            {[data.tipus, data.municipality, data.year].filter(Boolean).join(" · ")}
          </p>

          {/* Títol */}
          <h2 style={{
            fontFamily: sans,
            fontSize: "clamp(20px, 2.2vw, 34px)",
            fontWeight: 800, lineHeight: 1.04,
            letterSpacing: "-0.04em", color: "#000",
            margin: "0 0 18px",
          }}>
            {data.title}
          </h2>

          {/* Descripció (curta o expandida) */}
          <div style={{ flex: 1, overflowY: expanded ? "auto" : "hidden", marginBottom: "14px" }}>
            {!expanded ? (
              <p style={{ fontFamily: sans, fontSize: "14px", lineHeight: 1.60, color: "#444", margin: 0 }}>
                {data.descriptionShort}
              </p>
            ) : (
              <>
                {paragraphs.map((para, i) => (
                  <p key={i} style={{
                    fontFamily: sans, fontSize: "13.5px", lineHeight: 1.64,
                    letterSpacing: "-0.005em", color: "#333", margin: "0 0 14px",
                  }}>
                    {para}
                  </p>
                ))}
              </>
            )}
          </div>

          {/* Dades tècniques — banda discreta */}
          {!expanded && facts.length > 0 && (
            <dl style={{
              display: "flex", flexWrap: "wrap", gap: "6px 24px",
              margin: "0 0 18px", borderTop: "1px solid rgba(0,0,0,0.07)",
              paddingTop: "12px",
            }}>
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt style={{
                    fontFamily: sans, fontSize: "9px", fontWeight: 600,
                    letterSpacing: "0.10em", textTransform: "uppercase",
                    color: "#c0c0c0", lineHeight: 1.2, marginBottom: "2px",
                  }}>{label}</dt>
                  <dd style={{ fontFamily: sans, fontSize: "12px", color: "#444", margin: 0, lineHeight: 1.3 }}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {/* Accions */}
          <div style={{ display: "flex", gap: "24px", alignItems: "center", marginTop: "auto", flexShrink: 0, paddingTop: "4px" }}>
            <button
              onClick={() => setExpanded((e) => !e)}
              style={{
                fontFamily: sans, fontSize: "12px", fontWeight: 600,
                letterSpacing: "0.02em", color: "#111",
                background: "none", border: "none", borderBottom: "1px solid #111",
                padding: "0 0 2px", cursor: "pointer",
              }}
            >
              {expanded ? ui.menys : ui.llegirMes}
            </button>
            <Link
              href={projectHref(project.slug, locale)}
              style={{
                fontFamily: sans, fontSize: "12px", fontWeight: 500,
                letterSpacing: "0.02em", color: "#bbb", textDecoration: "none",
              }}
            >
              {ui.veure}
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}

// ─── Tres accesos conceptuals (mínims, discrets) ──────────────────────────────

function ConceptualLinks({ locale }: { locale: Locale }) {
  const sans = "var(--font-sans)";
  const links = {
    ca: [
      { label: "Els nostres principis",   href: "/principis" },
      { label: "La nostra gent",          href: "/persones"  },
      { label: "Invitació a col·laborar", href: "/contacte"  },
    ],
    es: [
      { label: "Nuestros principios",     href: "/es/principis" },
      { label: "Nuestro equipo",          href: "/es/persones"  },
      { label: "Invitación a colaborar",  href: "/es/contacte"  },
    ],
    en: [
      { label: "Our principles",          href: "/en/principis" },
      { label: "Our people",              href: "/en/persones"  },
      { label: "Invite to collaborate",   href: "/en/contacte"  },
    ],
  }[locale];

  return (
    <div style={{
      paddingTop:   "108px",  // nav 88px + 20px respir
      paddingLeft:  "clamp(24px, 4vw, 64px)",
      paddingRight: "clamp(24px, 4vw, 64px)",
      display:      "flex",
      gap:          "clamp(20px, 3vw, 52px)",
      flexWrap:     "wrap",
    }}>
      {links.map(({ label, href }) => (
        <Link
          key={label}
          href={href}
          style={{
            fontFamily:     sans,
            fontSize:       "11px",
            fontWeight:     500,
            letterSpacing:  "0.06em",
            color:          "#bbb",
            textDecoration: "none",
            borderBottom:   "1px solid transparent",
            paddingBottom:  "1px",
            transition:     "color 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.color       = "#111";
            el.style.borderColor = "#111";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.color       = "#bbb";
            el.style.borderColor = "transparent";
          }}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

// ─── Component principal ───────────────────────────────────────────────────────

export default function HomeProjects({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <ConceptualLinks locale={locale} />
      {projects.map((project, i) => (
        <ProjectSlide
          key={project.slug}
          project={project}
          locale={locale}
          isFirst={i === 0}
        />
      ))}
    </div>
  );
}
