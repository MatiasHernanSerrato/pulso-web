import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://pulso.vercel.app"),
  title: {
    default: "Pulso",
    template: "%s | Pulso",
  },
  description: "Peso, plata y lo que te late. Todo en un solo lado.",
  openGraph: {
    title: "Pulso",
    description: "Peso, plata y lo que te late. Todo en un solo lado.",
    url: "https://pulso.vercel.app",
    siteName: "Pulso",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulso",
    description: "Peso, plata y lo que te late. Todo en un solo lado.",
  },
  robots: {
    index: process.env.VERCEL_ENV === "production",
    follow: process.env.VERCEL_ENV === "production",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
