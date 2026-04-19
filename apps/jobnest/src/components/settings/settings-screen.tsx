"use client";

import { open, save } from "@tauri-apps/plugin-dialog";
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
  const [isMigratingAttachments, setIsMigratingAttachments] = useState(false);
  const [legacyAttachmentCount, setLegacyAttachmentCount] = useState(0);

  useEffect(() => {
    setIsThemeReady(true);
  }, []);

  const loadAttachmentMigrationStatus = useCallback(async () => {
    try {
      const status = await appDataApi.getAttachmentMigrationStatus();
      setLegacyAttachmentCount(status.legacyAttachmentCount);
    } catch {
      setLegacyAttachmentCount(0);
    }
  }, []);

  useEffect(() => {
    void loadAttachmentMigrationStatus();
  }, [loadAttachmentMigrationStatus]);

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
      setLegacyAttachmentCount(0);
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
      const now = new Date();
      const timestamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
      ].join("-") +
        "_" +
        [
          String(now.getHours()).padStart(2, "0"),
          String(now.getMinutes()).padStart(2, "0"),
          String(now.getSeconds()).padStart(2, "0"),
        ].join("-");
      const filePath = await save({
        defaultPath: `jobnest-backup-${timestamp}.zip`,
        filters: [
          {
            name: "JobNest Backup",
            extensions: ["zip"],
          },
        ],
      });

      if (filePath) {
        const result = await appDataApi.export(filePath);
        if (result.legacyExternalAttachmentCount > 0) {
          showWarningToast({
            title: "Backup exported with linked files",
            description: `${result.legacyExternalAttachmentCount} attachment${result.legacyExternalAttachmentCount === 1 ? "" : "s"} still point to external files and were not bundled. Migrate them to make future backups complete.`,
          });
        } else {
          showSuccessToast({
            title: "Backup exported",
            description: "Your data was saved to a portable backup archive.",
          });
        }
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

  const handleImport = useCallback(async () => {
    setIsImporting(true);

    try {
      const selectedPath = await open({
        title: "Import backup",
        multiple: false,
        filters: [
          {
            name: "JobNest Backups",
            extensions: ["zip", "json"],
          },
        ],
      });

      const filePath = Array.isArray(selectedPath) ? selectedPath[0] : selectedPath;
      if (!filePath) {
        showWarningToast({
          title: "Import canceled",
          description: "No backup file was selected.",
        });
        return;
      }

      const result = await appDataApi.import(filePath);

      startTransition(() => {
        void loadSettings();
      });
      await loadAttachmentMigrationStatus();
      if (result.legacyExternalAttachmentCount > 0) {
        showWarningToast({
          title: "Backup imported with linked files",
          description: `${result.legacyExternalAttachmentCount} attachment${result.legacyExternalAttachmentCount === 1 ? "" : "s"} still rely on external file paths. Run attachment migration to make them portable.`,
        });
      } else {
        showSuccessToast({
          title: "Backup imported",
          description: "Your local data was restored from the backup.",
        });
      }
    } catch (err) {
      showErrorToast({
        title: "Could not import backup",
        description: getErrorMessage(err),
      });
    } finally {
      setIsImporting(false);
    }
  }, [loadAttachmentMigrationStatus, loadSettings]);

  const handleMigrateAttachments = useCallback(async () => {
    setIsMigratingAttachments(true);

    try {
      const result = await appDataApi.migrateLegacyAttachments();
      await loadAttachmentMigrationStatus();

      if (result.failedCount > 0) {
        showWarningToast({
          title: "Attachment migration partially completed",
          description: `Migrated ${result.migratedCount}, skipped ${result.skippedMissingCount} missing, and ${result.failedCount} failed.`,
        });
      } else {
        showSuccessToast({
          title: "Attachments migrated",
          description:
            result.skippedMissingCount > 0
              ? `Migrated ${result.migratedCount} attachment${result.migratedCount === 1 ? "" : "s"} and skipped ${result.skippedMissingCount} missing file${result.skippedMissingCount === 1 ? "" : "s"}.`
              : `Migrated ${result.migratedCount} attachment${result.migratedCount === 1 ? "" : "s"} into JobNest storage.`,
        });
      }
    } catch (err) {
      showErrorToast({
        title: "Could not migrate attachments",
        description: getErrorMessage(err),
      });
    } finally {
      setIsMigratingAttachments(false);
    }
  }, [loadAttachmentMigrationStatus]);

  return (
    <>
      <main className="flex min-h-full flex-col px-6 py-6 sm:px-8 sm:py-8">
        <section className="grid gap-8 xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-12">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />

          <div className="min-w-0 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Preferences
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Settings
                </h2>
              </div>
              <Button
                className="w-fit gap-2"
                onClick={() => router.push("/")}
                type="button"
                variant="secondary"
              >
                <span aria-hidden="true">←</span>
                <span>Applications</span>
              </Button>
            </div>

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
                onMigrateAttachments={handleMigrateAttachments}
                onResetClick={() => {
                  setConfirmationInput("");
                  setIsResetDialogOpen(true);
                }}
                isExporting={isExporting}
                isImporting={isImporting}
                isMigratingAttachments={isMigratingAttachments}
                legacyAttachmentCount={legacyAttachmentCount}
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
