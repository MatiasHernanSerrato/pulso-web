import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulso",
  description: "Peso, plata y lo que te late. Todo en un solo lado.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
