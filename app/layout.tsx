import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { PwaRuntime } from "@/components/pwa/pwa-runtime";
import { ConnectivityNotice } from "@/components/pwa/connectivity-notice";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Lingo — Học tiếng Anh mỗi ngày";
const description =
  "Học từ vựng tiếng Anh theo 6 cấp độ (Beginner → Advanced) với lộ trình theo bài, flashcard lặp lại ngắt quãng, theo dõi tiến độ và streak.";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Lingo",
  appleWebApp: { capable: true, title: "Lingo", statusBarStyle: "default" },
  icons: {
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  formatDetection: { telephone: false },
  title,
  description,
  openGraph: {
    type: "website",
    siteName: "Lingo",
    title,
    description,
    images: [
      {
        url: "/themes.png",
        width: 1672,
        height: 941,
        alt: "Lingo — Nền tảng học tiếng Anh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/themes.png"],
  },
};

export const viewport: Viewport = { themeColor: "#2563eb" };

// Đặt data-theme trước khi React hydrate để không nháy màu.
const THEME_INIT = `try{var t=localStorage.getItem('lingo-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-full font-sans">
        <PwaRuntime />
        <ConnectivityNotice />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
