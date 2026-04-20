import Image from "next/image";
import { Button } from "@jobnest/ui";
import { ThemeToggle } from "../theme-toggle";
import { GitHubIcon } from "./shared";

export function SiteHeader({
  repoUrl,
  version,
}: {
  repoUrl: string;
  version: string;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-border/60 border-b bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3 sm:px-8">
        <div className="flex items-center gap-2.5">
          <Image
            alt="JobNest app icon"
            className="size-7"
            height={28}
            priority
            src="/icon-transparent.png"
            width={28}
          />
          <p className="font-medium text-foreground text-sm tracking-tight">
            JobNest{" "}
            <span className="font-light text-muted-foreground text-xs">
              v{version}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1">
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
