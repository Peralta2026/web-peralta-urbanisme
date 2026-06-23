import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ca", "es", "en"],
  defaultLocale: "ca",
  localePrefix: "as-needed", // ca has no prefix: /projectes, es/en have: /es/projectes
});
