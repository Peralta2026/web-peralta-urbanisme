import { redirect } from "next/navigation";

// The root path is handled by next-intl middleware which rewrites to /[locale].
// This fallback redirect ensures the default locale home is served if middleware
// is bypassed (e.g., direct static export).
export default function RootPage() {
  redirect("/");
}
