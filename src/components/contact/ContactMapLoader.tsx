"use client";

import dynamic from "next/dynamic";

const ContactMap = dynamic(
  () => import("@/components/contact/ContactMap"),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: "100%", height: "100%", background: "#f5f5f3" }} />
    ),
  }
);

export default function ContactMapLoader() {
  return <ContactMap />;
}
