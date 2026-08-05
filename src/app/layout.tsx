import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mdesume.rohitchouhan.com"),
  title: {
    default: "mdesume — Markdown Resume Builder",
    template: "%s · mdesume",
  },
  description:
    "Build clean, ATS-friendly resumes from Markdown. Free, privacy-first, fully static — runs in your browser and exports to PDF. No account required.",
  keywords: [
    "resume builder",
    "CV maker",
    "markdown resume",
    "ATS resume",
    "PDF export",
    "free resume builder",
  ],
  authors: [{ name: "mdesume" }],
  openGraph: {
    type: "website",
    title: "mdesume — Markdown Resume Builder",
    description:
      "Build clean, ATS-friendly resumes from Markdown. Free, privacy-first, fully static — runs in your browser and exports to PDF.",
    siteName: "mdesume",
  },
  twitter: {
    card: "summary_large_image",
    title: "mdesume — Markdown Resume Builder",
    description:
      "Build clean, ATS-friendly resumes from Markdown. Free, privacy-first, fully static — runs in your browser and exports to PDF.",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "mdesume",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* No-flash theme init: runs before paint, reads the stored theme
            (default "system") and applies the .dark class + color-scheme so the
            first paint matches the user's choice. Must stay synchronous inline.
            `beforeInteractive` injects a real <script> into the served HTML, so
            it executes during initial load on a static export (client nav handled
            by ThemeProvider). */}
        <Script
          id="mdesume-no-flash-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mdesume-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
          {children}
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
