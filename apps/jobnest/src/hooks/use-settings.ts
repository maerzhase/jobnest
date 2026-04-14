"use client";

import { invoke } from "@tauri-apps/api/core";
import { startTransition, useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../lib/error-handler";
import type { AppSettings } from "../lib/settings";

type UseSettingsReturn = {
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  loadSettings: () => Promise<void>;
  updateCurrency: (currency: string) => Promise<void>;
  isSavingCurrency: boolean;
  clearMessage: () => void;
  clearError: () => void;
};

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentSettings = await invoke<AppSettings>("get_app_settings");
      setSettings(currentSettings);
    } catch (err) {
      setError(getErrorMessage(err));
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
      setError(null);
      setMessage(null);

      try {
        const updatedSettings = await invoke<AppSettings>(
          "update_app_settings",
          {
            input: {
              preferredCurrency: nextCurrency,
            },
          }
        );

        startTransition(() => {
          setSettings(updatedSettings);
        });
        setMessage("Preferred currency updated.");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsSavingCurrency(false);
      }
    },
    [settings]
  );

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    settings,
    isLoading,
    error,
    message,
    loadSettings,
    updateCurrency,
    isSavingCurrency,
    clearMessage,
    clearError,
  };
}
