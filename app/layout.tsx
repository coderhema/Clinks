import type React from "react";
import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";

const orbitron = Orbitron({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Clinks - AI Workflow Builder",
  description:
    "Visual workflow builder for AI image, logo, video, and text generation",
  generator: "Next.js",
  keywords: [
    "AI",
    "workflow",
    "automation",
    "image generation",
    "video generation",
    "text generation",
  ],
  authors: [{ name: "Clinks Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${robotoMono.variable} antialiased`}
    >
      <head>
        <script src="https://js.puter.com/v2/"></script>
      </head>
      <body className="font-mono bg-background text-foreground">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
