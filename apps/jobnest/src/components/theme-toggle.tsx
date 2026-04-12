"use client";

import { Button } from "@acme/ui";
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
      className="gap-2"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
      variant="secondary"
    >
      <span className="text-base leading-none" aria-hidden="true">
        {isDark ? "☀" : "☾"}
      </span>
      <span>{isDark ? "Light mode" : "Dark mode"}</span>
    </Button>
  );
}
