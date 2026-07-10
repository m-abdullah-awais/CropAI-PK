import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Fraunces,
  Noto_Naskh_Arabic,
  Noto_Sans_Devanagari,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { LanguageProvider } from "@/lib/i18n/provider";
import { UIProviders } from "@/components/layout/ui-providers";
import { AppShell } from "@/components/layout/app-shell";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Editorial display serif used with restraint for hero and page headings only.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const naskh = Noto_Naskh_Arabic({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
});
const devanagari = Noto_Sans_Devanagari({
  variable: "--font-hindi",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CropAI PK - Crop Recommendation, Yield & Rotation",
  description:
    "AI-powered crop recommendation, yield prediction, and rotation planning for Pakistani farmers. English, Urdu, and Hindi.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${naskh.variable} ${devanagari.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <UIProviders>
              <AppShell>{children}</AppShell>
              <Toaster richColors position="top-center" />
            </UIProviders>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
