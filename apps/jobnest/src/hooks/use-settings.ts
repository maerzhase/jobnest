"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { settingsApi, type AppSettings } from "../lib/api/settings";
import { getErrorMessage } from "../lib/error-handler";
import { showErrorToast, showSuccessToast } from "../lib/toast";

type UseSettingsReturn = {
  settings: AppSettings | null;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateCurrency: (currency: string) => Promise<void>;
  isSavingCurrency: boolean;
};

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);

    try {
      const currentSettings = await settingsApi.get();
      setSettings(currentSettings);
    } catch (err) {
      showErrorToast({
        title: "Could not load settings",
        description: getErrorMessage(err),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const updateCurrency = useCallback(
    async (nextCurrency: string) => {
      if (!settings || nextCurrency === settings.preferredCurrency) {
        return;
      }

      setIsSavingCurrency(true);

      try {
        const updatedSettings = await settingsApi.update({
          preferredCurrency: nextCurrency,
        });

        startTransition(() => {
          setSettings(updatedSettings);
        });
        showSuccessToast({
          title: "Settings updated",
          description: "Preferred currency saved successfully.",
        });
      } catch (err) {
        showErrorToast({
          title: "Could not update settings",
          description: getErrorMessage(err),
        });
      } finally {
        setIsSavingCurrency(false);
      }
    },
    [settings]
  );

  return {
    settings,
    isLoading,
    loadSettings,
    updateCurrency,
    isSavingCurrency,
  };
}
