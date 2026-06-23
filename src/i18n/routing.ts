import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ca", "es", "en"],
  defaultLocale: "ca",
  localePrefix: "as-needed",
  localeDetection: false, // Always serve Catalan by default, ignore browser language
});
