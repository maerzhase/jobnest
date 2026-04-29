import { JOBNEST_VERSION } from "../../lib/env";
import { ClosingSections } from "./closing-sections";
import { HeroSection } from "./hero-section";
import { AmbientBackground } from "./shared";
import { SiteHeader } from "./site-header";
import { StorySection } from "./story-section";

export const REPO_URL = "https://github.com/maerzhase/jobnest";
export const DOWNLOAD_URL = `${REPO_URL}/releases/latest`;

const storySections = [
  {
    title: "Real KPIs for your job search.",
    body: "Application rate, response rate, interview conversion, time-in-stage — see how your search is actually going, on a dashboard that only you can see.",
    detail:
      "Meaningful analytics without an account, without a tracker, without anyone else looking over your shoulder. Your data stays on your device, the insight stays with you.",
    image: "mock-02",
  },
  {
    title: "Own your search history.",
    body: "Search, filter, and revisit every conversation and note. Everything lives in a format you can export, back up, and walk away with whenever you want.",
    detail:
      "No lock-in. No cloud dashboards to lose access to. Your record of the search is a file you control.",
    image: "mock-03",
  },
  {
    title: "Export your search as a report.",
    body: "Pick what to include, filter your applications, and download a clean report whenever you need it.",
    detail:
      "A clean, shareable file — ready when it matters.",
    image: "mock-04",
  },
] as const;

export function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <AmbientBackground />
      <SiteHeader repoUrl={REPO_URL} version={JOBNEST_VERSION} />
      <div aria-hidden className="h-12 sm:h-14" />

      <HeroSection downloadUrl={DOWNLOAD_URL} />

      {storySections.map((section) => (
        <StorySection key={section.title} {...section} />
      ))}

      <ClosingSections downloadUrl={DOWNLOAD_URL} repoUrl={REPO_URL} />
    </main>
  );
}
