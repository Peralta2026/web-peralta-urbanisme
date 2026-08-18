"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import type { Project } from "@/lib/types";

/* ─── Constants ──────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Projectes",       href: "/projectes" },
  { label: "Directori visual", href: "/directori" },
  { label: "Persones",        href: "/persones" },
  { label: "Intervencions",   href: "/intervencions" },
  { label: "Contacte",        href: "/contacte" },
] as const;

const CONCEPT_LINKS = [
  { label: "Els nostres principis",  href: "/principis" },
  { label: "La nostra gent",         href: "/persones" },
  { label: "Invitació a col·laborar", href: "/contacte" },
] as const;

const LOCALES     = ["ca", "es", "en"] as const;
const TRANS_MS    = 820;

const SLUG_LABEL: Record<string, string> = {
  "residencial":                 "Residencial",
  "transformacio":               "Transformació",
  "extensio":                    "Extensió",
  "regeneracio":                 "Regeneració",
  "activitat-economica":         "Activitat econòmica",
  "infraestructura-verda":       "Infraestructura verda",
  "integracio-infraestructures": "Integració d'infraestructures",
  "estructura-urbana":           "Estructura urbana",
  "divulgacio":                  "Divulgació",
  "espai-public":                "Espai públic",
  "participacio-ciutadana":      "Participació ciutadana",
  "encaixos-singulars":          "Encaixos singulars",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function localizeHref(href: string, locale: string) {
  return locale === "ca" ? href : `/${locale}${href}`;
}

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface Props {
  locale:   string;
  projects: Project[];
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function HomeScene({ locale, projects }: Props) {
  const router        = useRouter();
  const currentLocale = useLocale();

  const [idx, setIdx]         = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const N             = projects.length;
  const isTransRef    = useRef(false);
  const touchStartX   = useRef(0);
  const touchStartY   = useRef(0);

  /* ── refs for fresh values inside stable event listeners ── */
  const goNext = useRef(() => {});
  const goPrev = useRef(() => {});

  goNext.current = () => {
    if (isTransRef.current || idx >= N - 1) return;
    isTransRef.current = true;
    setIdx(i => i + 1);
    setTimeout(() => { isTransRef.current = false; }, TRANS_MS);
  };

  goPrev.current = () => {
    if (isTransRef.current || idx <= 0) return;
    isTransRef.current = true;
    setIdx(i => i - 1);
    setTimeout(() => { isTransRef.current = false; }, TRANS_MS);
  };

  /* ── lock body scroll ── */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* ── event listeners (stable, use ref callbacks) ── */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;
      if (d > 15)  goNext.current();
      if (d < -15) goPrev.current();
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        /* horizontal swipe → tinder */
        if (dx < 0) goNext.current(); else goPrev.current();
      } else if (Math.abs(dy) > 40) {
        if (dy < 0) goNext.current(); else goPrev.current();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goNext.current();
      if (e.key === "ArrowUp"   || e.key === "ArrowLeft")  goPrev.current();
    };

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true  });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true  });
    window.addEventListener("keydown",    onKey);
    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("keydown",    onKey);
    };
  }, []);

  function switchLocale(loc: string) {
    router.push(loc === "ca" ? "/" : `/${loc}/`);
    setMenuOpen(false);
  }

  /* ── card transform by distance from active ── */
  function cardVars(i: number): React.CSSProperties {
    const d = i - idx;
    const base = `translate(-50%, -50%)`;
    if (d === 0)  return { opacity: 1, transform: `${base} translateY(0)   scale(1)`,    zIndex: 3, pointerEvents: "auto"  };
    if (d === 1)  return { opacity: 0, transform: `${base} translateY(90px) scale(0.99)`, zIndex: 2, pointerEvents: "none"  };
    if (d === -1) return { opacity: 0, transform: `${base} translateY(-90px) scale(0.99)`,zIndex: 2, pointerEvents: "none"  };
    return        { opacity: 0, transform: `${base} translateY(140px) scale(0.98)`,       zIndex: 0, pointerEvents: "none"  };
  }

  /* ─────────────────────────────────────────────────────────── render ──── */
  return (
    <>
      <style>{`
        @keyframes pu-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .pu-card {
          display: grid;
          grid-template-columns: 56% 44%;
          width: min(84vw, 1260px);
          height: clamp(460px, 60vh, 600px);
        }
        @media (max-width: 767px) {
          .pu-card {
            grid-template-columns: 1fr !important;
            grid-template-rows: 52% 48% !important;
            width: min(90vw, 400px) !important;
            height: clamp(480px, 72vh, 580px) !important;
          }
        }
      `}</style>

      {/* ── Fixed stage ───────────────────────────────────────────────── */}
      <div style={{
        position:   "fixed",
        inset:      0,
        zIndex:     100,
        background: "#fff",
        overflow:   "hidden",
        fontFamily: "var(--font-sans)",
      }}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header style={{
          position:        "absolute",
          top: 0, left: 0, right: 0,
          zIndex:          10,
          display:         "flex",
          alignItems:      "flex-start",
          justifyContent:  "space-between",
          padding:         "26px 32px",
          pointerEvents:   menuOpen ? "none" : "auto",
        }}>
          {/* Logo + concept links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link href={localizeHref("/", locale)} style={{ display: "block" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-nuevo.png"
                alt="Peralta Urbanisme"
                style={{ width: "clamp(150px, 16vw, 220px)", height: "auto", display: "block" }}
              />
            </Link>
            <nav style={{
              display:       "flex",
              gap:           "14px",
              fontFamily:    "var(--font-mono)",
              fontSize:      "8.5px",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              flexWrap:      "wrap",
            }}>
              {CONCEPT_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={localizeHref(href, locale)}
                  style={{ color: "#aaa", textDecoration: "none" }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Lang + burger */}
          <div style={{ display: "flex", alignItems: "center", gap: "18px", pointerEvents: "auto" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "5px",
              fontFamily: "var(--font-mono)", fontSize: "9.5px",
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              {LOCALES.map((loc, i) => (
                <span key={loc} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <button onClick={() => switchLocale(loc)} style={{
                    color: currentLocale === loc ? "#111" : "#ccc",
                    fontWeight: currentLocale === loc ? 700 : 400,
                    background: "none", border: "none", cursor: "pointer",
                    padding: 0, fontSize: "9.5px", letterSpacing: "0.08em",
                  }}>
                    {loc}
                  </button>
                  {i < LOCALES.length - 1 && <span style={{ color: "#e0e0e0" }}>/</span>}
                </span>
              ))}
            </div>

            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Tancar" : "Menú"}
              style={{
                display: "flex", flexDirection: "column", gap: "5px",
                background: "none", border: "none", cursor: "pointer", padding: 0,
              }}
            >
              {menuOpen
                ? <span style={{ fontSize: "22px", lineHeight: 1, color: "#111" }}>×</span>
                : <>
                    <span style={{ display:"block", width:"24px", height:"1px", background:"#111" }} />
                    <span style={{ display:"block", width:"24px", height:"1px", background:"#111" }} />
                    <span style={{ display:"block", width:"24px", height:"1px", background:"#111" }} />
                  </>
              }
            </button>
          </div>
        </header>

        {/* ── Project card stack ─────────────────────────────────────── */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {projects.map((proj, i) => {
            const d   = proj[locale as "ca" | "es" | "en"];
            const src = `/projects/${proj.slug}/${proj.coverImage}`;
            const near = Math.abs(i - idx) <= 2;

            return (
              <div
                key={proj.slug}
                className="pu-card"
                style={{
                  position:   "absolute",
                  left:       "50%",
                  top:        "54%",
                  border:     "1px solid rgba(0,0,0,0.12)",
                  overflow:   "hidden",
                  willChange: "transform, opacity",
                  transition: `transform ${TRANS_MS}ms cubic-bezier(0.22,1,0.36,1), opacity 600ms cubic-bezier(0.22,1,0.36,1)`,
                  ...cardVars(i),
                }}
              >
                {/* Image */}
                <div style={{ overflow: "hidden", position: "relative", height: "100%" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={d.title}
                    loading={near ? "eager" : "lazy"}
                    style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                  />
                </div>

                {/* Text */}
                <div style={{
                  display:       "flex",
                  flexDirection: "column",
                  padding:       "clamp(22px,3vh,38px) clamp(22px,2.8vw,36px)",
                  background:    "#fff",
                  height:        "100%",
                  overflow:      "hidden",
                  boxSizing:     "border-box",
                }}>
                  <p style={{
                    fontFamily:    "var(--font-mono)",
                    fontSize:      "9px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color:         "#ccc",
                    marginBottom:  "clamp(10px,1.8vh,18px)",
                    flexShrink:    0,
                  }}>
                    {d.municipality}{d.year ? ` · ${d.year}` : ""}{d.tipus ? ` · ${d.tipus}` : ""}
                  </p>

                  <h2 style={{
                    fontSize:      "clamp(15px,1.7vw,25px)",
                    fontWeight:    700,
                    letterSpacing: "-0.02em",
                    lineHeight:    1.1,
                    color:         "#111",
                    marginBottom:  "clamp(10px,1.8vh,18px)",
                    flexShrink:    0,
                  }}>
                    {d.title}
                  </h2>

                  <p style={{
                    fontSize:        "12px",
                    lineHeight:      1.75,
                    color:           "#555",
                    overflow:        "hidden",
                    display:         "-webkit-box",
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: "vertical",
                    marginBottom:    "clamp(10px,1.8vh,18px)",
                    flexShrink:      0,
                  }}>
                    {d.descriptionShort}
                  </p>

                  {proj.tags.length > 0 && (
                    <p style={{
                      fontFamily:    "var(--font-mono)",
                      fontSize:      "8px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color:         "#d0d0d0",
                      lineHeight:    1.8,
                      flexShrink:    0,
                    }}>
                      {proj.tags.map(t => SLUG_LABEL[t] ?? t).join("  /  ")}
                    </p>
                  )}

                  <div style={{ flex: 1 }} />

                  <Link
                    href={localizeHref(`/projectes/${proj.slug}`, locale)}
                    style={{
                      fontFamily:     "var(--font-mono)",
                      fontSize:       "9px",
                      letterSpacing:  "0.12em",
                      textTransform:  "uppercase",
                      color:          "#111",
                      textDecoration: "none",
                      borderBottom:   "1px solid #111",
                      paddingBottom:  "2px",
                      alignSelf:      "flex-start",
                      flexShrink:     0,
                    }}
                  >
                    Veure projecte →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Scroll hint (only on first card) ──────────────────────── */}
        {idx === 0 && (
          <div style={{
            position:       "absolute",
            bottom:         "22px",
            left:           "50%",
            transform:      "translateX(-50%)",
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            gap:            "8px",
            pointerEvents:  "none",
            animation:      "pu-fade-in 1s ease 0.4s both",
          }}>
            <span style={{
              fontFamily:    "var(--font-mono)",
              fontSize:      "7.5px",
              letterSpacing: "0.22em",
              color:         "#ccc",
              textTransform: "uppercase",
            }}>
              Scroll
            </span>
            <span style={{ display:"block", width:"1px", height:"22px", background:"#e0e0e0" }} />
          </div>
        )}

        {/* ── Menu overlay ───────────────────────────────────────────── */}
        {menuOpen && (
          <div style={{
            position:      "absolute",
            inset:         0,
            zIndex:        200,
            background:    "#fff",
            display:       "flex",
            flexDirection: "column",
            padding:       "100px 48px 48px",
          }}>
            <button
              onClick={() => setMenuOpen(false)}
              style={{
                position: "absolute", top: "26px", right: "32px",
                fontSize: "22px", lineHeight: 1, color: "#111",
                background: "none", border: "none", cursor: "pointer",
              }}
            >
              ×
            </button>

            <nav style={{ display:"flex", flexDirection:"column", gap:"22px" }}>
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={localizeHref(href, locale)}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontSize:      "clamp(22px,3.5vw,42px)",
                    fontWeight:    650,
                    color:         "#111",
                    textDecoration: "none",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div style={{
              marginTop:  "auto",
              display:    "flex",
              gap:        "14px",
              fontFamily: "var(--font-mono)",
              fontSize:   "10px",
              letterSpacing: "0.08em",
            }}>
              {LOCALES.map((loc, i) => (
                <span key={loc} style={{ display:"flex", alignItems:"center", gap:"14px" }}>
                  <button
                    onClick={() => switchLocale(loc)}
                    style={{
                      color:      currentLocale === loc ? "#111" : "#aaa",
                      fontWeight: currentLocale === loc ? 700 : 400,
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase",
                    }}
                  >
                    {loc}
                  </button>
                  {i < LOCALES.length - 1 && <span style={{ color:"#ddd" }}>/</span>}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
