"use client";

import { IconMoonStars, IconSun } from "@tabler/icons-react";
import { Button } from "@jobnest/ui";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      size="sm"
      type="button"
      variant="ghost"
    >
      {isDark ? (
        <IconSun aria-hidden="true" size={16} />
      ) : (
        <IconMoonStars aria-hidden="true" size={16} />
      )}
    </Button>
  );
}
