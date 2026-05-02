import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { ContactSidebar } from "@/components/ContactSidebar";
import { FavoritesSidebar } from "@/components/FavoritesSidebar";
import { Analytics } from "@/components/Analytics";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorReportingInit } from "@/components/ErrorReportingInit";
import { DevToolsDetector } from "@/components/DevToolsDetector";
import { getFavorites } from "@/lib/favorites";
import { getLanguage, getDictionary } from "@/lib/i18n";
import { siteConfig } from "../../site.config";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.title,
    type: "website",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLanguage();
  const dict = getDictionary(lang);
  const favorites = await getFavorites(lang);

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <ErrorBoundary>
            <div className="layout">
              <Header dict={dict} lang={lang} />
              <div className="layout-body">
                {siteConfig.showFavorites && (
                  <FavoritesSidebar favorites={favorites} title={dict.favorites} />
                )}
                <main className="main-content">{children}</main>
              </div>
              <footer className="footer">
                <span>
                  &gt; {siteConfig.author} · {new Date().getFullYear()}
                </span>
              </footer>
            </div>
            {siteConfig.showContact && <ContactSidebar />}
          </ErrorBoundary>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <ErrorReportingInit />
        <DevToolsDetector />
      </body>
    </html>
  );
}
