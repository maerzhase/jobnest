"use client";

import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { startTransition, useCallback, useEffect, useState } from "react";
import { Button } from "@jobnest/ui";
import { appDataApi } from "../../lib/api/app-data";
import { settingsApi } from "../../lib/api/settings";
import { getErrorMessage } from "../../lib/error-handler";
import type { SettingsSection } from "../../lib/settings";
import { useSettings } from "../../hooks/use-settings";
import { AppHeader } from "../app-header";
import { AppearanceSettings } from "./appearance-settings";
import { ApplicationsSettings } from "./applications-settings";
import { DataManagement } from "./data-management";
import { ResetConfirmDialog } from "./reset-confirm-dialog";
import { SettingsSidebar } from "./settings-sidebar";

export function SettingsScreen() {
  const router = useRouter();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const { settings, isLoading, error, message, loadSettings, updateCurrency, isSavingCurrency, clearMessage, clearError } = useSettings();

  const [activeSection, setActiveSection] = useState<SettingsSection>("appearance");
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    setIsThemeReady(true);
  }, []);

  const handleSectionChange = useCallback((section: SettingsSection) => {
    setActiveSection(section);
    setImportError(null);
    setResetError(null);
  }, []);

  const handleCurrencyChange = useCallback(
    async (nextCurrency: string) => {
      await updateCurrency(nextCurrency);
    },
    [updateCurrency]
  );

  const handleReset = useCallback(async () => {
    setIsResetting(true);
    setResetError(null);
    clearMessage();

    try {
      await settingsApi.reset();

      startTransition(() => {
        // Reload settings after reset
        void loadSettings();
      });
      setConfirmationInput("");
      setIsResetDialogOpen(false);
      setActiveSection("appearance");
    } catch (err) {
      setResetError(getErrorMessage(err));
    } finally {
      setIsResetting(false);
    }
  }, [loadSettings, clearMessage]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    clearMessage();
    clearError();

    try {
      const exportData = await appDataApi.export();
      const dataStr = JSON.stringify(exportData, null, 2);

      // Open save dialog
      const filePath = await save({
        defaultPath: `jobnest-backup-${new Date().toISOString().split("T")[0]}.json`,
        filters: [
          {
            name: "JSON",
            extensions: ["json"],
          },
        ],
      });

      if (filePath) {
        // Write file to chosen location
        await writeTextFile(filePath, dataStr);
        // Show success message is handled by the component
      }
    } catch (err) {
      // Only show error if it's not a dialog cancellation
      const errorMsg = getErrorMessage(err);
      if (errorMsg && !errorMsg.toLowerCase().includes("cancelled")) {
        clearError();
      }
    } finally {
      setIsExporting(false);
    }
  }, [clearMessage, clearError]);

  const handleImport = useCallback(
    async (file: File) => {
      setIsImporting(true);
      setImportError(null);
      clearMessage();
      clearError();

      try {
        const fileContent = await file.text();
        const importData = JSON.parse(fileContent);

        await appDataApi.import(importData);

        startTransition(() => {
          void loadSettings();
        });
      } catch (err) {
        setImportError(getErrorMessage(err));
      } finally {
        setIsImporting(false);
      }
    },
    [loadSettings, clearMessage, clearError]
  );

  return (
    <>
      <main className="app-window-content mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-10">
        <div className="space-y-5">
          <Button
            className="w-fit gap-2"
            onClick={() => router.push("/")}
            type="button"
            variant="secondary"
          >
            <span aria-hidden="true">←</span>
            <span>Back</span>
          </Button>
          <AppHeader />
        </div>

        <section className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />

          <div className="min-w-0">
            {error || importError ? (
              <p className="mb-6 border-l-2 border-red-500/50 pl-4 text-sm leading-6 text-red-700 dark:text-red-300">
                {error || importError}
              </p>
            ) : null}

            {message ? (
              <p className="mb-6 border-l-2 border-emerald-500/50 pl-4 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
                {message}
              </p>
            ) : null}

            {isLoading || !settings ? (
              <p className="text-sm text-muted-foreground">
                Loading settings...
              </p>
            ) : activeSection === "appearance" ? (
              <AppearanceSettings
                theme={theme}
                onThemeChange={setTheme}
                resolvedTheme={resolvedTheme}
                isThemeReady={isThemeReady}
              />
            ) : activeSection === "applications" ? (
              <ApplicationsSettings
                preferredCurrency={settings.preferredCurrency}
                onCurrencyChange={handleCurrencyChange}
                isSaving={isSavingCurrency}
              />
            ) : (
              <DataManagement
                onExport={handleExport}
                onImport={handleImport}
                onResetClick={() => {
                  setResetError(null);
                  setConfirmationInput("");
                  setIsResetDialogOpen(true);
                }}
                isExporting={isExporting}
                isImporting={isImporting}
              />
            )}
          </div>
        </section>
      </main>

      <ResetConfirmDialog
        isOpen={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        confirmationInput={confirmationInput}
        onConfirmationInputChange={setConfirmationInput}
        onConfirm={handleReset}
        isResetting={isResetting}
        error={resetError}
      />
    </>
  );
}
