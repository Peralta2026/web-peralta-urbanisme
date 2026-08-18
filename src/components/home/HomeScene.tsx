"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ─── Nav data ───────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Projectes",       href: "/projectes"    },
  { label: "Directori visual",href: "/directori"    },
  { label: "Persones",        href: "/persones"      },
  { label: "Intervencions",   href: "/intervencions" },
  { label: "Contacte",        href: "/contacte"      },
] as const;

const LOCALES = ["ca", "es", "en"] as const;

function localizeHref(href: string, locale: string) {
  return locale === "ca" ? href : `/${locale}${href}`;
}

/* ─── Grid images ────────────────────────────────────────────────────────── */

const SRCS = [
  "/grid/01.jpg", "/grid/02.jpg", "/grid/03.jpg", "/grid/04.jpg",
  "/grid/05.jpg", "/grid/06.jpg", "/grid/07.jpg", "/grid/08.jpg",
  "/grid/09.jpg", "/grid/10.jpg",
];

/* ─── Layout ─────────────────────────────────────────────────────────────── */

const COLS      = 2;   // 2 columnes verticals
const ROWS      = 6;   // files de cel·les
const CELL_H_VH = 65;  // alçada de cada cel·la
const GUTTER    = 2;   // px gap, negre mínim

/* ─── Scroll / animation ─────────────────────────────────────────────────── */

const HERO_RANGE = 900;
const HERO_MIN   = 0.44;
const LERP_K     = 0.08;
const SLOW       = 0.42;
const FAST       = 0.82;

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - Math.min(t, 1), 4);
}

function buildGrid(): string[][] {
  const out: string[][] = [];
  let idx = 0;
  for (let r = 0; r < ROWS; r++) {
    const row: string[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push(SRCS[idx % SRCS.length]);
      idx++;
    }
    idx = (idx + 2) % SRCS.length;
    out.push(row);
  }
  return out;
}

const GRID = buildGrid();

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function HomeScene({ locale }: { locale: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router    = useRouter();

  const heroRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const vY      = useRef(0);
  const sY      = useRef(0);
  const rafId   = useRef(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;
      vY.current = Math.max(0, Math.min(vY.current + delta * 0.7, HERO_RANGE));
    };

    let t0 = 0;
    const onTouchStart = (e: TouchEvent) => { t0 = e.touches[0].clientY; };
    const onTouchMove  = (e: TouchEvent) => {
      e.preventDefault();
      const delta = t0 - e.touches[0].clientY;
      vY.current = Math.max(0, Math.min(vY.current + delta, HERO_RANGE));
      t0 = e.touches[0].clientY;
    };

    document.addEventListener("wheel",      onWheel,      { passive: false });
    document.addEventListener("touchstart", onTouchStart, { passive: true  });
    document.addEventListener("touchmove",  onTouchMove,  { passive: false });

    const tick = () => {
      sY.current += (vY.current - sY.current) * LERP_K;
      const sy  = sY.current;
      const p   = sy / HERO_RANGE;
      const ep  = easeOutQuart(p);
      const scale = 1 - ep * (1 - HERO_MIN);

      if (heroRef.current) {
        heroRef.current.style.transform = `scale(${scale.toFixed(4)})`;
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = Math.max(0, 1 - p * 6).toFixed(3);
      }

      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        const speed = i % 2 === 0 ? SLOW : FAST;
        row.style.transform = `translateY(${(-sy * speed).toFixed(1)}px)`;
      });

      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("wheel",      onWheel);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove",  onTouchMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      document.body.style.overflow = "";
    };
  }, []);

  function switchLocale(newLocale: string) {
    router.push(newLocale === "ca" ? "/" : `/${newLocale}/`);
    setMenuOpen(false);
  }

  return (
    <>
      <style>{`
        @keyframes pu-hint-drop {
          0%,100% { transform: translateY(0); }
          55%      { transform: translateY(8px); }
        }
      `}</style>

      {/* ── Full-viewport scene ───────────────────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, overflow: "hidden" }}>

        {/* ── LAYER A — Parallax image grid ─────────────────────────── */}
        <div style={{ position: "absolute", inset: 0, background: "#0a0a0a", overflow: "hidden" }}>
          <div style={{
            position:      "absolute",
            top:           0,
            left:          0,
            right:         0,
            display:       "flex",
            flexDirection: "column",
            gap:           `${GUTTER}px`,
          }}>
            {GRID.map((row, ri) => (
              <div
                key={ri}
                ref={(el) => { rowRefs.current[ri] = el; }}
                style={{
                  display:    "flex",
                  gap:        `${GUTTER}px`,
                  height:     `${CELL_H_VH}vh`,
                  flexShrink: 0,
                  willChange: "transform",
                }}
              >
                {row.map((src, ci) => (
                  <div
                    key={ci}
                    style={{
                      flex:     `0 0 calc(${100 / COLS}% - ${(GUTTER * (COLS - 1)) / COLS}px)`,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={src}
                      alt=""
                      aria-hidden
                      loading={ri < 2 ? "eager" : "lazy"}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── LAYER B — White hero panel ────────────────────────────── */}
        <div
          ref={heroRef}
          style={{
            position:        "absolute",
            inset:           0,
            zIndex:          10,
            background:      "#ffffff",
            transformOrigin: "center center",
            willChange:      "transform",
          }}
        >
          {/* ─ Nav bar ─────────────────────────────────────────────── */}
          <div style={{
            position:   "absolute",
            top:        0,
            left:       0,
            right:      0,
            height:     "88px",
            display:    "flex",
            alignItems: "center",
            padding:    "0 32px",
          }}>
            {/* Logo */}
            <Link href={localizeHref("/", locale)} style={{ flexShrink: 0, textDecoration: "none" }}>
              <img
                src="/logo-nuevo.png"
                alt="Peralta Urbanisme"
                style={{ width: "196px", height: "auto", objectFit: "contain", display: "block" }}
              />
            </Link>

            {/* Right side: hamburger + lang */}
            <div style={{
              marginLeft:    "auto",
              display:       "flex",
              flexDirection: "column",
              alignItems:    "flex-end",
              gap:           "6px",
            }}>
              {/* Hamburger */}
              <button
                onClick={() => setMenuOpen(o => !o)}
                aria-label={menuOpen ? "Tancar menú" : "Obrir menú"}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <span style={{ display: "block", width: "22px", height: "1px", background: "#111" }} />
                <span style={{ display: "block", width: "22px", height: "1px", background: "#111" }} />
                <span style={{ display: "block", width: "22px", height: "1px", background: "#111" }} />
              </button>

              {/* Lang selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                {LOCALES.map((loc, i) => (
                  <span key={loc} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      onClick={() => switchLocale(loc)}
                      style={{
                        fontSize:      "10px",
                        letterSpacing: "0.10em",
                        fontWeight:    locale === loc ? 700 : 400,
                        color:         locale === loc ? "#000" : "#ccc",
                        background:    "none",
                        border:        "none",
                        cursor:        "pointer",
                        padding:       0,
                        textTransform: "uppercase",
                      }}
                    >
                      {loc}
                    </button>
                    {i < LOCALES.length - 1 && (
                      <span style={{ color: "#e8e8e8", fontSize: "10px" }}>/</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ─ Scroll hint ─────────────────────────────────────────── */}
          <div
            ref={hintRef}
            style={{
              position:      "absolute",
              bottom:        "40px",
              left:          "50%",
              transform:     "translateX(-50%)",
              display:       "flex",
              flexDirection: "column",
              alignItems:    "center",
              gap:           "10px",
              userSelect:    "none",
              pointerEvents: "none",
              fontFamily:    "var(--font-mono)",
            }}
          >
            <span style={{ fontSize: "9px", letterSpacing: "0.22em", color: "#c8c8c8", textTransform: "uppercase" }}>
              scroll
            </span>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "pu-hint-drop 2.4s ease-in-out infinite" }}>
              <span style={{ display: "block", width: "1px", height: "32px", background: "#dedede" }} />
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ display: "block" }}>
                <path d="M0.5 0.5L4 4.5L7.5 0.5" stroke="#dedede" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* ── Menu overlay ──────────────────────────────────────────────── */}
      {menuOpen && (
        <div style={{
          position:      "fixed",
          inset:         0,
          zIndex:        200,
          background:    "#ffffff",
          display:       "flex",
          flexDirection: "column",
          fontFamily:    "var(--font-sans)",
        }}>
          {/* Menu header */}
          <div style={{ display: "flex", alignItems: "center", height: "88px", padding: "0 32px", flexShrink: 0 }}>
            <img src="/logo-nuevo.png" alt="Peralta Urbanisme" style={{ width: "196px", height: "auto" }} />
            <button
              onClick={() => setMenuOpen(false)}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "26px", lineHeight: 1, padding: "4px", color: "#000" }}
              aria-label="Tancar menú"
            >
              ×
            </button>
          </div>

          {/* Border */}
          <div style={{ height: "1px", background: "#1a1a1a", flexShrink: 0 }} />

          {/* Nav links */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "48px 32px 48px" }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={localizeHref(href, locale)}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontSize:      "clamp(28px, 4vw, 44px)",
                    fontWeight:    600,
                    color:         "#000",
                    textDecoration:"none",
                    letterSpacing: "-0.01em",
                    lineHeight:    1.25,
                    paddingTop:    "8px",
                    paddingBottom: "8px",
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Lang selector at bottom */}
            <div style={{
              marginTop:    "auto",
              display:      "flex",
              gap:          "12px",
              alignItems:   "center",
              fontFamily:   "var(--font-mono)",
              fontSize:     "11px",
              letterSpacing:"0.10em",
            }}>
              {LOCALES.map((loc, i) => (
                <span key={loc} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <button
                    onClick={() => switchLocale(loc)}
                    style={{
                      fontSize:      "11px",
                      letterSpacing: "0.10em",
                      fontWeight:    locale === loc ? 700 : 400,
                      color:         locale === loc ? "#000" : "#aaa",
                      background:    "none",
                      border:        "none",
                      cursor:        "pointer",
                      padding:       0,
                      textTransform: "uppercase",
                    }}
                  >
                    {loc}
                  </button>
                  {i < LOCALES.length - 1 && (
                    <span style={{ color: "#e0e0e0" }}>/</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
