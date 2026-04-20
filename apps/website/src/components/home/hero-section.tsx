import { ScreenshotFrame } from "./screenshot-frame";
import { FreeBadge, ExternalButton } from "./shared";

export function HeroSection({ downloadUrl }: { downloadUrl: string }) {
  return (
    <section className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-6xl flex-col justify-center gap-10 px-6 pb-12 pt-24 sm:px-8 sm:pt-32">
      <div className="space-y-5">
        <h1 className="text-balance font-medium text-5xl text-foreground tracking-tight sm:text-6xl lg:text-7xl">
          Track your job search without handing it over.
        </h1>
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <p className="max-w-2xl text-balance font-light text-lg text-muted-foreground leading-relaxed sm:text-xl">
            JobNest keeps every application, note, and next step on your
            device — no account, no cloud, no tracking.
          </p>
          <div className="relative shrink-0">
            <ExternalButton href={downloadUrl}>Download for macOS</ExternalButton>
            <FreeBadge />
          </div>
        </div>
      </div>

      <ScreenshotFrame
        alt="JobNest application board"
        name="mock-01"
        priority
      />
    </section>
  );
}
