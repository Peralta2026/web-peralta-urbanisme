// This file should never render — src/proxy.ts (middleware) intercepts all
// root requests and rewrites them to /[locale]. It exists only to satisfy
// Next.js App Router's file-system routing requirement.
export default function RootPage() {
  return null;
}
