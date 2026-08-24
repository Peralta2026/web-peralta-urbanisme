"use client";

import { useEffect, useState } from "react";

const HOLD_MS      = 420;
const CURTAIN_MS   = 1350;
const CURTAIN_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

export default function IntroWrapper({ children }: { children: React.ReactNode }) {
  const [mounted,   setMounted]   = useState(false);
  const [curtainUp, setCurtainUp] = useState(false);
  const [done,      setDone]      = useState(false);

  useEffect(() => {
    setMounted(true);

    if (sessionStorage.getItem("pu-intro") === "1") {
      setDone(true);
      return;
    }

    document.body.style.overflow = "hidden";

    const t1 = setTimeout(() => setCurtainUp(true), HOLD_MS);
    const t2 = setTimeout(() => {
      document.body.style.overflow = "";
      sessionStorage.setItem("pu-intro", "1");
      setDone(true);
    }, HOLD_MS + CURTAIN_MS + 60);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      {mounted && !done && (
        <div
          style={{
            position:   "fixed",
            inset:      0,
            zIndex:     9999,
            background: "#000000",
            transform:  curtainUp ? "translateY(-100%)" : "translateY(0)",
            transition: curtainUp
              ? `transform ${CURTAIN_MS}ms ${CURTAIN_EASE}`
              : "none",
          }}
        />
      )}
      {children}
    </>
  );
}
