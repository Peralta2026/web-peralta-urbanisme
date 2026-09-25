import type { Metadata } from "next";
import { getAllNews } from "@/lib/news";
import NewsList, { NEWS_LABELS, toLoc } from "@/components/news/NewsList";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${NEWS_LABELS[toLoc(locale)].title} — Peralta Urbanisme` };
}

export default async function NoticiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const news = getAllNews();

  return (
    <div className="pu-noticies">
      <header className="pu-noticies-header">
        <h1>{NEWS_LABELS[toLoc(locale)].title}</h1>
      </header>
      <div className="pu-noticies-body">
        <NewsList items={news} locale={locale} />
      </div>

      <style>{`
        .pu-noticies {
          padding-top: var(--header-height);
          font-family: var(--font-sans);
        }
        .pu-noticies-header {
          padding: clamp(36px,5vh,64px) var(--margin-page) clamp(24px,3.5vh,44px);
        }
        .pu-noticies-header h1 {
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: clamp(32px,4vw,60px);
          letter-spacing: -0.04em;
          line-height: 1;
          color: #000;
          margin: 0;
        }
        .pu-noticies-body {
          padding: 0 var(--margin-page) clamp(64px,10vh,120px);
        }
      `}</style>
    </div>
  );
}
