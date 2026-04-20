"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import mock01Dark from "../../assets/home/mock-01.png";
import mock01Light from "../../assets/home/mock-01-light.png";
import mock02Dark from "../../assets/home/mock-02.png";
import mock02Light from "../../assets/home/mock-02-light.png";
import mock03Dark from "../../assets/home/mock-03.png";
import mock03Light from "../../assets/home/mock-03-light.png";

export type ScreenshotName = "mock-01" | "mock-02" | "mock-03";

const screenshotVariants: Record<
  ScreenshotName,
  { dark: StaticImageData; light: StaticImageData }
> = {
  "mock-01": { dark: mock01Dark, light: mock01Light },
  "mock-02": { dark: mock02Dark, light: mock02Light },
  "mock-03": { dark: mock03Dark, light: mock03Light },
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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const images = screenshotVariants[name];
  const activeImage =
    mounted && resolvedTheme === "dark" ? images.dark : images.light;

  return (
    <div
      className="relative [filter:drop-shadow(0_0_0.5px_rgb(0_0_0/0.18))_drop-shadow(0_18px_40px_rgb(0_0_0/0.12))_drop-shadow(0_4px_12px_rgb(0_0_0/0.08))] dark:[filter:drop-shadow(0_0_0.5px_rgb(255_255_255/0.25))_drop-shadow(0_18px_40px_rgb(0_0_0/0.45))_drop-shadow(0_4px_12px_rgb(0_0_0/0.35))]"
      style={{ aspectRatio: `${images.light.width} / ${images.light.height}` }}
    >
      {mounted ? (
        <Image
          alt={alt}
          className="h-auto w-full"
          height={activeImage.height}
          placeholder="blur"
          priority={priority}
          sizes="(min-width: 1280px) 1152px, calc(100vw - 3rem)"
          src={activeImage}
          width={activeImage.width}
        />
      ) : (
        <div aria-hidden className="h-full w-full" />
      )}
    </div>
  );
}
