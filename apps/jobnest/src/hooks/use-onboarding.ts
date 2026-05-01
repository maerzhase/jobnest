"use client";

import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "jobnest_onboarding_completed";

type UseOnboardingReturn = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  complete: () => void;
};

export function useOnboarding(): UseOnboardingReturn {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    const unlisten = listen("show-onboarding", () => {
      setIsOpen(true);
    });
    return () => {
      void unlisten.then((f) => f());
    };
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  }, []);

  const complete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  }, []);

  return { isOpen, open, close, complete };
}
