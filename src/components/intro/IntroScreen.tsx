"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Timing (ms) ─────────────────────────────────────────────────────────────
// Total aprox: 6.2s + 0.9s sweep = 7.1s
const T = {
  P1_END:   900,   // punts tots visibles (scatter)
  P2_START: 900,   // inici formació logo
  P2_END:   2200,  // logo completament format
  P3_END:   2700,  // pausa logo acaba
  P4_END:   3700,  // retícula completament formada
  VID_FADE: 4300,  // vídeo totalment visible (500ms fade)
  SWEEP:    6200,  // barrida cap amunt comença
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

// ─── Partícula ────────────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number;
  sx: number; sy: number;  // scatter
  lx: number; ly: number;  // logo
  gx: number; gy: number;  // grid perímetre
  delay: number;           // aparició fase 1 (0–0.7)
  r: number;               // radi (1.2–2.4)
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function IntroScreen({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const rafRef    = useRef<number>(0);
  const doneRef   = useRef(false);

  const [videoOpacity, setVideoOpacity] = useState(0);
  const [sweeping,     setSweeping]     = useState(false);

  // ── Fase 6: barrida cap amunt ─────────────────────────────────────────────
  const sweep = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    cancelAnimationFrame(rafRef.current);
    sessionStorage.setItem("pu-intro", "1");
    setSweeping(true);
    setTimeout(onDone, 920);
  }, [onDone]);

  // ── Animació principal ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reduced motion: skip directament
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

    // Geometria logo (centrat verticalment, una mica amunt del centre)
    const logoW = Math.min(340, W * 0.40);
    const logoH = logoW * (90 / 360);
    const logoX = (W - logoW) / 2;
    const logoY = H / 2 - logoH / 2 - 10;

    // Geometria frame vídeo (ha de coincidir amb el CSS del div de vídeo)
    const frameW = Math.min(740, W * 0.68);
    const frameH = frameW * 0.5625; // 16:9
    const frameX = (W - frameW) / 2;
    const frameY = (H - frameH) / 2;

    // Zona scatter (núvol de punts inicial)
    const scW = W * 0.48;
    const scH = H * 0.38;
    const scX = (W - scW) / 2;
    const scY = (H - scH) / 2;

    // ── Mostreig píxels foscos del logo ────────────────────────────────────
    const sampleLogo = (): Promise<{ x: number; y: number }[]> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
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
              if (d[i] < 85 && d[i + 1] < 85 && d[i + 2] < 85) {
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
          // Fallback: punts distribuïts a la zona del logo
          const pts: { x: number; y: number }[] = [];
          for (let i = 0; i < 180; i++) {
            pts.push({ x: logoX + Math.random() * logoW, y: logoY + Math.random() * logoH });
          }
          resolve(pts);
        };
        img.src = "/logo.jpg";
      });

    // ── Construir partícules ──────────────────────────────────────────────
    const buildParticles = (logoPts: { x: number; y: number }[]): Particle[] => {
      const MAX  = 220;
      const step = Math.max(1, Math.floor(logoPts.length / MAX));
      const logo = logoPts.filter((_, i) => i % step === 0).slice(0, MAX);
      const N    = logo.length;

      // Posicions al perímetre del frame (fase 4)
      const perim = 2 * (frameW + frameH);
      const getGrid = (i: number): { x: number; y: number } => {
        const p   = (i / N) * perim;
        const jit = () => (Math.random() - 0.5) * 2.5;
        if (p < frameW)
          return { x: frameX + p + jit(),                                 y: frameY + jit() };
        if (p < frameW + frameH)
          return { x: frameX + frameW + jit(),                            y: frameY + (p - frameW) + jit() };
        if (p < 2 * frameW + frameH)
          return { x: frameX + frameW - (p - frameW - frameH) + jit(),   y: frameY + frameH + jit() };
        return   { x: frameX + jit(),                                     y: frameY + frameH - (p - 2 * frameW - frameH) + jit() };
      };

      return logo.map((lp, i) => {
        const g = getGrid(i);
        return {
          x: 0, y: 0,
          sx: scX + Math.random() * scW,
          sy: scY + Math.random() * scH,
          lx: lp.x,
          ly: lp.y,
          gx: g.x,
          gy: g.y,
          delay: Math.random() * 0.70,
          r:    1.2 + Math.random() * 1.2,
        };
      });
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

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, W, H);

      // ── Dibuix de partícules ──────────────────────────────────────────
      for (const p of particles) {
        let x = p.sx, y = p.sy, alpha = 0;

        if (t < T.P1_END) {
          // Fase 1: aparició al scatter
          const a = prog(t / T.P1_END, p.delay, 0.95);
          alpha   = easeOut(a) * 0.88;
          x = p.sx; y = p.sy;

        } else if (t < T.P2_END) {
          // Fase 2: scatter → logo
          const e = easeInOut(prog(t, T.P2_START, T.P2_END));
          x     = lerp(p.sx, p.lx, e);
          y     = lerp(p.sy, p.ly, e);
          alpha = 1;

        } else if (t < T.P3_END) {
          // Fase 3: logo estable
          x = p.lx; y = p.ly; alpha = 1;

        } else if (t < T.P4_END) {
          // Fase 4: logo → retícula
          const e = easeInOut(prog(t, T.P3_END, T.P4_END));
          x     = lerp(p.lx, p.gx, e);
          y     = lerp(p.ly, p.gy, e);
          alpha = 1;

        } else {
          // Fase 5: partícules al perímetre, s'esvaeixen mentre apareix el vídeo
          x     = p.gx;
          y     = p.gy;
          alpha = clamp(1 - prog(t, T.P4_END, T.VID_FADE)) * 0.55;
        }

        if (alpha < 0.01) continue;
        ctx.globalAlpha = alpha;
        ctx.fillStyle   = "#111";
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Línies de retícula (fase 4) ───────────────────────────────────
      if (t > T.P3_END && t < T.VID_FADE + 150) {
        const buildP  = clamp(prog(t, T.P3_END, T.P4_END));
        const fadeOut = t > T.P4_END ? clamp(1 - prog(t, T.P4_END, T.VID_FADE)) : 1;
        const a       = easeOut(buildP) * 0.13 * fadeOut;

        if (a > 0.005) {
          ctx.globalAlpha = a;
          ctx.strokeStyle = "#111";
          ctx.lineWidth   = 0.7;

          // Marc exterior
          ctx.strokeRect(frameX, frameY, frameW, frameH);

          // 2 verticals interiors
          ctx.beginPath();
          ctx.moveTo(frameX + frameW / 3, frameY);
          ctx.lineTo(frameX + frameW / 3, frameY + frameH);
          ctx.moveTo(frameX + (2 * frameW) / 3, frameY);
          ctx.lineTo(frameX + (2 * frameW) / 3, frameY + frameH);
          ctx.stroke();

          // 1 horitzontal interior
          ctx.beginPath();
          ctx.moveTo(frameX, frameY + frameH / 2);
          ctx.lineTo(frameX + frameW, frameY + frameH / 2);
          ctx.stroke();
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
    sampleLogo().then((pts) => {
      particles      = buildParticles(pts);
      t0             = performance.now();
      rafRef.current = requestAnimationFrame(draw);
    });

    // ── Listeners skip ────────────────────────────────────────────────────
    const onSkip = (e: Event) => {
      // No saltar en els primers 600ms (evita clicks accidentals)
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

  // ── Render ────────────────────────────────────────────────────────────────
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
      {/* Canvas: partícules (fases 1–4) */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, display: "block" }}
      />

      {/* Vídeo: apareix en fase 5 dins del marc de la retícula */}
      <div
        style={{
          position:   "absolute",
          left:       "50%",
          top:        "50%",
          transform:  "translate(-50%, -50%)",
          width:      "min(740px, 68vw)",
          aspectRatio: "16 / 9",
          opacity:    videoOpacity,
          transition: "opacity 0.55s ease",
          overflow:   "hidden",
          pointerEvents: "none",
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        >
          <source src="/intro.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
