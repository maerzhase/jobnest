import Image from "next/image";
import iconImage from "../../assets/home/icon.webp";
import { ExternalButton, FreeBadge, GitHubIcon } from "./shared";

export function ClosingSections({
  downloadUrl,
  repoUrl,
}: {
  downloadUrl: string;
  repoUrl: string;
}) {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
        <div className="rounded-2xl border border-border/70 bg-card/60 px-5 py-8 backdrop-blur-lg sm:px-12 sm:py-14 sm:backdrop-blur-xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-balance font-medium text-2xl text-foreground tracking-tight sm:text-4xl">
                A job search tracker that stays on your side.
              </h2>
              <p className="text-balance font-light text-base text-muted-foreground leading-relaxed sm:text-lg">
                Free and private, open source and local-first. Install it
                once and own every note you take from here on out.
              </p>
              <p className="text-balance font-light text-muted-foreground text-sm leading-relaxed">
                The core JobNest experience is free, forever. Optional paid
                extras may arrive later, but tracking your job search will
                always stay free.
              </p>
            </div>
            <div className="flex w-full flex-col items-center gap-5 text-center sm:w-auto sm:gap-6">
              <Image
                alt=""
                aria-hidden
                className="size-20 sm:size-28"
                height={112}
                src={iconImage}
                width={112}
              />
              <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                <div className="relative w-full sm:w-auto">
                  <ExternalButton className="w-full justify-center sm:w-auto" href={downloadUrl}>
                    Download for macOS
                  </ExternalButton>
                  <FreeBadge />
                </div>
                <ExternalButton className="w-full justify-center sm:w-auto" href={repoUrl} variant="secondary">
                  View on GitHub
                </ExternalButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-8 sm:pb-16">
        <aside className="rounded-2xl border border-border/60 bg-card/40 px-5 py-5 backdrop-blur-sm sm:px-7 sm:py-6">
          <p className="font-medium text-foreground text-sm">
            A small note before you download
          </p>
          <p className="pt-2 font-light text-muted-foreground text-sm leading-relaxed">
            JobNest is in active early development and currently ships without
            an Apple developer signature. The first time you open it, macOS
            will ask you to confirm — head to{" "}
            <span className="font-medium text-foreground">
              System Settings → Privacy &amp; Security
            </span>{" "}
            and choose{" "}
            <span className="font-medium text-foreground">Open Anyway</span> to
            let it through. We&apos;ll move to a fully signed build as soon as
            we can.
          </p>
        </aside>
      </section>

      <footer className="mx-auto max-w-6xl px-4 pb-10 sm:px-8">
        <div className="flex flex-col items-center justify-center gap-1.5 text-center text-muted-foreground text-sm sm:flex-row sm:flex-wrap sm:gap-x-2 sm:gap-y-1">
          <span className="font-light">
            built with{" "}
            <span aria-label="love" role="img">
              ♥
            </span>{" "}
            by{" "}
            <a
              className="font-medium text-foreground hover:underline"
              href="https://m3000.io"
              rel="noreferrer"
              target="_blank"
            >
              m3000.io
            </a>
          </span>
          <span aria-hidden className="hidden sm:inline">
            ·
          </span>
          <a
            className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline"
            href={repoUrl}
            rel="noreferrer"
            target="_blank"
          >
            <GitHubIcon />
            GitHub
          </a>
        </div>
      </footer>
    </>
  );
}
