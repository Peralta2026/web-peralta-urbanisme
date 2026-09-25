"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        className="pu-scroll-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Tornar a dalt"
      >
        ↑
      </button>
      <style>{`
        .pu-scroll-top {
          position: fixed;
          bottom: 32px;
          right: var(--margin-page, 48px);
          z-index: 500;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.18);
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          color: #111;
          font-family: var(--font-mono);
          font-size: 14px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.10);
          transition: background 180ms ease, transform 180ms ease, opacity 220ms ease;
          animation: pu-scroll-top-in 220ms ease both;
        }
        .pu-scroll-top:hover {
          background: #111;
          color: #fff;
          transform: translateY(-2px);
        }
        @keyframes pu-scroll-top-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .pu-scroll-top { bottom: 20px; right: 16px; }
        }
      `}</style>
    </>
  );
}
