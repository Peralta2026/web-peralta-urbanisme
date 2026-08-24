"use client";

import dynamic from "next/dynamic";

const ContactMap = dynamic(
  () => import("@/components/contact/ContactMap"),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: "100%", height: "100%", minHeight: "480px", background: "#f2f1ee" }} />
    ),
  }
);

export default function ContactMapLoader() {
  return <ContactMap />;
}
