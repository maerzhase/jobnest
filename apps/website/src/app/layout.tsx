import type { Metadata } from "next";
import { ThemeProvider } from "../components/theme-provider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "Private Job Application Tracker for macOS | JobNest",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "job application tracker",
    "job search tracker",
    "private job tracker",
    "local-first job tracker",
    "macOS job application tracker",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Private Job Application Tracker for macOS | JobNest",
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 256,
        height: 256,
        alt: "JobNest app icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Private Job Application Tracker for macOS | JobNest",
    description: SITE_DESCRIPTION,
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    apple: "/icon.png",
    icon: [
      { rel: "icon", type: "image/png", url: "/icon.png" },
      { rel: "shortcut icon", url: "/icon.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
