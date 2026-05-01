import { track } from "@vercel/analytics/server";
import { type NextRequest, NextResponse } from "next/server";

const REPO = "maerzhase/jobnest";
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases/latest`;
const RELEASES_PAGE = `https://github.com/${REPO}/releases/latest`;

type GitHubAsset = {
  name: string;
  browser_download_url: string;
};

type GitHubRelease = {
  tag_name: string;
  assets: GitHubAsset[];
};

function pickMacAsset(assets: GitHubAsset[]): GitHubAsset | undefined {
  // prefer Apple Silicon, fall back to any dmg
  return (
    assets.find((a) => a.name.endsWith(".dmg") && a.name.includes("aarch64")) ??
    assets.find((a) => a.name.endsWith(".dmg"))
  );
}

export async function GET(request: NextRequest) {
  const res = await fetch(RELEASES_API, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "jobnest-website",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return NextResponse.redirect(RELEASES_PAGE);
  }

  const release = (await res.json()) as GitHubRelease;
  const asset = pickMacAsset(release.assets);

  await track("Download", {
    platform: "mac",
    version: release.tag_name,
    asset: asset?.name ?? "unknown",
  });

  return NextResponse.redirect(
    asset?.browser_download_url ?? RELEASES_PAGE,
    302
  );
}
