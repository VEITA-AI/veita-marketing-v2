import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veita — Capital-efficient companies on a platform that learns",
  description:
    "Veita is a company studio building capital-efficient companies on Saga and Kyndred. Two doors — Origin and Transform — into one system.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Veita — One system, two doors",
    description:
      "Veita builds capital-efficient companies on a platform that learns from every one of them.",
    type: "website",
  },
  twitter: { card: "summary" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/bricolage-grotesque-latin.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/schibsted-grotesk-latin.woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
