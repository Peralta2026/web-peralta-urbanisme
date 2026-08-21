import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Nav from "@/components/layout/Nav";
import IntroWrapper from "@/components/intro/IntroWrapper";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<string, string> = {
    ca: "Peralta Urbanisme",
    es: "Peralta Urbanisme",
    en: "Peralta Urbanisme",
  };
  const descs: Record<string, string> = {
    ca: "Despatx d'urbanisme i planificació territorial",
    es: "Estudio de urbanismo y planificación territorial",
    en: "Urbanism and territorial planning studio",
  };
  return { title: titles[locale] ?? titles.ca, description: descs[locale] ?? descs.ca };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Import messages directly from locale param — avoids getMessages() which
  // calls headers() internally and forces dynamic rendering on every RSC fetch.
  const messages = (
    await import(`@/i18n/messages/${locale}.json`)
  ).default as Record<string, unknown>;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <IntroWrapper>
        <Nav locale={locale} />
        <main className="flex-1">{children}</main>
        <footer style={{
          background: "#0a0a0a",
          minHeight: "280px",
          padding: "80px 32px 56px",
          position: "relative",
          zIndex: 1,
        }}>
          {/* Footer content will be added later */}
        </footer>
      </IntroWrapper>
    </NextIntlClientProvider>
  );
}
