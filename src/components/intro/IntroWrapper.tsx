"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Càrrega dinàmica (sense SSR): el canvas necessita window/document
const IntroScreen = dynamic(() => import("./IntroScreen"), { ssr: false });

export default function IntroWrapper({ children }: { children: React.ReactNode }) {
  // "pending" = no s'ha comprovat sessionStorage encara (espera JS)
  // "show"    = primera visita, mostrar intro
  // "done"    = ja s'ha vist, no mostrar
  const [state, setState] = useState<"pending" | "show" | "done">("pending");

  useEffect(() => {
    setState(sessionStorage.getItem("pu-intro") === "1" ? "done" : "show");
  }, []);

  return (
    <>
      {state === "show" && (
        <IntroScreen onDone={() => setState("done")} />
      )}
      {children}
    </>
  );
}
