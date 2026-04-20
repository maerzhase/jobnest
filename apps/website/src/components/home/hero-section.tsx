import { ScreenshotFrame } from "./screenshot-frame";
import { FreeBadge, ExternalButton } from "./shared";

export function HeroSection({ downloadUrl }: { downloadUrl: string }) {
  return (
    <section className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-6xl flex-col justify-center gap-8 px-4 pb-10 pt-20 sm:min-h-[calc(100svh-3.5rem)] sm:gap-10 sm:px-8 sm:pb-12 sm:pt-32">
      <div className="space-y-4 sm:space-y-5">
        <h1 className="max-w-5xl text-balance font-medium text-4xl text-foreground tracking-tight sm:text-6xl lg:text-7xl">
          Track your job search without handing it over.
        </h1>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-5">
          <p className="max-w-2xl text-balance font-light text-base text-muted-foreground leading-relaxed sm:text-xl">
            JobNest keeps every application, note, and next step on your
            device — no account, no cloud, no tracking.
          </p>
          <div className="relative w-full shrink-0 sm:w-auto">
            <ExternalButton className="w-full justify-center sm:w-auto" href={downloadUrl}>
              Download for macOS
            </ExternalButton>
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
