import Link from "next/link";
import type { NewsCategory, NewsItem } from "@/lib/types";

type Loc = "ca" | "es" | "en";

export const CATEGORY_LABELS: Record<Loc, Record<NewsCategory, string>> = {
  ca: { esdeveniment: "Esdeveniment", concurs: "Concurs", aprovacio: "Aprovació", participacio: "Participació", premsa: "Premsa", premi: "Premi", equip: "Equip" },
  es: { esdeveniment: "Evento", concurs: "Concurso", aprovacio: "Aprobación", participacio: "Participación", premsa: "Prensa", premi: "Premio", equip: "Equipo" },
  en: { esdeveniment: "Event", concurs: "Competition", aprovacio: "Approval", participacio: "Participation", premsa: "Press", premi: "Award", equip: "Studio" },
};

export const NEWS_LABELS: Record<Loc, { title: string; all: string; read: string; back: string; source: string; related: string; credits: string }> = {
  ca: { title: "Notícies", all: "Totes les notícies", read: "Llegir", back: "Totes les notícies", source: "Publicat a", related: "Projectes relacionats", credits: "Equip" },
  es: { title: "Noticias", all: "Todas las noticias", read: "Leer", back: "Todas las noticias", source: "Publicado en", related: "Proyectos relacionados", credits: "Equipo" },
  en: { title: "News", all: "All news", read: "Read", back: "All news", source: "Published on", related: "Related projects", credits: "Team" },
};

export function toLoc(locale: string): Loc {
  return locale === "es" || locale === "en" ? locale : "ca";
}

/** "2026-05" → "05.2026" · "2026-05-06" → "06.05.2026" */
export function formatNewsDate(date: string) {
  return date.split("-").reverse().join(".");
}

export function newsHref(locale: string, slug?: string) {
  return `/${locale}/noticies${slug ? `/${slug}` : ""}`;
}

export default function NewsList({ items, locale }: { items: NewsItem[]; locale: string }) {
  const loc = toLoc(locale);
  const labels = NEWS_LABELS[loc];

  return (
    <ol className="pu-news-list">
      {items.map((item) => {
        const t = item[loc];
        return (
          <li key={item.slug}>
            <Link href={newsHref(locale, item.slug)} className="pu-news-row">
              <span className="pu-news-meta">
                <span>{formatNewsDate(item.date)}</span>
                <span className="pu-news-meta-cat">{CATEGORY_LABELS[loc][item.category]}</span>
              </span>
              <span className="pu-news-text">
                <span className="pu-news-title">{t.title}</span>
                <span className="pu-news-summary">{t.summary}</span>
                <span className="pu-news-read">{labels.read} →</span>
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
          grid-template-columns: 3fr 6fr 3fr;
          gap: clamp(20px, 3vw, 48px);
          padding: clamp(24px, 3.5vh, 40px) 0;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-fg);
          text-decoration: none;
          transition: opacity var(--dur-fast) ease;
        }
        .pu-news-row:hover { opacity: 0.55; }
        .pu-news-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: var(--size-label);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-fg);
        }
        .pu-news-meta-cat { color: var(--color-muted); }
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
        .pu-news-read {
          margin-top: 6px;
          font-family: var(--font-mono);
          font-size: var(--size-label);
          letter-spacing: 0.14em;
          text-transform: uppercase;
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
          .pu-news-meta { flex-direction: row; gap: 14px; }
          .pu-news-thumb:empty { display: none; }
        }
      `}</style>
    </ol>
  );
}
