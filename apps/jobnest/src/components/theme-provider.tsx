"use client";

import { ToastProvider } from "@jobnest/ui";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import { appToastManager } from "../lib/toast";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      <ToastProvider toastManager={appToastManager}>{children}</ToastProvider>
    </NextThemesProvider>
  );
}
