"use client";

import type { StaticImageData } from "next/image";
import mock01Dark from "../../assets/home/mock-01.png";
import mock01Light from "../../assets/home/mock-01-light.png";
import mock02Dark from "../../assets/home/mock-02.png";
import mock02Light from "../../assets/home/mock-02-light.png";
import mock03Dark from "../../assets/home/mock-03.png";
import mock03Light from "../../assets/home/mock-03-light.png";
import mock04Dark from "../../assets/home/mock-04.png";
import mock04Light from "../../assets/home/mock-04-light.png";

export type ScreenshotName = "mock-01" | "mock-02" | "mock-03" | "mock-04";

const screenshotVariants: Record<
  ScreenshotName,
  { dark: StaticImageData; light: StaticImageData }
> = {
  "mock-01": { dark: mock01Dark, light: mock01Light },
  "mock-02": { dark: mock02Dark, light: mock02Light },
  "mock-03": { dark: mock03Dark, light: mock03Light },
  "mock-04": { dark: mock04Dark, light: mock04Light },
};

export function ScreenshotFrame({
  alt,
  name,
  priority,
}: {
  alt: string;
  name: ScreenshotName;
  priority?: boolean;
}) {
  const images = screenshotVariants[name];
  const loading = priority ? "eager" : "lazy";

  return (
    <div
      className="relative [filter:drop-shadow(0_0_0.5px_rgb(0_0_0/0.18))_drop-shadow(0_18px_40px_rgb(0_0_0/0.12))_drop-shadow(0_4px_12px_rgb(0_0_0/0.08))] dark:[filter:drop-shadow(0_0_0.5px_rgb(255_255_255/0.25))_drop-shadow(0_18px_40px_rgb(0_0_0/0.45))_drop-shadow(0_4px_12px_rgb(0_0_0/0.35))]"
      aria-label={alt}
      role="img"
      style={{ aspectRatio: `${images.light.width} / ${images.light.height}` }}
    >
      {/* biome-ignore lint/performance/noImgElement: rendering both variants avoids next/image hydration issues with next-themes and browser history restores */}
      <img
        alt=""
        aria-hidden="true"
        className="h-auto w-full dark:hidden"
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        height={images.light.height}
        loading={loading}
        src={images.light.src}
        width={images.light.width}
      />
      {/* biome-ignore lint/performance/noImgElement: rendering both variants avoids next/image hydration issues with next-themes and browser history restores */}
      <img
        alt=""
        aria-hidden="true"
        className="hidden h-auto w-full dark:block"
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        height={images.dark.height}
        loading={loading}
        src={images.dark.src}
        width={images.dark.width}
      />
    </div>
  );
}
