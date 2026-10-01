"use client";

import { useEffect, useState } from "react";

const ACCENTS = ["var(--accent-yellow)", "var(--accent-green)", "var(--accent-blue)", "var(--accent-pink)"];

/* Secció pintada amb un color de la paleta de l'estudi, diferent a cada visita
   (com 'Parlem del vostre projecte' a la home i el diagrama de Mètode) */
export default function AccentSection({ className, children }: { className?: string; children: React.ReactNode }) {
  const [accent, setAccent] = useState(ACCENTS[0]);
  useEffect(() => { setAccent(ACCENTS[Math.floor(Math.random() * ACCENTS.length)]); }, []);
  return (
    <section className={className} style={{ ["--accent" as string]: accent }}>
      {children}
    </section>
  );
}
