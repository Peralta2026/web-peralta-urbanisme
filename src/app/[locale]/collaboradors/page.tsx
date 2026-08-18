"use client";

import { useState } from "react";

interface Collaborator {
  name:        string;
  specialty:   string;
  description: string;
  relation?:   string;
}

const COLLABORADORS: Collaborator[] = [
  {
    name:        "Anna Garcia Arquitectes",
    specialty:   "Arquitectura i rehabilitació",
    description: "Col·laboració en projectes d'habitatge i equipaments, aportant expertesa en la rehabilitació d'edificis existents i en les estratègies de densificació.",
    relation:    "Col·laboració en projectes puntuals des de 2018.",
  },
  {
    name:        "GIS Territori",
    specialty:   "Cartografia i SIG",
    description: "Elaboració de bases cartogràfiques, anàlisis territorials i representació de dades geogràfiques per a processos de planejament.",
    relation:    "Col·laboració continuada en la majoria de projectes des de 2020.",
  },
  {
    name:        "Estudio de Paisaje",
    specialty:   "Paisatgisme i infraestructura verda",
    description: "Disseny d'espais públics, parcs i itineraris verds. Integració de la natura a les propostes urbanes.",
    relation:    "Incorporació en projectes amb component d'espai públic significativa.",
  },
  {
    name:        "Sociolab",
    specialty:   "Sociologia urbana i participació",
    description: "Processos participatius, diagnosi social i facilitació de taules de treball. Recerca aplicada al context urbà.",
    relation:    "Participació en projectes que incorporen processos de participació ciutadana.",
  },
];

function CollaboratorCard({ col, locale }: { col: Collaborator; locale?: string }) {
  const [open, setOpen] = useState(false);
  void locale;

  return (
    <div style={{ borderBottom: "1px solid #e8e8e8", padding: "32px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "32px" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", color: "#000", margin: "0 0 6px" }}>
            {col.name}
          </h3>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#aaa", margin: 0 }}>
            {col.specialty}
          </p>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ background: "none", border: "1px solid #ddd", cursor: "pointer", padding: "6px 14px", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", color: "#666", whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {open ? "Tancar" : "Més informació"}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: "24px", paddingLeft: "0", maxWidth: "620px" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "15px", lineHeight: 1.6, color: "#333", marginBottom: "12px" }}>
            {col.description}
          </p>
          {col.relation && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.04em", color: "#aaa" }}>
              {col.relation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function CollaboradorsPage() {
  return (
    <div style={{ paddingTop: "88px", fontFamily: "var(--font-sans)" }}>
      <div style={{ maxWidth: "1380px", margin: "0 auto" }}>

        <header style={{ padding: "64px 32px 56px", borderBottom: "1px solid #1a1a1a" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa", marginBottom: "16px" }}>
            Estudi · Col·laboradors
          </p>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(36px, 5vw, 72px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.92, color: "#000", margin: 0 }}>
            Xarxa de<br />professionals
          </h1>
        </header>

        <section style={{ padding: "8px 32px 120px" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "16px", lineHeight: 1.6, color: "#666", maxWidth: "580px", padding: "40px 0" }}>
            L&apos;estructura de Peralta Urbanisme combina un equip estable amb una xarxa de professionals especialitzats que s&apos;incorporen segons les necessitats de cada projecte.
          </p>

          {COLLABORADORS.map((col, i) => (
            <CollaboratorCard key={i} col={col} />
          ))}
        </section>
      </div>
    </div>
  );
}
