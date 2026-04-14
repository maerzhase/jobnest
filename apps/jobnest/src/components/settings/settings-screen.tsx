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
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../lib/toast";
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
  const { settings, isLoading, loadSettings, updateCurrency, isSavingCurrency } =
    useSettings();

  const [activeSection, setActiveSection] = useState<SettingsSection>("appearance");
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    setIsThemeReady(true);
  }, []);

  const handleSectionChange = useCallback((section: SettingsSection) => {
    setActiveSection(section);
  }, []);

  const handleCurrencyChange = useCallback(
    async (nextCurrency: string) => {
      await updateCurrency(nextCurrency);
    },
    [updateCurrency]
  );

  const handleReset = useCallback(async () => {
    setIsResetting(true);

    try {
      await settingsApi.reset();

      startTransition(() => {
        // Reload settings after reset
        void loadSettings();
      });
      setConfirmationInput("");
      setIsResetDialogOpen(false);
      setActiveSection("appearance");
      showSuccessToast({
        title: "Data reset",
        description: "Your local database and settings were reset.",
      });
    } catch (err) {
      showErrorToast({
        title: "Could not reset data",
        description: getErrorMessage(err),
      });
    } finally {
      setIsResetting(false);
    }
  }, [loadSettings]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);

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
        await writeTextFile(filePath, dataStr);
        showSuccessToast({
          title: "Backup exported",
          description: "Your data was saved to a JSON backup file.",
        });
      } else {
        showWarningToast({
          title: "Export canceled",
          description: "No backup file was created.",
        });
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      if (errorMsg && !errorMsg.toLowerCase().includes("cancelled")) {
        showErrorToast({
          title: "Could not export data",
          description: errorMsg,
        });
      }
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleImport = useCallback(
    async (file: File) => {
      setIsImporting(true);

      try {
        const fileContent = await file.text();
        const importData = JSON.parse(fileContent);

        await appDataApi.import(importData);

        startTransition(() => {
          void loadSettings();
        });
        showSuccessToast({
          title: "Backup imported",
          description: "Your local data was restored from the backup.",
        });
      } catch (err) {
        showErrorToast({
          title: "Could not import backup",
          description: getErrorMessage(err),
        });
      } finally {
        setIsImporting(false);
      }
    },
    [loadSettings]
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
            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading settings...
              </p>
            ) : !settings ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Settings are unavailable right now.
                </p>
                <Button onClick={() => void loadSettings()} type="button" variant="secondary">
                  Retry
                </Button>
              </div>
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
      />
    </>
  );
}
