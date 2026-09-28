import Link from "next/link";
import type { NewsCategory, NewsItem } from "@/lib/types";

type Loc = "ca" | "es" | "en";

export const CATEGORY_LABELS: Record<Loc, Record<NewsCategory, string>> = {
  ca: { esdeveniment: "Esdeveniment", concurs: "Concurs", aprovacio: "Aprovació", participacio: "Participació", premsa: "Premsa", premi: "Premi", equip: "Equip" },
  es: { esdeveniment: "Evento", concurs: "Concurso", aprovacio: "Aprobación", participacio: "Participación", premsa: "Prensa", premi: "Premio", equip: "Equipo" },
  en: { esdeveniment: "Event", concurs: "Competition", aprovacio: "Approval", participacio: "Participation", premsa: "Press", premi: "Award", equip: "Studio" },
};

export const NEWS_LABELS: Record<Loc, { title: string; all: string; back: string; source: string; related: string; credits: string }> = {
  ca: { title: "Notícies", all: "Totes les notícies", back: "Totes les notícies", source: "Publicat a", related: "Projectes relacionats", credits: "Equip" },
  es: { title: "Noticias", all: "Todas las noticias", back: "Todas las noticias", source: "Publicado en", related: "Proyectos relacionados", credits: "Equipo" },
  en: { title: "News", all: "All news", back: "All news", source: "Published on", related: "Related projects", credits: "Team" },
};

export function toLoc(locale: string): Loc {
  return locale === "es" || locale === "en" ? locale : "ca";
}

const MONTHS: Record<Loc, string[]> = {
  ca: ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"],
  es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

/** "2026-05" → "Maig 2026" · "2026-05-06" → "6 Maig 2026" */
export function formatNewsDate(date: string, locale: string) {
  const [year, month, day] = date.split("-");
  const name = MONTHS[toLoc(locale)][Number(month) - 1] ?? month;
  return [day ? String(Number(day)) : null, name, year].filter(Boolean).join(" ");
}

export function newsHref(locale: string, slug?: string) {
  return `/${locale}/noticies${slug ? `/${slug}` : ""}`;
}

export default function NewsList({ items, locale }: { items: NewsItem[]; locale: string }) {
  const loc = toLoc(locale);

  return (
    <ol className="pu-news-list">
      {items.map((item) => {
        const t = item[loc];
        return (
          <li key={item.slug}>
            <Link href={newsHref(locale, item.slug)} className="pu-news-row">
              <span className="pu-news-text">
                <span className="pu-news-meta">
                  {formatNewsDate(item.date, locale)} · {CATEGORY_LABELS[loc][item.category]}
                </span>
                <span className="pu-news-title">{t.title}</span>
                <span className="pu-news-summary">{t.summary}</span>
              </span>
              <span className="pu-news-thumb">
                {item.coverImage ? <img src={item.coverImage} alt="" loading="lazy" /> : null}
              </span>
            </Link>
          </li>
        );
      })}

      <style>{`
        .pu-news-list {
          list-style: none;
          margin: 0;
          padding: 0;
          border-top: 1px solid var(--color-border);
        }
        .pu-news-row {
          display: grid;
          grid-template-columns: minmax(0, 9fr) minmax(0, 3fr);
          gap: clamp(20px, 3vw, 48px);
          padding: clamp(24px, 3.5vh, 40px) 0;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-fg);
          text-decoration: none;
          transition: opacity var(--dur-fast) ease;
        }
        .pu-news-row:hover { opacity: 0.55; }
        .pu-news-meta {
          font-family: var(--font-sans);
          font-size: var(--size-meta);
          color: var(--color-muted);
          font-variant-numeric: tabular-nums;
        }
        .pu-news-text {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 640px;
        }
        .pu-news-title {
          font-family: var(--font-sans);
          font-size: clamp(20px, 1.9vw, 28px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.12;
        }
        .pu-news-summary {
          font-family: var(--font-sans);
          font-size: var(--size-body);
          line-height: 1.6;
          color: #444;
        }
        .pu-news-thumb {
          display: block;
          aspect-ratio: 4 / 3;
          overflow: hidden;
        }
        .pu-news-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(1);
          transition: filter var(--dur-mid) ease;
        }
        .pu-news-row:hover .pu-news-thumb img { filter: grayscale(0); }
        @media (max-width: 768px) {
          .pu-news-row {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .pu-news-thumb:empty { display: none; }
        }
      `}</style>
    </ol>
  );
}
