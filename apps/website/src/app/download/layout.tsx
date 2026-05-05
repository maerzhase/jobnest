import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download JobNest",
  description:
    "Download JobNest, a private local-first job application tracker for macOS.",
  alternates: {
    canonical: "/download",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function DownloadLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
