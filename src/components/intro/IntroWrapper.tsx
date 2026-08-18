"use client";

import { useEffect, useState } from "react";

const LAYERS = [
  "/intro/1.png",
  "/intro/2.png",
  "/intro/3.png",
  "/intro/4.png",
  "/intro/5.png",
  "/intro/6.png",
  "/intro/7.png",
  "/intro/8.png",
  "/intro/9.png",
];

const STAGGER_MS   = 80;
const HOLD_MS      = 380;
const CURTAIN_MS   = 1350;
const CURTAIN_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

export default function IntroWrapper({ children }: { children: React.ReactNode }) {
  const [visible,   setVisible]   = useState<number[]>([]);
  const [curtainUp, setCurtainUp] = useState(false);
  const [done,      setDone]      = useState(false);

  useEffect(() => {
    const guard = document.getElementById("pu-guard");

    if (sessionStorage.getItem("pu-intro") === "1") {
      guard?.remove();
      setDone(true);
      return;
    }

    document.body.style.overflow = "hidden";

    const timers: ReturnType<typeof setTimeout>[] = [];

    LAYERS.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisible((v) => [...v, i]), i * STAGGER_MS)
      );
    });

    const curtainAt = LAYERS.length * STAGGER_MS + HOLD_MS;

    timers.push(setTimeout(() => setCurtainUp(true), curtainAt));

    timers.push(
      setTimeout(() => {
        document.body.style.overflow = "";
        guard?.remove();
        sessionStorage.setItem("pu-intro", "1");
        setDone(true);
      }, curtainAt + CURTAIN_MS + 60)
    );

    return () => {
      timers.forEach(clearTimeout);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      {!done && (
        <div
          style={{
            position:       "fixed",
            inset:          0,
            zIndex:         9999,
            background:     "#000000",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            transform:      curtainUp ? "translateY(-100%)" : "translateY(0)",
            transition:     curtainUp
              ? `transform ${CURTAIN_MS}ms ${CURTAIN_EASE}`
              : "none",
          }}
        >
          <div
            style={{
              position:        "relative",
              width:           "clamp(110px, 18vw, 240px)",
              aspectRatio:     "3 / 1",
              transformOrigin: "center center",
              transform:       curtainUp
                ? "scale(0.93) translateY(-16px)"
                : "scale(1) translateY(0)",
              transition:      curtainUp
                ? `transform ${Math.round(CURTAIN_MS * 0.68)}ms ${CURTAIN_EASE}`
                : "none",
            }}
          >
            {LAYERS.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                aria-hidden
                style={{
                  position:   "absolute",
                  inset:      0,
                  width:      "100%",
                  height:     "100%",
                  objectFit:  "contain",
                  opacity:    visible.includes(i) ? 1 : 0,
                  transition: "opacity 180ms ease",
                }}
              />
            ))}
          </div>
        </div>
      )}
      {children}
    </>
  );
}
