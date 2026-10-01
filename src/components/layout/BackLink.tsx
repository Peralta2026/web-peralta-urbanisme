"use client";

import { usePathname, useRouter } from "next/navigation";

export const PREV_PATH_KEY = "pu-prev-path";

const LABEL: Record<string, string> = { ca: "Tornar", es: "Volver", en: "Back" };

/**
 * Torna exactament al punt d'on venia la persona (historial del navegador,
 * que conserva la posició de scroll). Si ha entrat directament a la pàgina,
 * porta a l'inici.
 */
export default function BackLink() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.match(/^\/(ca|es|en)(\/|$)/)?.[1] ?? "ca";
  const home = `/${locale}`;

  const goBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    let cameFromSite = false;
    try { cameFromSite = !!sessionStorage.getItem(PREV_PATH_KEY); } catch { /* ignore */ }
    if (cameFromSite) router.back();
    else router.push(home);
  };

  return (
    <a href={home} onClick={goBack} className="pu-back">
      <span aria-hidden="true">←</span> {LABEL[locale] ?? LABEL.ca}
      <style>{`
        .pu-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 20px;
          padding: 6px 0;
          font-family: var(--font-sans);
          font-size: var(--size-meta);
          font-weight: 600;
          color: #111;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 4px;
          transition: opacity var(--dur-fast) ease;
        }
        .pu-back:hover { opacity: 0.5; }
        .pu-back span { display: inline-block; transition: transform var(--dur-mid) var(--ease-smooth); }
        .pu-back:hover span { transform: translateX(-4px); }
      `}</style>
    </a>
  );
}
