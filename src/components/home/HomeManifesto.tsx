"use client";

import { useEffect, useRef } from "react";
import PencilEgg from "@/components/layout/PencilEgg";

type Loc = "ca" | "es" | "en";

const COPY: Record<Loc, { statement: [string, string]; places: string[]; note: string }> = {
  ca: {
    statement: ["Una web en", "transformació constant."],
    places: ["Com els projectes,", "com els llocs,", "com les ciutats."],
    note: "Aquesta web està pensada per recórrer-la, mirar-la i, de tant en tant, tocar-la.",
  },
  es: {
    statement: ["Una web en", "transformación constante."],
    places: ["Como los proyectos,", "como los lugares,", "como las ciudades."],
    note: "Esta web está pensada para recorrerla, mirarla y, de vez en cuando, tocarla.",
  },
  en: {
    statement: ["A website in", "constant transformation."],
    places: ["Like projects,", "like places,", "like cities."],
    note: "This website is meant to be wandered through, looked at and, now and then, touched.",
  },
};

/**
 * Final de la home: no és una secció, és el pas cap al peu negre.
 * Afirmació gran a l'esquerra, nota desplaçada a la dreta i, gairebé
 * perdut a sota, el traç del llapis (l'easter egg).
 */
export default function HomeManifesto({ locale }: { locale: string }) {
  const loc: Loc = locale === "es" || locale === "en" ? locale : "ca";
  const t = COPY[loc];
  const ref = useRef<HTMLElement>(null);

  // Quan el negre arriba a dalt, la franja blanca del logo es retira i el "+" s'inverteix
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      document.body.classList.toggle("pu-dark-end", el.getBoundingClientRect().top <= 30);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.body.classList.remove("pu-dark-end");
    };
  }, []);

  return (
    <>
      <div className="pu-mf-air" aria-hidden="true" />
      <section ref={ref} className="pu-mf">
        <p className="pu-mf-statement">
          {t.statement[0]}<br />{t.statement[1]}
        </p>
        <div className="pu-mf-note">
          <p className="pu-mf-places">
            {t.places.map((line, i) => (
              <span key={i}>{line}{i < t.places.length - 1 && <br />}</span>
            ))}
          </p>
          <p className="pu-mf-text">{t.note}</p>
          <div className="pu-mf-egg">
            <PencilEgg locale={locale} />
          </div>
        </div>

        <style>{`
          .pu-hero-band, .pu-home-logo > *, .pu-hm-band { transition: opacity 400ms ease; }
          body.pu-dark-end .pu-hero-band,
          body.pu-dark-end .pu-home-logo > *,
          body.pu-dark-end .pu-hm-band { opacity: 0 !important; pointer-events: none !important; }
          body.pu-dark-end .pu-hm-band * { pointer-events: none !important; }
          .pu-profile-trigger span { transition: transform var(--dur-mid) var(--ease-smooth), background 300ms ease, color 300ms ease, border-color 300ms ease; }
          body.pu-dark-end .pu-profile-trigger:not(.is-open) span { background: #fff; color: #000; border-color: #fff; }
          .pu-mf-air { height: clamp(96px, 18vh, 200px); background: var(--color-bg); }
          .pu-mf {
            display: grid;
            grid-template-columns: repeat(12, minmax(0, 1fr));
            column-gap: clamp(16px, 2vw, 32px);
            padding: clamp(96px, 16vh, 180px) var(--margin-page) clamp(40px, 8vh, 96px);
            background: #0a0a0a;
            color: #fff;
            font-family: var(--font-sans);
            -webkit-font-smoothing: antialiased;
          }
          .pu-mf-statement {
            grid-column: 1 / span 9;
            margin: 0;
            font-size: clamp(44px, 6.2vw, 104px);
            font-weight: 700;
            letter-spacing: -0.045em;
            line-height: 0.98;
            color: #fff;
          }
          .pu-mf-note {
            grid-column: 8 / span 4;
            margin-top: clamp(56px, 10vh, 120px);
            display: flex;
            flex-direction: column;
          }
          .pu-mf-places,
          .pu-mf-text {
            margin: 0;
            font-size: clamp(17px, 1.45vw, 22px);
            line-height: 1.35;
            letter-spacing: -0.01em;
          }
          .pu-mf-places { color: rgba(255,255,255,0.9); }
          .pu-mf-text { margin-top: 1.3em; color: rgba(255,255,255,0.55); max-width: 22em; }
          .pu-mf-egg { margin-top: clamp(80px, 14vh, 160px); }

          @media (max-width: 900px) {
            .pu-mf { display: block; padding: 88px var(--margin-page) 24px; }
            .pu-mf-statement { font-size: clamp(38px, 11vw, 56px); }
            .pu-mf-note { margin-top: 56px; }
            .pu-mf-text { margin-top: 28px; }
            .pu-mf-egg { margin-top: 96px; }
          }
        `}</style>
      </section>
    </>
  );
}
