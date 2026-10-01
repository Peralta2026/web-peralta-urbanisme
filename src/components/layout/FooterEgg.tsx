"use client";

import { usePathname } from "next/navigation";
import PencilEgg from "./PencilEgg";

/* A la home el traç viu dins del manifest (HomeManifesto); a la resta, al peu */
export default function FooterEgg({ locale }: { locale: string }) {
  const pathname = usePathname();
  if (/^\/(ca|es|en)?\/?$/.test(pathname)) return null;
  return <PencilEgg locale={locale} />;
}
