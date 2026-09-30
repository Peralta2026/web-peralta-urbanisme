"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // After the home intro is done the scroll offset shifts; use a lower
      // threshold so the button still appears when cards are first visible.
      // Before intro is done the threshold is high enough that the button
      // never appears while the "Mapa" nav-link is still on screen.
      const introDone = sessionStorage.getItem("pu-intro-done") === "1";
      setVisible(window.scrollY > (introDone ? 410 : 900));
    };
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
        <span aria-hidden="true">↑</span>
      </button>
      <style>{`
        .pu-scroll-top {
          position: fixed;
          bottom: 14px;
          left: var(--margin-page, 48px);
          z-index: 500;
          width: 22px;
          height: 22px;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pu-scroll-top-in 220ms ease both;
        }
        .pu-scroll-top span {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border: 1px solid #000;
          border-radius: 50%;
          background: #000;
          color: #fff;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 300;
          line-height: 1;
          transition: transform var(--dur-mid, 200ms) ease, background 180ms ease;
          user-select: none;
          padding-bottom: 1px;
        }
        .pu-scroll-top:hover span { transform: scale(0.82); }
        @keyframes pu-scroll-top-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .pu-scroll-top {
            bottom: 14px;
            left: var(--margin-mobile, 20px);
          }
        }
      `}</style>
    </>
  );
}
