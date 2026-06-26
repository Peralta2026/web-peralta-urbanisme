"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Timing (ms) ─────────────────────────────────────────────────────────────
const T = {
  P1_END:   750,   // partícules aparegudes
  P2_START: 750,   // comença convergència cap al logo
  P2_END:   2100,  // logo format
  P3_END:   2700,  // pausa logo quiet
  P4_END:   3700,  // malla formada
  VID_END:  4300,  // vídeo visible
  SWEEP:    6400,  // barrida cap amunt
};

// ─── Easing ───────────────────────────────────────────────────────────────────
// easeOutExpo: molt ràpid a l'inici, s'atura suaument → arquitectònic, precís
function easeOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
function prog(t: number, s: number, e: number) {
  return clamp01((t - s) / (e - s));
}

interface Particle {
  sx: number; sy: number; // posició inicial (scatter)
  lx: number; ly: number; // posició logo
  gx: number; gy: number; // posició malla
  delay: number;          // retard d'aparició (0–0.60)
  size:  number;          // costat del quadrat (2–4 px)
  aMax:  number;          // alpha màxim en scatter (0.25–0.75)
}

export default function IntroScreen({ onDone }: { onDone: () => void }) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const logoElemRef = useRef<HTMLImageElement>(null);
  const rafRef      = useRef<number>(0);
  const doneRef     = useRef(false);

  const [sweeping,    setSweeping]    = useState(false);
  const [vidVisible,  setVidVisible]  = useState(false);

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

    // ── prefers-reduced-motion: logo estàtic breu i surt ─────────────────
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const logo = logoElemRef.current;
      if (logo) { logo.style.opacity = "0.95"; }
      sessionStorage.setItem("pu-intro", "1");
      setTimeout(onDone, 1100);
      return;
    }

    const W = window.innerWidth;
    const H = window.innerHeight;

    // ── Canvas DPR: nitidesa perfecta en pantalles retina ─────────────────
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width       = W * DPR;
    canvas.height      = H * DPR;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(DPR, DPR);

    // ── Geometria del logo ─────────────────────────────────────────────────
    // Mida: fins a 400px (proper a natiu 360px per màxima nitidesa)
    const logoW = Math.min(400, Math.max(260, W * 0.44));
    const logoH = logoW * (90 / 360); // el JPG és 360×90
    const logoX = (W - logoW) / 2;
    const logoY = H / 2 - logoH / 2 - 12;

    // Sincronitzar element HTML <img> amb coordenades JS
    const logoEl = logoElemRef.current;
    if (logoEl) {
      logoEl.style.left   = `${logoX}px`;
      logoEl.style.top    = `${logoY}px`;
      logoEl.style.width  = `${logoW}px`;
      logoEl.style.height = `${logoH}px`;
    }

    // ── Geometria del frame (malla / vídeo) ───────────────────────────────
    const frameW = Math.min(740, W * 0.68);
    const frameH = frameW * 0.5625;
    const frameX = (W - frameW) / 2;
    const frameY = (H - frameH) / 2;

    // ── Zona de scatter inicial (concentrada al centre, no aleatòria total) ─
    const scW = W * 0.32;
    const scH = H * 0.26;
    const scX = (W - scW) / 2;
    const scY = (H - scH) / 2;

    // ── Mostreig de píxels foscos del logo ────────────────────────────────
    const sampleLogoPts = (): Promise<{ x: number; y: number }[]> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const tmp  = document.createElement("canvas");
          tmp.width  = img.naturalWidth;
          tmp.height = img.naturalHeight;
          const tCtx = tmp.getContext("2d")!;
          tCtx.drawImage(img, 0, 0);
          const d = tCtx.getImageData(0, 0, tmp.width, tmp.height).data;
          const pts: { x: number; y: number }[] = [];
          const step = 3; // pas de 3px → mostreig dens
          for (let py = 0; py < img.naturalHeight; py += step) {
            for (let px = 0; px < img.naturalWidth; px += step) {
              const idx = (py * img.naturalWidth + px) * 4;
              // Píxel fosc (text negre + anti-aliasing gris)
              if (d[idx] < 130 && d[idx + 1] < 130 && d[idx + 2] < 130) {
                pts.push({
                  x: logoX + (px / img.naturalWidth)  * logoW,
                  y: logoY + (py / img.naturalHeight) * logoH,
                });
              }
            }
          }
          resolve(pts);
        };
        img.onerror = () => {
          // Fallback: distribuir partícules en files (imita text)
          const pts: { x: number; y: number }[] = [];
          [0.25, 0.5, 0.75].forEach((rowFrac) => {
            const y = logoY + rowFrac * logoH;
            for (let j = 0; j < 60; j++) {
              pts.push({ x: logoX + (j / 59) * logoW, y });
            }
          });
          resolve(pts);
        };
        img.src = "/logo.jpg";
      });

    // ── Posicions de malla (malla completa, bordes + interior) ────────────
    const buildGridPts = (N: number): { x: number; y: number }[] => {
      const result: { x: number; y: number }[] = [];
      const jit    = () => (Math.random() - 0.5) * 1.4;
      const vCols  = [0, 1 / 3, 2 / 3, 1];
      const hRows  = [0, 1 / 3, 2 / 3, 1];
      const nLines = vCols.length + hRows.length;
      const ppl    = Math.ceil(N / nLines);

      for (const col of vCols) {
        for (let k = 0; k < ppl; k++) {
          result.push({
            x: frameX + col * frameW + jit(),
            y: frameY + (k / Math.max(ppl - 1, 1)) * frameH + jit(),
          });
        }
      }
      for (const row of hRows) {
        for (let k = 0; k < ppl; k++) {
          result.push({
            x: frameX + (k / Math.max(ppl - 1, 1)) * frameW + jit(),
            y: frameY + row * frameH + jit(),
          });
        }
      }

      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result.slice(0, N);
    };

    // ── Construir partícules ───────────────────────────────────────────────
    const buildParticles = (logoPts: { x: number; y: number }[]): Particle[] => {
      const MAX  = 250;
      const step = Math.max(1, Math.floor(logoPts.length / MAX));
      const lpts = logoPts.filter((_, i) => i % step === 0).slice(0, MAX);
      const N    = lpts.length || MAX;

      const gridPts = buildGridPts(N);

      // Scatter inicial: quadrícula laxa (no caos pur)
      const cols = Math.ceil(Math.sqrt(N * 1.4));
      const rows = Math.ceil(N / cols);

      return lpts.map((lp, i) => ({
        lx: lp.x,
        ly: lp.y,
        gx: gridPts[i]?.x ?? frameX + Math.random() * frameW,
        gy: gridPts[i]?.y ?? frameY + Math.random() * frameH,
        // Scatter: posicions de quadrícula + jitter suau
        sx: scX + ((i % cols) / Math.max(cols - 1, 1)) * scW
          + (Math.random() - 0.5) * (scW / cols) * 2.2,
        sy: scY + (Math.floor(i / cols) / Math.max(rows - 1, 1)) * scH
          + (Math.random() - 0.5) * (scH / rows) * 2.2,
        delay: Math.random() * 0.60,      // aparició escalonada
        size:  2 + Math.random() * 2,     // 2–4 px (quadrats)
        aMax:  0.28 + Math.random() * 0.45,
      }));
    };

    // ── Bucle RAF ─────────────────────────────────────────────────────────
    let particles: Particle[] = [];
    let t0           = 0;
    let videoStarted = false;
    let sweepStarted = false;
    let prevLogoPhase = "";

    const draw = (now: number) => {
      if (doneRef.current) return;
      rafRef.current = requestAnimationFrame(draw);

      const t = now - t0;

      // Fons blanc
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, W, H);

      // ── Opacitat del logo HTML (canviem fase → canviem transition) ───────
      const logoPhase =
        t < T.P2_START ? "hidden"  :
        t < T.P2_END   ? "fadein"  :
        t < T.P3_END   ? "visible" :
        t < T.P4_END   ? "fadeout" : "gone";

      if (logoPhase !== prevLogoPhase) {
        prevLogoPhase = logoPhase;
        const el = logoElemRef.current;
        if (el) {
          if (logoPhase === "fadein") {
            el.style.transition = "opacity 1.25s ease";
            el.style.opacity    = "0.97";
          } else if (logoPhase === "visible") {
            el.style.transition = "none";
            el.style.opacity    = "0.97";
          } else if (logoPhase === "fadeout") {
            el.style.transition = "opacity 0.80s ease";
            el.style.opacity    = "0";
          } else {
            el.style.transition = "none";
            el.style.opacity    = "0";
          }
        }
      }

      // ── Dibuix de partícules (microquadrats negres) ───────────────────
      ctx.fillStyle = "#111";
      for (const p of particles) {
        let x: number, y: number, alpha: number;

        if (t < T.P1_END) {
          // Fase 1: apareixent al lloc del scatter, escalonat
          const a = prog(t, p.delay * T.P1_END, T.P1_END * 0.97);
          alpha   = easeOutExpo(a) * p.aMax;
          x = p.sx; y = p.sy;

        } else if (t < T.P2_END) {
          // Fase 2: moviment cap al logo — easeOutExpo (ràpid→suau aterratge)
          const e = easeOutExpo(prog(t, T.P2_START, T.P2_END));
          x     = lerp(p.sx, p.lx, e);
          y     = lerp(p.sy, p.ly, e);
          // Alpha baixa suaument: el logo img pren protagonisme
          alpha = lerp(p.aMax, 0.18, prog(t, T.P2_START, T.P2_END));

        } else if (t < T.P3_END) {
          // Fase 3: quiets al logo, molt subtils (logo img és l'element visible)
          x     = p.lx; y = p.ly;
          alpha = 0.15;

        } else if (t < T.P4_END) {
          // Fase 4: moviment cap a la malla
          const e = easeOutExpo(prog(t, T.P3_END, T.P4_END));
          x     = lerp(p.lx, p.gx, e);
          y     = lerp(p.ly, p.gy, e);
          alpha = lerp(0.15, 0.78, prog(t, T.P3_END, T.P4_END));

        } else {
          // Fase 5: desaparèixer mentre apareix el vídeo
          x     = p.gx; y = p.gy;
          alpha = clamp01(1 - prog(t, T.P4_END, T.VID_END)) * 0.60;
        }

        if (alpha < 0.01) continue;
        ctx.globalAlpha = alpha;
        const s = p.size;
        // Arrodonit a px sencer per contorns més nets
        ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), Math.round(s), Math.round(s));
      }

      // ── Línies de malla (canvas, fase 4 → s'esvaeixen) ───────────────
      if (t > T.P3_END && t < T.VID_END) {
        const build   = easeOutExpo(prog(t, T.P3_END, T.P4_END));
        const fadeOut = t > T.P4_END ? clamp01(1 - prog(t, T.P4_END, T.VID_END)) : 1;
        const a       = build * 0.09 * fadeOut;
        if (a > 0.003) {
          ctx.globalAlpha = a;
          ctx.strokeStyle = "#000";
          ctx.lineWidth   = 0.7;
          for (const col of [0, 1 / 3, 2 / 3, 1]) {
            ctx.beginPath();
            ctx.moveTo(frameX + col * frameW, frameY);
            ctx.lineTo(frameX + col * frameW, frameY + frameH);
            ctx.stroke();
          }
          for (const row of [0, 1 / 3, 2 / 3, 1]) {
            ctx.beginPath();
            ctx.moveTo(frameX,           frameY + row * frameH);
            ctx.lineTo(frameX + frameW, frameY + row * frameH);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;

      // ── Trigger: vídeo ────────────────────────────────────────────────
      if (t >= T.P4_END && !videoStarted) {
        videoStarted = true;
        setVidVisible(true);
        videoRef.current?.play().catch(() => {});
      }

      // ── Trigger: barrida final ────────────────────────────────────────
      if (t >= T.SWEEP && !sweepStarted) {
        sweepStarted = true;
        sweep();
      }
    };

    // Iniciar
    sampleLogoPts().then((pts) => {
      particles      = buildParticles(pts);
      t0             = performance.now();
      rafRef.current = requestAnimationFrame(draw);
    });

    // Skip (click / tecla / scroll / touch) — bloquejat primer 600ms
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
        background: "#ffffff",
        overflow:   "hidden",
        transform:  sweeping ? "translateY(-100%)" : "translateY(0)",
        transition: sweeping
          ? "transform 0.88s cubic-bezier(0.76, 0, 0.18, 1)"
          : "none",
        willChange: "transform",
      }}
    >
      {/* Canvas: partícules + malla */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, display: "block" }}
      />

      {/*
        Logo HTML: sempre al DOM, opacitat 0 → controlada des del RAF.
        Es mostra com a element HTML (no drawImage) per màxima nitidesa.
        Posició i mida s'assignen via JS per sincronitzar amb les partícules.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={logoElemRef}
        src="/logo.jpg"
        alt="Peralta Urbanisme"
        draggable={false}
        style={{
          position:      "absolute",
          display:       "block",
          opacity:       0,
          pointerEvents: "none",
          userSelect:    "none",
        }}
      />

      {/* Vídeo: apareix quan la malla és formada */}
      <div
        style={{
          position:      "absolute",
          left:          "50%",
          top:           "50%",
          transform:     "translate(-50%, -50%)",
          width:         "min(740px, 68vw)",
          aspectRatio:   "16 / 9",
          background:    "#ffffff",
          overflow:      "hidden",
          opacity:       vidVisible ? 1 : 0,
          transition:    vidVisible ? "opacity 0.60s ease" : "none",
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
            objectFit:  "contain",
            display:    "block",
            background: "#ffffff",
          }}
        >
          <source src="/intro.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
