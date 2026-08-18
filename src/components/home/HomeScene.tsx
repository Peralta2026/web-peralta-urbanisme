"use client";

import { useEffect, useRef } from "react";

/* ─── Grid images ────────────────────────────────────────────────────────── */

const SRCS = [
  "/grid/01.jpg",
  "/grid/02.jpg",
  "/grid/03.jpg",
  "/grid/04.jpg",
  "/grid/05.jpg",
  "/grid/06.jpg",
  "/grid/07.jpg",
  "/grid/08.jpg",
  "/grid/09.jpg",
  "/grid/10.jpg",
];

/* ─── Layout ─────────────────────────────────────────────────────────────── */

const COLS      = 4;    // grid columns
const ROWS      = 14;   // grid rows (images repeat to fill)
const GUTTER    = 3;    // px, black gap between cells
const CELL_H_VH = 24;   // cell height in vh

/* ─── Scroll / animation ─────────────────────────────────────────────────── */

const HERO_RANGE = 900;   // virtual px to fully shrink hero
const HERO_MIN   = 0.44;  // minimum scale
const LERP_K     = 0.08;  // smoothing (lower = smoother / slower response)
const SLOW       = 0.55;  // even-row parallax speed multiplier
const FAST       = 1.10;  // odd-row parallax speed multiplier

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - Math.min(t, 1), 4);
}

/* Build a grid: ROWS × COLS, cycling through SRCS.
   Each row is offset by 3 images so the same image never aligns vertically. */
function buildGrid(): string[][] {
  const out: string[][] = [];
  let idx = 0;
  for (let r = 0; r < ROWS; r++) {
    const row: string[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push(SRCS[idx % SRCS.length]);
      idx++;
    }
    idx = (idx + 3) % SRCS.length; // shift offset per row
    out.push(row);
  }
  return out;
}

const GRID = buildGrid();

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function HomeScene() {
  const heroRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const vY    = useRef(0); // target virtual scroll
  const sY    = useRef(0); // smoothed virtual scroll
  const rafId = useRef(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    /* ── Wheel ── */
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;
      vY.current = Math.max(0, Math.min(vY.current + delta * 0.7, HERO_RANGE));
    };

    /* ── Touch ── */
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

    /* ── RAF loop ── */
    const tick = () => {
      // Smooth lerp toward target
      sY.current += (vY.current - sY.current) * LERP_K;

      const sy = sY.current;
      const p  = sy / HERO_RANGE;           // raw progress 0–1
      const ep = easeOutQuart(p);           // eased progress

      // Hero panel scale
      const scale = 1 - ep * (1 - HERO_MIN);
      if (heroRef.current) {
        heroRef.current.style.transform = `scale(${scale.toFixed(4)})`;
      }

      // Scroll hint: fades quickly as scroll begins
      if (hintRef.current) {
        hintRef.current.style.opacity = Math.max(0, 1 - p * 7).toFixed(3);
      }

      // Parallax rows
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

  return (
    <>
      {/* Keyframe for the scroll hint idle animation */}
      <style>{`
        @keyframes pu-hint-drop {
          0%,100% { transform: translateY(0); }
          55%      { transform: translateY(7px); }
        }
      `}</style>

      {/* ── Full-viewport scene container ────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          inset:    0,
          zIndex:   1,
          overflow: "hidden",
        }}
      >
        {/* ── LAYER A — Parallax image grid (background) ─────────────── */}
        <div
          style={{
            position:   "absolute",
            inset:      0,
            background: "#000",
            overflow:   "hidden",
            zIndex:     1,
          }}
        >
          {/* Row container — starts at top of viewport */}
          <div
            style={{
              position:       "absolute",
              top:            0,
              left:           0,
              right:          0,
              display:        "flex",
              flexDirection:  "column",
              gap:            `${GUTTER}px`,
            }}
          >
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
                      loading={ri < 5 ? "eager" : "lazy"}
                      style={{
                        width:      "100%",
                        height:     "100%",
                        objectFit:  "cover",
                        display:    "block",
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── LAYER B — White hero panel (foreground) ────────────────── */}
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
          {/* ── SCROLL DOWN indicator ── */}
          <div
            ref={hintRef}
            style={{
              position:       "absolute",
              bottom:         "42px",
              left:           "50%",
              transform:      "translateX(-50%)",
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              gap:            "10px",
              userSelect:     "none",
              pointerEvents:  "none",
              fontFamily:     "var(--font-mono)",
            }}
          >
            <span
              style={{
                fontSize:      "9px",
                letterSpacing: "0.20em",
                color:         "#bbb",
                textTransform: "uppercase",
              }}
            >
              scroll
            </span>
            {/* Animated arrow */}
            <span
              style={{
                display:       "flex",
                flexDirection: "column",
                alignItems:    "center",
                gap:           "0px",
                animation:     "pu-hint-drop 2.2s ease-in-out infinite",
              }}
            >
              <span
                style={{
                  display:    "block",
                  width:      "1px",
                  height:     "28px",
                  background: "#d0d0d0",
                }}
              />
              <svg
                width="8"
                height="5"
                viewBox="0 0 8 5"
                fill="none"
                style={{ display: "block" }}
              >
                <path
                  d="M0.5 0.5L4 4.5L7.5 0.5"
                  stroke="#d0d0d0"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
