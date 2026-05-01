"use client";

import { createContext, useContext } from "react";

type OnboardingContextValue = {
  openOnboarding: () => void;
};

export const OnboardingContext = createContext<OnboardingContextValue>({
  openOnboarding: () => undefined,
});

export function useOnboardingContext(): OnboardingContextValue {
  return useContext(OnboardingContext);
}
