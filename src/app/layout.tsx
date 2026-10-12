import type { Metadata } from "next";
import { Cormorant_Garamond, Fraunces, Manrope, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import "./preview.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

/** Secret edition — literary display (EN) + serif for ZH body. */
const secretDisplay = Cormorant_Garamond({
  variable: "--font-secret-display",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const secretBody = Noto_Serif_SC({
  variable: "--font-secret-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "CueRoom",
  description: "Redesign cues and friction in your environments — bilingual EN + ZH.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${secretDisplay.variable} ${secretBody.variable} h-full`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
