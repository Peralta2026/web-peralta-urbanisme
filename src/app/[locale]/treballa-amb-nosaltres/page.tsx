"use client";

import { useState, useRef } from "react";
import Link from "next/link";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      fontFamily:    "var(--font-mono)",
      fontSize:      "9px",
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color:         "#aaa",
      display:       "block",
      marginBottom:  "8px",
    }}>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  display:       "block",
  width:         "100%",
  padding:       "12px 0",
  fontFamily:    "var(--font-sans)",
  fontSize:      "15px",
  fontWeight:    400,
  color:         "#000",
  background:    "transparent",
  border:        "none",
  borderBottom:  "1px solid rgba(0,0,0,0.18)",
  outline:       "none",
  boxSizing:     "border-box",
  transition:    "border-color 200ms ease",
  borderRadius:  "0",
};

export default function TreballaPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    setStatus("sending");
    try {
      const formData = new FormData(formRef.current);
      const res = await fetch("/", {
        method: "POST",
        body:   formData,
      });
      if (res.ok) {
        setStatus("sent");
        formRef.current.reset();
        setFileName("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div style={{ paddingTop: "88px", fontFamily: "var(--font-sans)" }}>

      {/* ── Capçalera estàndard ─────────────────────────────────────────── */}
      <header style={{
        paddingTop:    "clamp(36px,5vh,64px)",
        paddingBottom: "clamp(24px,3.5vh,44px)",
        paddingLeft:   "var(--margin-page)",
        paddingRight:  "var(--margin-page)",
        borderBottom:  "1px solid #1a1a1a",
      }}>
        <h1 style={{
          fontFamily:    "var(--font-sans)",
          fontWeight:    700,
          fontSize:      "clamp(32px,4vw,60px)",
          letterSpacing: "-0.04em",
          lineHeight:    1,
          color:         "#000",
          margin:        0,
        }}>
          Treballa amb nosaltres
        </h1>
      </header>

      {/* ── Contingut ───────────────────────────────────────────────────── */}
      <div className="pu-treballa-grid">

        {/* ── Columna esquerra: intro ─────────────────────────────────── */}
        <div className="pu-treballa-left">
          <div className="pu-treballa-block">
            <p className="pu-treballa-label">Qui busquem</p>
            <p className="pu-treballa-text">
              Busquem persones amb formació en arquitectura, urbanisme o disciplines afins,
              amb ganes d&apos;implicar-se en projectes de planejament i estratègia urbana.
            </p>
            <p className="pu-treballa-text" style={{ color: "#777", marginTop: "12px" }}>
              Si comparteixes la nostra manera d&apos;entendre la feina — rigor, creativitat
              i compromís amb el territori — escriu-nos.
            </p>
          </div>

          <div className="pu-treballa-block">
            <p className="pu-treballa-label">Contacte</p>
            <a href="mailto:info@peraltaurbanisme.com" className="pu-treballa-email">
              info@peraltaurbanisme.com
            </a>
          </div>

          <div className="pu-treballa-block">
            <Link href="./contacte" className="pu-back-link">
              ← Pàgina de contacte general
            </Link>
          </div>
        </div>

        {/* ── Columna dreta: formulari ────────────────────────────────── */}
        <div className="pu-treballa-form-col">
          {status === "sent" ? (
            <div className="pu-form-success">
              <p className="pu-form-success-head">Missatge enviat</p>
              <p className="pu-form-success-body">
                Hem rebut la teva candidatura. Ens posarem en contacte si el perfil
                s&apos;ajusta a les nostres necessitats actuals.
              </p>
              <button
                className="pu-form-reset"
                onClick={() => setStatus("idle")}
              >
                Enviar una altra candidatura
              </button>
            </div>
          ) : (
            <form
              ref={formRef}
              name="treballa-amb-nosaltres"
              method="POST"
              encType="multipart/form-data"
              data-netlify="true"
              onSubmit={handleSubmit}
              noValidate
            >
              <input type="hidden" name="form-name" value="treballa-amb-nosaltres" />

              <div className="pu-form-fields">

                {/* Nom */}
                <div className="pu-form-field">
                  <FieldLabel>Nom complet *</FieldLabel>
                  <input name="nom" type="text" required placeholder="El teu nom" style={inputStyle} className="pu-input" />
                </div>

                {/* Email */}
                <div className="pu-form-field">
                  <FieldLabel>Correu electrònic *</FieldLabel>
                  <input name="email" type="email" required placeholder="nom@exemple.com" style={inputStyle} className="pu-input" />
                </div>

                {/* Telèfon */}
                <div className="pu-form-field">
                  <FieldLabel>Telèfon (opcional)</FieldLabel>
                  <input name="telefon" type="tel" placeholder="+34 600 000 000" style={inputStyle} className="pu-input" />
                </div>

                {/* Motivació */}
                <div className="pu-form-field" style={{ gridColumn: "1 / -1" }}>
                  <FieldLabel>Motivació / Carta de presentació *</FieldLabel>
                  <textarea
                    name="motivacio"
                    required
                    rows={5}
                    placeholder="Explica'ns qui ets, quina és la teva experiència i per què t'interessa Peralta Urbanisme..."
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                    className="pu-input"
                  />
                </div>

                {/* CV / Portafoli */}
                <div className="pu-form-field" style={{ gridColumn: "1 / -1" }}>
                  <FieldLabel>CV o Portafoli (PDF, màx. 10 MB)</FieldLabel>
                  <label className="pu-file-label">
                    <input
                      name="arxiu"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.zip"
                      style={{ display: "none" }}
                      onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                    />
                    <span className="pu-file-btn">
                      {fileName ? fileName : "Adjuntar arxiu →"}
                    </span>
                  </label>
                  {fileName && (
                    <button
                      type="button"
                      className="pu-file-clear"
                      onClick={() => {
                        setFileName("");
                        const input = formRef.current?.querySelector<HTMLInputElement>('input[name="arxiu"]');
                        if (input) input.value = "";
                      }}
                    >
                      Eliminar arxiu
                    </button>
                  )}
                </div>

              </div>

              {status === "error" && (
                <p style={{ color: "#c00", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.06em", marginBottom: "16px" }}>
                  Hi ha hagut un error. Prova-ho de nou o escriu-nos directament per correu.
                </p>
              )}

              <button type="submit" className="pu-submit-btn" disabled={status === "sending"}>
                {status === "sending" ? "Enviant..." : "Enviar candidatura"}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .pu-treballa-grid {
          display: grid;
          grid-template-columns: 5fr 7fr;
          align-items: start;
          border-bottom: 1px solid #1a1a1a;
        }
        .pu-treballa-left {
          display: flex;
          flex-direction: column;
          padding: clamp(36px,5vh,64px) var(--margin-page);
          gap: 36px;
        }
        .pu-treballa-block {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pu-treballa-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #aaa;
          margin: 0;
        }
        .pu-treballa-text {
          font-family: var(--font-sans);
          font-size: 14px;
          line-height: 1.7;
          color: #333;
          margin: 0;
        }
        .pu-treballa-email {
          font-family: var(--font-sans);
          font-size: clamp(13px, 1.3vw, 18px);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #000;
          text-decoration: none;
          transition: opacity 200ms ease;
        }
        .pu-treballa-email:hover { opacity: 0.5; }
        .pu-back-link {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #aaa;
          text-decoration: none;
          transition: color 200ms ease;
        }
        .pu-back-link:hover { color: #000; }

        /* Formulari */
        .pu-treballa-form-col {
          padding: clamp(36px,5vh,64px) var(--margin-page) clamp(36px,5vh,64px);
          border-left: 1px solid #1a1a1a;
        }
        .pu-form-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px 40px;
          margin-bottom: 32px;
        }
        .pu-form-field { display: flex; flex-direction: column; }
        .pu-input:focus { border-bottom-color: #000; }
        .pu-file-label { cursor: pointer; display: block; }
        .pu-file-btn {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: #000;
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
          transition: opacity 200ms ease;
        }
        .pu-file-btn:hover { opacity: 0.55; }
        .pu-file-clear {
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-mono);
          font-size: 8px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #aaa;
          padding: 0;
          margin-top: 6px;
          transition: color 180ms ease;
        }
        .pu-file-clear:hover { color: #000; }
        .pu-submit-btn {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #fff;
          background: #000;
          border: 1px solid #000;
          padding: 14px 32px;
          cursor: pointer;
          transition: background 180ms ease, color 180ms ease;
        }
        .pu-submit-btn:hover:not(:disabled) { background: #333; }
        .pu-submit-btn:disabled { opacity: 0.5; cursor: default; }

        /* Èxit */
        .pu-form-success {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 40px 0;
        }
        .pu-form-success-head {
          font-family: var(--font-sans);
          font-size: clamp(20px,2.2vw,30px);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #000;
          margin: 0;
        }
        .pu-form-success-body {
          font-family: var(--font-sans);
          font-size: 14px;
          line-height: 1.7;
          color: #555;
          margin: 0;
          max-width: 400px;
        }
        .pu-form-reset {
          background: none;
          border: none;
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: #aaa;
          cursor: pointer;
          padding: 0;
          text-align: left;
          transition: color 180ms ease;
        }
        .pu-form-reset:hover { color: #000; }

        @media (max-width: 860px) {
          .pu-treballa-grid { grid-template-columns: 1fr; }
          .pu-treballa-form-col { border-left: none; border-top: 1px solid #1a1a1a; }
          .pu-form-fields { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .pu-form-fields { gap: 24px; }
        }
      `}</style>
    </div>
  );
}
