import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peralta Urbanisme",
  description: "Despatx d'urbanisme i planificació territorial",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
