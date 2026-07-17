import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/features/auth/components/session-provider";
import { cn } from "@/lib/utils";

import "./globals.css";

// Inter alimenta --font-sans, que es la variable que consume el `@theme inline`
// de globals.css (y por lo tanto la utilidad `font-sans`). La trajo el preset.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Geist Mono alimenta --font-mono. Geist Sans se sacó: desde que Inter es la
// tipografía del preset, nada referenciaba --font-geist-sans y se estaba
// descargando una fuente entera para nada.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "UCU Talent",
    template: "%s | UCU Talent",
  },
  description:
    "Portal laboral de la Universidad Católica del Uruguay: conecta empresas, alumnos y egresados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={cn(
        "h-full antialiased font-sans",
        inter.variable,
        geistMono.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
