"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Timing (ms) ─────────────────────────────────────────────────────────────
const T = {
  P1_END:   900,
  P2_START: 900,
  P2_END:   2200,
  P3_END:   2700,
  P4_END:   3700,
  VID_FADE: 4200,  // canvas totalment desaparegut, vídeo visible
  SWEEP:    6300,
};

// ─── Easing ───────────────────────────────────────────────────────────────────
function easeOut(t: number)  { return 1 - (1 - t) ** 3; }
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number) { return Math.max(0, Math.min(1, v)); }
function prog(t: number, start: number, end: number) {
  return clamp((t - start) / (end - start));
}

interface Particle {
  x: number; y: number;
  sx: number; sy: number;
  lx: number; ly: number;
  gx: number; gy: number;
  delay: number;
  r: number;
}

export default function IntroScreen({ onDone }: { onDone: () => void }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const logoImgRef   = useRef<HTMLImageElement | null>(null);
  const rafRef       = useRef<number>(0);
  const doneRef      = useRef(false);

  const [videoOpacity, setVideoOpacity] = useState(0);
  const [sweeping,     setSweeping]     = useState(false);

  const sweep = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    cancelAnimationFrame(rafRef.current);
    sessionStorage.setItem("pu-intro", "1");
    setSweeping(true);
    setTimeout(onDone, 920);
  }, [onDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem("pu-intro", "1");
      setTimeout(onDone, 400);
      return;
    }

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // ── Geometria ─────────────────────────────────────────────────────────
    const logoW = Math.min(320, W * 0.38);
    const logoH = logoW * (90 / 360);
    const logoX = (W - logoW) / 2;
    const logoY = H / 2 - logoH / 2 - 10;

    const frameW = Math.min(740, W * 0.68);
    const frameH = frameW * 0.5625;
    const frameX = (W - frameW) / 2;
    const frameY = (H - frameH) / 2;

    const scW = W * 0.46;
    const scH = H * 0.36;
    const scX = (W - scW) / 2;
    const scY = (H - scH) / 2;

    // ── FIX 1: Carregar logo i guardar referència per dibuixar-lo al canvas ─
    const loadLogo = (): Promise<{ x: number; y: number }[]> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          logoImgRef.current = img; // <-- imatge guardada per dibuixar-la

          // Mostreig de píxels foscos (umbral ampliat a 120 per agafar anti-aliasing)
          const tmp = document.createElement("canvas");
          tmp.width  = img.naturalWidth;
          tmp.height = img.naturalHeight;
          const tCtx = tmp.getContext("2d")!;
          tCtx.drawImage(img, 0, 0);
          const d = tCtx.getImageData(0, 0, tmp.width, tmp.height).data;
          const pts: { x: number; y: number }[] = [];
          const step = 4;
          for (let py = 0; py < img.naturalHeight; py += step) {
            for (let px = 0; px < img.naturalWidth; px += step) {
              const i = (py * img.naturalWidth + px) * 4;
              // Píxel fosc: tots tres canals < 120
              if (d[i] < 120 && d[i + 1] < 120 && d[i + 2] < 120) {
                pts.push({
                  x: logoX + (px / img.naturalWidth) * logoW,
                  y: logoY + (py / img.naturalHeight) * logoH,
                });
              }
            }
          }
          resolve(pts);
        };
        img.onerror = () => {
          const pts: { x: number; y: number }[] = [];
          for (let i = 0; i < 160; i++) {
            pts.push({ x: logoX + Math.random() * logoW, y: logoY + Math.random() * logoH });
          }
          resolve(pts);
        };
        img.src = "/logo.jpg";
      });

    // ── FIX 3: Posicions de malla (bordes + interior) ─────────────────────
    // Línies verticals i horitzontals que cobreixen TOT el frame
    const buildGridPositions = (N: number): { x: number; y: number }[] => {
      const positions: { x: number; y: number }[] = [];
      const jit = () => (Math.random() - 0.5) * 1.2;

      // 4 línies verticals: 0%, 33%, 67%, 100% de l'amplada
      const vCols = [0, 1 / 3, 2 / 3, 1];
      // 4 línies horitzontals: 0%, 33%, 67%, 100% de l'alçada
      const hRows = [0, 1 / 3, 2 / 3, 1];

      const nTotal = vCols.length + hRows.length; // 8 línies
      const ptsPerLine = Math.ceil(N / nTotal);

      // Punts al llarg de cada línia vertical (de dalt a baix)
      for (const col of vCols) {
        for (let k = 0; k < ptsPerLine; k++) {
          positions.push({
            x: frameX + col * frameW + jit(),
            y: frameY + (k / (ptsPerLine - 1)) * frameH + jit(),
          });
        }
      }
      // Punts al llarg de cada línia horitzontal (d'esquerra a dreta)
      for (const row of hRows) {
        for (let k = 0; k < ptsPerLine; k++) {
          positions.push({
            x: frameX + (k / (ptsPerLine - 1)) * frameW + jit(),
            y: frameY + row * frameH + jit(),
          });
        }
      }

      // Barreja aleatòria i retorna N posicions
      for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
      }
      return positions.slice(0, N);
    };

    const buildParticles = (logoPts: { x: number; y: number }[]): Particle[] => {
      const MAX  = 220;
      const step = Math.max(1, Math.floor(logoPts.length / MAX));
      const logo = logoPts.filter((_, i) => i % step === 0).slice(0, MAX);
      const N    = logo.length || MAX;

      const gridPts = buildGridPositions(N);

      return logo.map((lp, i) => ({
        x: 0, y: 0,
        sx: scX + Math.random() * scW,
        sy: scY + Math.random() * scH,
        lx: lp.x,
        ly: lp.y,
        gx: gridPts[i]?.x ?? frameX + Math.random() * frameW,
        gy: gridPts[i]?.y ?? frameY + Math.random() * frameH,
        delay: Math.random() * 0.70,
        // FIX 2: Punts més fins (0.6–1.3 px de radi)
        r:    0.6 + Math.random() * 0.7,
      }));
    };

    // ── Bucle de dibuix ──────────────────────────────────────────────────
    let particles: Particle[] = [];
    let videoStarted  = false;
    let sweepStarted  = false;
    let t0            = 0;

    const draw = (now: number) => {
      if (doneRef.current) return;
      rafRef.current = requestAnimationFrame(draw);

      const t = now - t0;

      // Fons blanc
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, W, H);

      // ── FIX 1: Dibuix del logo real al canvas (fases 2 i 3) ─────────────
      // L'opacitat del logo augmenta mentre els punts convergeixen,
      // i disminueix mentre es formen la retícula
      let logoAlpha = 0;
      if (t >= T.P2_START && t < T.P2_END) {
        logoAlpha = easeOut(prog(t, T.P2_START, T.P2_END)) * 0.90;
      } else if (t >= T.P2_END && t < T.P3_END) {
        logoAlpha = 0.90;
      } else if (t >= T.P3_END && t < T.P4_END) {
        logoAlpha = (1 - easeInOut(prog(t, T.P3_END, T.P4_END))) * 0.90;
      }

      if (logoAlpha > 0.01 && logoImgRef.current) {
        ctx.globalAlpha = logoAlpha;
        ctx.drawImage(logoImgRef.current, logoX, logoY, logoW, logoH);
        ctx.globalAlpha = 1;
      }

      // ── Dibuix de partícules ──────────────────────────────────────────
      for (const p of particles) {
        let x = p.sx, y = p.sy, alpha = 0;

        if (t < T.P1_END) {
          const a = prog(t / T.P1_END, p.delay, 0.95);
          alpha   = easeOut(a) * 0.80;
          x = p.sx; y = p.sy;

        } else if (t < T.P2_END) {
          const e = easeInOut(prog(t, T.P2_START, T.P2_END));
          x     = lerp(p.sx, p.lx, e);
          y     = lerp(p.sy, p.ly, e);
          alpha = 0.70;

        } else if (t < T.P3_END) {
          x = p.lx; y = p.ly;
          // Punts s'esvaeixen lleugerament quan el logo és visible
          alpha = 0.35;

        } else if (t < T.P4_END) {
          const e = easeInOut(prog(t, T.P3_END, T.P4_END));
          x     = lerp(p.lx, p.gx, e);
          y     = lerp(p.ly, p.gy, e);
          alpha = 0.85;

        } else {
          x     = p.gx;
          y     = p.gy;
          // Desapareix a mesura que apareix el vídeo
          alpha = clamp(1 - prog(t, T.P4_END, T.VID_FADE)) * 0.70;
        }

        if (alpha < 0.01) continue;
        ctx.globalAlpha = alpha;
        ctx.fillStyle   = "#111";
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Línies de retícula al canvas (fase 4, s'esvaeixen abans del vídeo) ─
      if (t > T.P3_END && t < T.VID_FADE) {
        const buildP  = clamp(prog(t, T.P3_END, T.P4_END));
        const fadeOut = t > T.P4_END ? clamp(1 - prog(t, T.P4_END, T.VID_FADE)) : 1;
        const a       = easeOut(buildP) * 0.12 * fadeOut;

        if (a > 0.005) {
          ctx.globalAlpha = a;
          ctx.strokeStyle = "#111";
          ctx.lineWidth   = 0.6;

          // Línies verticals (bordes + 2 interiors)
          for (const col of [0, 1/3, 2/3, 1]) {
            ctx.beginPath();
            ctx.moveTo(frameX + col * frameW, frameY);
            ctx.lineTo(frameX + col * frameW, frameY + frameH);
            ctx.stroke();
          }
          // Línies horitzontals (bordes + 2 interiors)
          for (const row of [0, 1/3, 2/3, 1]) {
            ctx.beginPath();
            ctx.moveTo(frameX,          frameY + row * frameH);
            ctx.lineTo(frameX + frameW, frameY + row * frameH);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;

      // ── Trigger vídeo ─────────────────────────────────────────────────
      if (t >= T.P4_END && !videoStarted) {
        videoStarted = true;
        setVideoOpacity(1);
        videoRef.current?.play().catch(() => {});
      }

      // ── Trigger barrida ───────────────────────────────────────────────
      if (t >= T.SWEEP && !sweepStarted) {
        sweepStarted = true;
        sweep();
      }
    };

    // ── Iniciar ───────────────────────────────────────────────────────────
    loadLogo().then((pts) => {
      particles      = buildParticles(pts);
      t0             = performance.now();
      rafRef.current = requestAnimationFrame(draw);
    });

    // ── Skip ─────────────────────────────────────────────────────────────
    const onSkip = (e: Event) => {
      if (t0 && performance.now() - t0 < 600) return;
      if (e.type === "keydown") {
        const k = (e as KeyboardEvent).key;
        if (k !== "Escape" && k !== " " && k !== "Enter") return;
      }
      sweep();
    };
    window.addEventListener("click",      onSkip);
    window.addEventListener("keydown",    onSkip);
    window.addEventListener("wheel",      onSkip, { passive: true });
    window.addEventListener("touchstart", onSkip, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("click",      onSkip);
      window.removeEventListener("keydown",    onSkip);
      window.removeEventListener("wheel",      onSkip);
      window.removeEventListener("touchstart", onSkip);
    };
  }, [sweep, onDone]);

  return (
    <div
      aria-hidden="true"
      style={{
        position:   "fixed",
        inset:      0,
        zIndex:     9999,
        background: "#fff",
        overflow:   "hidden",
        transform:  sweeping ? "translateY(-100%)" : "translateY(0)",
        transition: sweeping ? "transform 0.90s cubic-bezier(0.76, 0, 0.18, 1)" : "none",
        willChange: "transform",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, display: "block" }}
      />

      {/* FIX 4: background blanc + contain per evitar marges negres */}
      <div
        style={{
          position:    "absolute",
          left:        "50%",
          top:         "50%",
          transform:   "translate(-50%, -50%)",
          width:       "min(740px, 68vw)",
          aspectRatio: "16 / 9",
          background:  "#fff",
          overflow:    "hidden",
          opacity:     videoOpacity,
          transition:  "opacity 0.55s ease",
          pointerEvents: "none",
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          style={{
            width:      "100%",
            height:     "100%",
            objectFit:  "contain",   // FIX 4: contain per no tallar ni afegir barres negres
            display:    "block",
            background: "#fff",
          }}
        >
          <source src="/intro.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
