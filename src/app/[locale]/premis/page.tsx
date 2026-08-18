"use client";

import { useState } from "react";

interface Award {
  year:     string;
  title:    string;
  project:  string;
  entity:   string;
  detail?:  string;
}

const AWARDS: Award[] = [
  {
    year:    "2023",
    title:   "Premi Catalunya d'Urbanisme",
    project: "Pla de Millora Urbana, Sant Just Desvern",
    entity:  "Generalitat de Catalunya · Departament de Territori",
    detail:  "Reconeixement al planejament urbanístic d'excel·lència en l'àmbit municipal. El projecte va rebre una menció especial per la seva integració paisatgística i la qualitat de la diagnosi participativa.",
  },
  {
    year:    "2022",
    title:   "Accèssit Concurs Internacional",
    project: "Estudi de Regeneració Urbana, Granollers",
    entity:  "Ajuntament de Granollers · Col·legi d'Arquitectes",
    detail:  "Segon lloc en concurs obert de propostes per a la regeneració del centre històric. La proposta va destacar per la seva estratègia de densificació sostenible.",
  },
  {
    year:    "2021",
    title:   "Menció BIMSA",
    project: "Alta Costura Besòs",
    entity:  "Barcelona d'Infraestructures Municipals",
    detail:  "Menció al millor document de planejament derivat en el marc del concurs Alta Costura Besòs, per la qualitat de la redacció tècnica i la coherència de les propostes amb el context existent.",
  },
];

function AwardRow({ award }: { award: Award }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: "1px solid #e8e8e8" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: "grid", gridTemplateColumns: "64px 1fr 220px 28px", gap: "0 24px", width: "100%", padding: "20px 0", background: "none", border: "none", cursor: "pointer", alignItems: "center", textAlign: "left" }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#aaa", letterSpacing: "0.04em" }}>
          {award.year}
        </span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "16px", fontWeight: 600, color: "#000", letterSpacing: "-0.01em" }}>
          {award.title}
        </span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "#666" }}>
          {award.project}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "#aaa", textAlign: "center" }}>
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 96px 28px 88px" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "#aaa", marginBottom: "10px", fontWeight: 500 }}>
            {award.entity}
          </p>
          {award.detail && (
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "15px", lineHeight: 1.6, color: "#333", maxWidth: "680px" }}>
              {award.detail}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function PremisPage() {
  return (
    <div style={{ paddingTop: "88px", fontFamily: "var(--font-sans)" }}>
      <div style={{ maxWidth: "1380px", margin: "0 auto" }}>

        <header style={{ padding: "64px 32px 56px", borderBottom: "1px solid #1a1a1a" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa", marginBottom: "16px" }}>
            Estudi · Premis
          </p>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(36px, 5vw, 72px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.92, color: "#000", margin: 0 }}>
            Reconeixements
          </h1>
        </header>

        <section style={{ padding: "48px 32px 120px" }}>
          {/* Capçalera columnes */}
          <div style={{ display: "grid", gridTemplateColumns: "64px 1fr 220px 28px", gap: "0 24px", padding: "0 0 14px", borderBottom: "1px solid #e8e8e8", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#bbb" }}>
            <span>Any</span>
            <span>Premi</span>
            <span>Projecte</span>
            <span />
          </div>

          {AWARDS.map((award, i) => (
            <AwardRow key={i} award={award} />
          ))}
        </section>
      </div>
    </div>
  );
}
