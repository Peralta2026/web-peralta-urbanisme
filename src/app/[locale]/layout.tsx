import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMessages, getTranslations } from "next-intl/server";
import Nav from "@/components/layout/Nav";
import IntroWrapper from "@/components/intro/IntroWrapper";
import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
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

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen flex flex-col">
        {/*
          Guard: capa blanca estàtica que impedeix qualsevol flash de contingut.
          Existeix des del primer píxel (HTML del servidor), z-index 9998.
          IntroWrapper l'esborra: ràpid si ja s'ha vist, o quan acaba la intro.
        */}
        <div
          id="pu-guard"
          style={{
            position:      "fixed",
            inset:         0,
            zIndex:        9998,
            background:    "#ffffff",
            pointerEvents: "none",
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <IntroWrapper>
            <Nav locale={locale} />
            <main className="flex-1">{children}</main>
          </IntroWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
