import Link from "next/link";
import type { NewsItem } from "@/lib/types";

type Loc = "ca" | "es" | "en";

export const NEWS_LABELS: Record<Loc, { title: string; all: string; back: string; sources: string; related: string; credits: string }> = {
  ca: { title: "Notícies", all: "Totes les notícies", back: "Totes les notícies", sources: "Fonts", related: "Projectes relacionats", credits: "Equip" },
  es: { title: "Noticias", all: "Todas las noticias", back: "Todas las noticias", sources: "Fuentes", related: "Proyectos relacionados", credits: "Equipo" },
  en: { title: "News", all: "All news", back: "All news", sources: "Sources", related: "Related projects", credits: "Team" },
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

/** Data visible: l'etiqueta manual ("Primavera 2026") té prioritat sobre la calculada */
export function newsDate(item: NewsItem, locale: string) {
  return item[toLoc(locale)].dateLabel ?? formatNewsDate(item.date, locale);
}

export function newsHref(locale: string, slug?: string) {
  return `/${locale}/noticies${slug ? `/${slug}` : ""}`;
}

function NewsCard({ item, index, locale }: { item: NewsItem; index: number; locale: string }) {
  const t = item[toLoc(locale)];
  return (
    <Link href={newsHref(locale, item.slug)} className="pu-mag-item" style={{ order: index }}>
      {item.coverImage && (
        <span className={`pu-mag-img${item.coverFit === "contain" ? " pu-mag-img--contain" : ""}`}>
          <img src={item.coverImage} alt="" loading="lazy" />
        </span>
      )}
      <span className="pu-mag-meta">
        <span className="pu-mag-date">{newsDate(item, locale)}</span>
        <span className="pu-mag-tag">{t.tag}</span>
      </span>
      <span className="pu-mag-title">{t.title}</span>
      <span className="pu-mag-summary">{t.summary}</span>
    </Link>
  );
}

/**
 * Maqueta de revista: tres columnes separades per filets verticals.
 * Les notícies es reparteixen d'esquerra a dreta (1·2·3, 4·5·6…) perquè
 * l'ordre de lectura segueixi sent cronològic; en mòbil es tornen a llegir
 * en una sola columna gràcies a `order`.
 */
export default function NewsList({ items, locale }: { items: NewsItem[]; locale: string }) {
  const columns: { item: NewsItem; index: number }[][] = [[], [], []];
  items.forEach((item, index) => columns[index % 3].push({ item, index }));

  return (
    <div className="pu-mag">
      {columns.map((col, c) => (
        <div key={c} className="pu-mag-col">
          {col.map(({ item, index }) => (
            <NewsCard key={item.slug} item={item} index={index} locale={locale} />
          ))}
        </div>
      ))}

      <style>{`
        .pu-mag {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          border-top: 1px solid var(--color-border);
        }
        .pu-mag-col {
          display: flex;
          flex-direction: column;
          padding: 0 clamp(24px, 3vw, 48px);
        }
        .pu-mag-col:first-child { padding-left: 0; }
        .pu-mag-col:last-child  { padding-right: 0; }
        .pu-mag-col + .pu-mag-col { border-left: 1px solid var(--color-border); }

        .pu-mag-item {
          display: flex;
          flex-direction: column;
          padding: clamp(32px, 4.5vh, 52px) 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.12);
          color: var(--color-fg);
          text-decoration: none;
          transition: opacity var(--dur-fast) ease;
        }
        .pu-mag-col .pu-mag-item:last-child { border-bottom: none; }
        .pu-mag-item:hover { opacity: 0.6; }

        .pu-mag-img {
          display: block;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          margin-bottom: 24px;
          background: var(--color-gray-light);
        }
        .pu-mag-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(1);
          transition: filter var(--dur-mid) ease;
        }
        .pu-mag-item:hover .pu-mag-img img { filter: grayscale(0); }
        .pu-mag-img--contain { background: #fff; }
        .pu-mag-img--contain img { object-fit: contain; }

        .pu-mag-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 14px;
          margin-bottom: 14px;
          font-family: var(--font-sans);
          font-size: 12px;
          line-height: 1.4;
          font-variant-numeric: tabular-nums;
        }
        .pu-mag-date { color: var(--color-fg); font-weight: 600; }
        .pu-mag-tag  { color: var(--color-muted); }

        .pu-mag-title {
          font-family: var(--font-sans);
          font-size: clamp(21px, 1.75vw, 27px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.12;
          text-wrap: balance;
          margin-bottom: 14px;
        }
        .pu-mag-summary {
          font-family: var(--font-sans);
          font-size: 14.5px;
          line-height: 1.6;
          color: #555;
          max-width: 36em;
        }

        @media (max-width: 860px) {
          .pu-mag { display: flex; flex-direction: column; }
          .pu-mag-col { display: contents; }
          .pu-mag-item { border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important; }
        }
      `}</style>
    </div>
  );
}
