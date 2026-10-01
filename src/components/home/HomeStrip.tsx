"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import strip from "../../../content/strip.json";

type StripItem = { slug: string; src: string; w: number; h: number };

const ITEMS = strip as StripItem[];
const BASE_SPEED  = 26;
const SCROLL_GAIN = 0.35;
const FRICTION    = 3.2;

function StripImage({ item, locale }: { item: StripItem; locale: string }) {
  return (
    <Link
      href={`/${locale}/projectes/${item.slug}`}
      className="pu-strip-item"
      style={{ aspectRatio: `${item.w} / ${item.h}` }}
      draggable={false}
      tabIndex={-1}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.src} alt="" loading="lazy" draggable={false} />
    </Link>
  );
}

/**
 * Franja contínua d'imatges de projecte. Deriva sola, s'accelera amb el scroll
 * de la pàgina, es pot arrossegar amb inèrcia i la imatge que creua el centre
 * recupera el color.
 */
export default function HomeStrip({ locale }: { locale: string }) {
  const rootRef  = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);

  useEffect(() => {
    const root  = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items   = Array.from(track.children) as HTMLElement[];
    let setW = track.scrollWidth / 2;
    let x = 0;
    let v = 0;
    let visible = false;
    let raf = 0;
    let last = performance.now();
    let lastScroll = window.scrollY;
    let focus: HTMLElement | null = null;

    let dragging = false;
    let startX = 0;
    let prevX = 0;
    let prevT = 0;

    const wrap = () => {
      if (setW <= 0) return;
      x = ((x % setW) + setW) % setW;
    };

    const updateFocus = () => {
      const cx = root.getBoundingClientRect().left + root.clientWidth / 2;
      let next: HTMLElement | null = null;
      for (const el of items) {
        const r = el.getBoundingClientRect();
        if (r.left <= cx && r.right > cx) { next = el; break; }
      }
      if (next !== focus) {
        focus?.classList.remove("is-focus");
        next?.classList.add("is-focus");
        focus = next;
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!dragging) {
        const target = reduced ? 0 : BASE_SPEED;
        v += (target - v) * Math.min(1, FRICTION * dt);
        x += v * dt;
      }
      wrap();
      track.style.transform = `translate3d(${(-x).toFixed(2)}px,0,0)`;
      updateFocus();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(root);

    const onScroll = () => {
      const y = window.scrollY;
      if (visible && !dragging && !reduced) v += (y - lastScroll) * SCROLL_GAIN;
      lastScroll = y;
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      draggedRef.current = false;
      startX = prevX = e.clientX;
      prevT = performance.now();
      v = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      if (!draggedRef.current && Math.abs(e.clientX - startX) > 6) {
        draggedRef.current = true;
        root.setPointerCapture(e.pointerId);
        root.classList.add("is-dragging");
      }
      const now = performance.now();
      const dx  = e.clientX - prevX;
      x -= dx;
      const dts = Math.max(0.001, (now - prevT) / 1000);
      v = v * 0.6 + (-dx / dts) * 0.4;
      prevX = e.clientX;
      prevT = now;
      if (!visible) { wrap(); track.style.transform = `translate3d(${(-x).toFixed(2)}px,0,0)`; }
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      root.classList.remove("is-dragging");
      if (performance.now() - prevT > 80) v = 0;
    };
    const onClick = (e: MouseEvent) => {
      if (draggedRef.current) { e.preventDefault(); e.stopPropagation(); }
    };
    const onResize = () => { setW = track.scrollWidth / 2; };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    root.addEventListener("click", onClick, true);
    track.querySelectorAll("img").forEach((img) => img.addEventListener("load", onResize, { once: true }));

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <div ref={rootRef} className="pu-strip" aria-hidden="true">
      <div ref={trackRef} className="pu-strip-track">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <StripImage key={`${item.slug}-${i}`} item={item} locale={locale} />
        ))}
      </div>
      <style>{`
        .pu-strip {
          position: relative;
          overflow: hidden;
          height: clamp(132px, 17vh, 196px);
          border-top: 1px solid var(--color-border);
          background: var(--color-bg);
          cursor: grab;
          touch-action: pan-y;
          user-select: none;
          -webkit-user-select: none;
        }
        .pu-strip.is-dragging { cursor: grabbing; }
        .pu-strip-track {
          display: flex;
          height: 100%;
          width: max-content;
          will-change: transform;
        }
        .pu-strip-item {
          display: block;
          height: 100%;
          flex-shrink: 0;
          overflow: hidden;
          background: var(--color-gray-light);
        }
        .pu-strip-item img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(1) contrast(1.04);
          transition: filter 600ms ease;
          pointer-events: none;
        }
        .pu-strip-item.is-focus img { filter: grayscale(0) saturate(1.2); }
        @media (hover: hover) {
          .pu-strip:not(.is-dragging) .pu-strip-item:hover img { filter: grayscale(0) saturate(1.2); transition-duration: 200ms; }
        }
        @media (max-width: 768px) {
          .pu-strip { height: 124px; }
        }
      `}</style>
    </div>
  );
}
