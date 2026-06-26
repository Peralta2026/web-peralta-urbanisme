"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// ssr: false — el canvas necessita window/document (no existeix al servidor)
const IntroScreen = dynamic(() => import("./IntroScreen"), { ssr: false });

export default function IntroWrapper({ children }: { children: React.ReactNode }) {
  // Comença en true: assumim que cal mostrar la intro.
  // El guard div del layout (z-9998) impedeix veure el contingut mentre JS carrega.
  // useEffect decideix: si ja s'ha vist, treu el guard ràpid; si no, deixa muntar IntroScreen.
  const [show, setShow] = useState(true);

  // Bloqueig de scroll mentre la intro és activa
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  useEffect(() => {
    const guard = document.getElementById("pu-guard");

    if (sessionStorage.getItem("pu-intro") === "1") {
      // Ja s'ha vist: treu el guard amb un fade ràpid i salta la intro
      setShow(false);
      if (guard) {
        guard.style.transition = "opacity 0.18s ease";
        guard.style.opacity    = "0";
        setTimeout(() => guard.remove(), 220);
      }
    }
    // Si no s'ha vist: no fem res.
    // IntroScreen es muntarà a z-9999, per sobre del guard (z-9998).
    // El guard s'esborrarà quan cridi handleDone.
  }, []);

  const handleDone = () => {
    document.getElementById("pu-guard")?.remove();
    setShow(false);
  };

  return (
    <>
      {show && <IntroScreen onDone={handleDone} />}
      {children}
    </>
  );
}
