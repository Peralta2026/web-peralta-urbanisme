import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllNews, getNewsBySlug } from "@/lib/news";
import { getProjectBySlug } from "@/lib/projects";
import type { Project } from "@/lib/types";
import { CATEGORY_LABELS, NEWS_LABELS, formatNewsDate, newsHref, toLoc } from "@/components/news/NewsList";

export const dynamic = "force-static";

const NETWORK_NAMES = { linkedin: "LinkedIn", instagram: "Instagram" } as const;

export async function generateStaticParams() {
  return getAllNews().flatMap((n) =>
    (["ca", "es", "en"] as const).map((locale) => ({ slug: n.slug, locale }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const item = getNewsBySlug(slug);
  if (!item) return {};
  const t = item[toLoc(locale)];
  return {
    title: `${t.title} — Peralta Urbanisme`,
    description: t.summary,
    openGraph: item.coverImage ? { images: [item.coverImage] } : undefined,
  };
}

export default async function NoticiaPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const item = getNewsBySlug(slug);
  if (!item) notFound();

  const loc = toLoc(locale);
  const t = item[loc];
  const labels = NEWS_LABELS[loc];
  const related = item.relatedProjects
    .map((s) => getProjectBySlug(s))
    .filter((p): p is Project => p !== undefined);

  return (
    <article className="pu-noticia">
      <header className="pu-noticia-header">
        <p className="pu-noticia-meta">
          <span>{formatNewsDate(item.date)}</span>
          <span>/</span>
          <span>{CATEGORY_LABELS[loc][item.category]}</span>
        </p>
        <h1>{t.title}</h1>
      </header>

      <div className={`pu-noticia-grid${item.images.length ? "" : " pu-noticia-grid--text"}`}>
        <div className="pu-noticia-left">
          <p className="pu-noticia-lead">{t.summary}</p>
          {t.body.map((para, i) => (
            <p key={i} className="pu-noticia-para">{para}</p>
          ))}

          {(t.credits || related.length > 0 || item.source) && (
            <dl className="pu-noticia-facts">
              {t.credits && (
                <div>
                  <dt>{labels.credits}</dt>
                  <dd>{t.credits}</dd>
                </div>
              )}
              {related.length > 0 && (
                <div>
                  <dt>{labels.related}</dt>
                  <dd>
                    {related.map((p) => (
                      <Link key={p.slug} href={`/${locale}/projectes/${p.slug}`} className="pu-noticia-link">
                        {p[loc].title} →
                      </Link>
                    ))}
                  </dd>
                </div>
              )}
              {item.source && (
                <div>
                  <dt>{labels.source}</dt>
                  <dd>
                    <a href={item.source.url} target="_blank" rel="noopener noreferrer" className="pu-noticia-link">
                      {NETWORK_NAMES[item.source.network]} ↗
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          )}

          <Link href={newsHref(locale)} className="pu-noticia-back">
            ← {labels.back}
          </Link>
        </div>

        {item.images.length > 0 && (
          <div className="pu-noticia-images">
            {item.images.map((src) => (
              <img key={src} src={src} alt="" loading="lazy" />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .pu-noticia {
          padding-top: var(--header-height);
          font-family: var(--font-sans);
        }
        .pu-noticia-header {
          padding: clamp(36px,5vh,64px) var(--margin-page) clamp(24px,3.5vh,44px);
          border-bottom: 1px solid var(--color-border);
        }
        .pu-noticia-meta {
          display: flex;
          gap: 10px;
          margin: 0 0 clamp(16px,2.5vh,28px);
          font-family: var(--font-mono);
          font-size: var(--size-label);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-muted);
        }
        .pu-noticia-header h1 {
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: clamp(30px,3.6vw,56px);
          letter-spacing: -0.04em;
          line-height: 1.02;
          color: #000;
          margin: 0;
          max-width: 18em;
        }
        .pu-noticia-grid {
          display: grid;
          grid-template-columns: 5fr 7fr;
          align-items: start;
          border-bottom: 1px solid var(--color-border);
        }
        .pu-noticia-grid--text { grid-template-columns: 1fr; }
        .pu-noticia-left {
          display: flex;
          flex-direction: column;
          padding: clamp(36px,5vh,64px) var(--margin-page);
          max-width: 720px;
        }
        .pu-noticia-lead {
          font-size: clamp(17px,1.5vw,21px);
          line-height: 1.45;
          letter-spacing: -0.01em;
          color: #000;
          margin: 0 0 28px;
        }
        .pu-noticia-para {
          font-size: var(--size-body);
          line-height: 1.7;
          color: #444;
          margin: 0 0 18px;
        }
        .pu-noticia-facts {
          margin: 24px 0 0;
          border-top: 1px solid var(--color-border);
        }
        .pu-noticia-facts > div {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid var(--color-border-soft);
        }
        .pu-noticia-facts dt {
          font-family: var(--font-mono);
          font-size: var(--size-label);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-muted);
          padding-top: 2px;
        }
        .pu-noticia-facts dd {
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 14px;
          line-height: 1.5;
          color: #222;
        }
        .pu-noticia-link {
          color: #000;
          text-decoration: none;
          transition: opacity var(--dur-fast) ease;
        }
        .pu-noticia-link:hover { opacity: 0.5; }
        .pu-noticia-back {
          align-self: flex-start;
          margin-top: clamp(40px,6vh,64px);
          font-family: var(--font-mono);
          font-size: var(--size-label);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #000;
          text-decoration: none;
          border-bottom: 1px solid #000;
          padding-bottom: 4px;
          transition: opacity var(--dur-fast) ease;
        }
        .pu-noticia-back:hover { opacity: 0.5; }
        .pu-noticia-images {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--color-border);
          border-left: 1px solid var(--color-border);
        }
        .pu-noticia-images img {
          display: block;
          width: 100%;
          height: auto;
          background: var(--color-bg);
        }
        @media (max-width: 768px) {
          .pu-noticia-grid { grid-template-columns: 1fr; }
          .pu-noticia-images {
            border-left: none;
            border-top: 1px solid var(--color-border);
          }
          .pu-noticia-facts > div { grid-template-columns: 1fr; gap: 6px; }
        }
      `}</style>
    </article>
  );
}
