import Image from "next/image";
import { Button } from "@jobnest/ui";
import iconImage from "../../assets/home/icon.webp";
import { ThemeToggle } from "../theme-toggle";
import { GitHubIcon } from "./shared";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#import", label: "Import" },
  { href: "#download", label: "Download" },
];

export function SiteHeader({
  repoUrl,
  version,
}: {
  repoUrl: string;
  version: string;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-border/60 border-b bg-background/80 backdrop-blur-md sm:backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:gap-4 sm:px-8 sm:py-3">
        <a href="#top" className="min-w-0 flex items-center gap-2.5">
          <Image
            alt="JobNest app icon"
            className="size-6 shrink-0 sm:size-7"
            height={28}
            priority
            src={iconImage}
            width={28}
          />
          <p className="truncate font-medium text-foreground text-sm tracking-tight">
            JobNest{" "}
            <span className="hidden font-light text-muted-foreground text-xs sm:inline">
              v{version}
            </span>
          </p>
        </a>
        <nav className="hidden sm:flex items-center gap-1" aria-label="Page sections">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="rounded-md px-3 py-1.5 font-light text-muted-foreground text-sm transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="shrink-0 flex items-center gap-0.5 sm:gap-1">
          <Button
            aria-label="Open the JobNest GitHub repository"
            nativeButton={false}
            // biome-ignore lint/a11y/useAnchorContent: base-ui render prop projects the Button's children
            render={<a href={repoUrl} rel="noreferrer" target="_blank" />}
            size="sm"
            variant="ghost"
          >
            <GitHubIcon />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
