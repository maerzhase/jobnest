import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download JobNest for macOS",
  description:
    "Download JobNest for macOS, a private local-first job application tracker.",
  alternates: {
    canonical: "/download/mac",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function DownloadMacLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
