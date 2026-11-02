import type { Metadata } from "next";
import {
  Hanken_Grotesk,
  JetBrains_Mono,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OpsCore | Inventario de Software",
    template: "%s | OpsCore",
  },
  description:
    "Plataforma ITAM para gestionar el inventario, las licencias y el ciclo de vida del software de tu empresa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${hankenGrotesk.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-surface font-body-md text-on-surface">
        {children}
      </body>
    </html>
  );
}
