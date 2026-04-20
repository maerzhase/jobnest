import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobNest — Track your job search, privately.",
  description:
    "A privacy-first job application tracker that keeps your data local.",
  icons: {
    apple: "/icon-256.png",
    icon: [
      { rel: "icon", type: "image/png", url: "/icon-256.png" },
      { rel: "shortcut icon", url: "/icon-256.png" },
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
        <Analytics />
      </body>
    </html>
  );
}
