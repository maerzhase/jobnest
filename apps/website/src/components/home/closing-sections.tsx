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
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20">
        <div className="rounded-2xl border border-border/70 bg-card/60 px-8 py-10 backdrop-blur-xl sm:px-12 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-balance font-medium text-3xl text-foreground tracking-tight sm:text-4xl">
                A job search tracker that stays on your side.
              </h2>
              <p className="text-balance font-light text-lg text-muted-foreground leading-relaxed">
                Free and private, open source and local-first. Install it
                once and own every note you take from here on out.
              </p>
              <p className="text-balance font-light text-muted-foreground text-sm leading-relaxed">
                The core JobNest experience is free, forever. Optional paid
                extras may arrive later, but tracking your job search will
                always stay free.
              </p>
            </div>
            <div className="flex flex-col items-center gap-6">
              <Image
                alt=""
                aria-hidden
                className="size-24 sm:size-28"
                height={112}
                src={iconImage}
                width={112}
              />
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <ExternalButton href={downloadUrl}>
                    Download for macOS
                  </ExternalButton>
                  <FreeBadge />
                </div>
                <ExternalButton href={repoUrl} variant="secondary">
                  View on GitHub
                </ExternalButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 sm:px-8">
        <aside className="rounded-2xl border border-border/60 bg-card/40 px-6 py-5 backdrop-blur-sm sm:px-7 sm:py-6">
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

      <footer className="mx-auto max-w-6xl px-6 pb-10 sm:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-muted-foreground text-sm">
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
          <span aria-hidden>·</span>
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
