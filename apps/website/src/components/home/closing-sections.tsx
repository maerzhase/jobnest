import { IconInfoCircle } from "@tabler/icons-react";
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
      <section id="download" className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
          <article className="space-y-4 sm:space-y-5">
            <h2 className="text-balance font-medium text-2xl text-foreground tracking-tight sm:text-4xl lg:text-5xl">
              A job search tracker that stays on your side.
            </h2>
            <p className="font-light text-base text-foreground/85 leading-relaxed sm:text-lg">
              Private, open source, and local-first. Install it once and own
              every note you take from here on out.
            </p>
            <p className="font-light text-base text-muted-foreground leading-relaxed">
              Free to download, free to use, free to keep. Optional extras may
              come later — tracking your search never will cost a thing.
            </p>
          </article>

          <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm px-5 py-6 backdrop-blur-sm sm:px-7 sm:py-8">
            <div className="space-y-5">
              <Image
                alt=""
                aria-hidden
                className="mx-auto size-12 sm:size-14"
                height={56}
                src={iconImage}
                width={56}
              />
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <ExternalButton className="w-full justify-center" href={downloadUrl}>
                    Download for macOS
                  </ExternalButton>
                  <FreeBadge />
                </div>
                <ExternalButton className="w-full justify-center" href={repoUrl} variant="secondary">
                  View on GitHub
                </ExternalButton>
              </div>

              <hr className="border-border/50" />

              <aside className="flex gap-2.5">
                <IconInfoCircle
                  aria-hidden
                  className="mt-0.5 shrink-0 text-muted-foreground/60"
                  size={14}
                />
                <div>
                  <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    A small note
                  </p>
                  <p className="pt-1.5 font-light text-muted-foreground text-xs leading-relaxed">
                    JobNest ships without an Apple developer signature for now.
                    On first launch go to{" "}
                    <span className="font-medium text-foreground">
                      System Settings → Privacy &amp; Security
                    </span>{" "}
                    and choose{" "}
                    <span className="font-medium text-foreground">
                      Open Anyway
                    </span>
                    . A signed build is on the way.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
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
          <span aria-hidden className="hidden sm:inline">
            ·
          </span>
          <a
            className="font-medium text-foreground hover:underline"
            href="/llm.txt"
            target="_blank"
            rel="noreferrer"
          >
            llm.txt
          </a>
        </div>
      </footer>
    </>
  );
}
