"use client";

import {
  Button,
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogDescriptionText,
  DialogFooter,
  DialogHeader,
  DialogTitleText,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTriggerButton,
  SelectValueText,
} from "@acme/ui";
import { invoke } from "@tauri-apps/api/core";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { startTransition, useCallback, useEffect, useState } from "react";
import {
  type AppSettings,
  CURRENCY_OPTIONS,
  SETTINGS_SECTIONS,
  type SettingsSection,
  THEME_OPTIONS,
} from "../lib/settings";
import { AppHeader } from "./app-header";

const RESET_CONFIRMATION_TEXT = "clear my data";

export function SettingsScreen() {
  const router = useRouter();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("appearance");
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
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

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setSettingsError(null);

    try {
      const currentSettings = await invoke<AppSettings>("get_app_settings");
      setSettings(currentSettings);
    } catch (error) {
      setSettingsError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function handleCurrencyChange(nextCurrency: string) {
    if (!settings || nextCurrency === settings.preferredCurrency) {
      return;
    }

    setIsSavingCurrency(true);
    setSettingsError(null);
    setSaveMessage(null);

    try {
      const updatedSettings = await invoke<AppSettings>("update_app_settings", {
        input: {
          preferredCurrency: nextCurrency,
        },
      });

      startTransition(() => {
        setSettings(updatedSettings);
      });
      setSaveMessage("Preferred currency updated.");
    } catch (error) {
      setSettingsError(getErrorMessage(error));
    } finally {
      setIsSavingCurrency(false);
    }
  }

  async function handleReset() {
    setIsResetting(true);
    setResetError(null);
    setSaveMessage(null);

    try {
      const updatedSettings = await invoke<AppSettings>("reset_app_data");

      startTransition(() => {
        setSettings(updatedSettings);
      });
      setConfirmationInput("");
      setIsResetDialogOpen(false);
      setActiveSection("appearance");
      setSaveMessage("Local database reset complete.");
    } catch (error) {
      setResetError(getErrorMessage(error));
    } finally {
      setIsResetting(false);
    }
  }

  async function handleExport() {
    setIsExporting(true);
    setSaveMessage(null);
    setSettingsError(null);

    try {
      const exportData = await invoke("export_app_data");

      // Create a blob with the exported data
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Create a link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `jobnest-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSaveMessage("Data exported successfully.");
    } catch (error) {
      setSettingsError(getErrorMessage(error));
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImport(file: File) {
    setIsImporting(true);
    setImportError(null);
    setSaveMessage(null);
    setSettingsError(null);

    try {
      const fileContent = await file.text();
      const importData = JSON.parse(fileContent);

      await invoke("import_app_data", { input: importData });

      startTransition(() => {
        loadSettings();
      });

      setSaveMessage("Data imported successfully.");
    } catch (error) {
      setImportError(getErrorMessage(error));
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <>
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
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
          <aside className="lg:border-r lg:border-border lg:pr-8">
            <div className="mb-5">
              <h2 className="text-base font-semibold tracking-tight">
                Settings
              </h2>
              <p className="text-muted-foreground mt-1 text-sm leading-6">
                Choose a section from the sidebar.
              </p>
            </div>

            <nav aria-label="Settings sections" className="grid gap-1">
              {SETTINGS_SECTIONS.map((section) => {
                const isActive = section.value === activeSection;

                return (
                  <button
                    className={[
                      "border-l px-0 py-3 pl-4 text-left transition-colors",
                      isActive
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                    ].join(" ")}
                    key={section.value}
                    onClick={() => {
                      setActiveSection(section.value);
                      setImportError(null);
                      setResetError(null);
                    }}
                    type="button"
                  >
                    <span className="block text-sm font-medium">
                      {section.label}
                    </span>
                    <span
                      className={[
                        "mt-1 block text-xs leading-5",
                        isActive
                          ? "text-foreground/65"
                          : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {section.description}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0">
            {settingsError || importError ? (
              <p className="mb-6 border-l-2 border-red-500/50 pl-4 text-sm leading-6 text-red-700 dark:text-red-300">
                {settingsError || importError}
              </p>
            ) : null}

            {saveMessage ? (
              <p className="mb-6 border-l-2 border-emerald-500/50 pl-4 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
                {saveMessage}
              </p>
            ) : null}

            {isLoading || !settings ? (
              <p className="text-sm text-muted-foreground">
                Loading settings...
              </p>
            ) : activeSection === "appearance" ? (
              <section className="max-w-3xl">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em]">
                    Appearance
                  </p>
                  <h3 className="text-2xl font-semibold tracking-tight">
                    Theme
                  </h3>
                  <p className="text-muted-foreground text-sm leading-6">
                    Choose how JobNest should appear across the app windows.
                  </p>
                </div>

                <div className="mt-10 border-t border-border pt-8">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Color theme
                      </h4>
                      <p className="text-muted-foreground mt-3 text-sm leading-6">
                        Use the system preference or force a light or dark
                        interface.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Field label="Theme" name="theme">
                        <Select
                          disabled={!isThemeReady}
                          name="theme"
                          onValueChange={(value) => {
                            if (value) {
                              setTheme(value);
                            }
                          }}
                          value={isThemeReady ? theme : "system"}
                        >
                          <SelectTriggerButton>
                            <SelectValueText placeholder="Choose a theme" />
                          </SelectTriggerButton>
                          <SelectContent>
                            {THEME_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <p className="text-muted-foreground text-sm leading-6">
                        Active appearance:{" "}
                        <span className="font-medium text-foreground">
                          {resolvedTheme
                            ? resolvedTheme.charAt(0).toUpperCase() +
                              resolvedTheme.slice(1)
                            : "System"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            ) : activeSection === "applications" ? (
              <section className="max-w-3xl">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em]">
                    Applications
                  </p>
                  <h3 className="text-2xl font-semibold tracking-tight">
                    New application defaults
                  </h3>
                  <p className="text-muted-foreground text-sm leading-6">
                    Choose a fixed currency for salary fields so the create
                    dialog can keep amounts consistent without free-typing the
                    currency each time.
                  </p>
                </div>

                <div className="mt-10 border-t border-border pt-8">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Currency
                      </h4>
                      <p className="text-muted-foreground mt-3 text-sm leading-6">
                        Used as the fixed currency in salary expectation and
                        offer inputs.
                      </p>
                    </div>

                    <Field label="Preferred currency" name="preferredCurrency">
                      <Select
                        disabled={isSavingCurrency}
                        name="preferredCurrency"
                        onValueChange={(value) => {
                          if (value) {
                            void handleCurrencyChange(value);
                          }
                        }}
                        value={settings.preferredCurrency}
                      >
                        <SelectTriggerButton>
                          <SelectValueText placeholder="Choose a currency" />
                        </SelectTriggerButton>
                        <SelectContent>
                          {CURRENCY_OPTIONS.map((currency) => (
                            <SelectItem
                              key={currency.value}
                              value={currency.value}
                            >
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>

                <div className="mt-8 border-t border-border pt-6">
                  <p className="text-sm font-medium">Current behavior</p>
                  <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
                    Salary inputs in the create dialog now use{" "}
                    <span className="font-medium text-foreground">
                      {settings.preferredCurrency}
                    </span>{" "}
                    as a fixed currency label and store the amount with that
                    code.
                  </p>
                </div>
              </section>
            ) : (
              <section className="max-w-3xl">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em]">
                    Data
                  </p>
                  <h3 className="text-2xl font-semibold tracking-tight">
                    Manage your data
                  </h3>
                  <p className="text-muted-foreground text-sm leading-6">
                    Export your data as a backup or import from a previous backup.
                  </p>
                </div>

                <div className="mt-10 border-t border-border pt-8">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Export
                      </h4>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        Download a complete backup of all your data as a JSON
                        file.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <p className="max-w-xl text-sm leading-6 text-foreground">
                        Create a backup of all applications, companies, roles,
                        contacts, notes, and settings.
                      </p>
                      <div>
                        <Button
                          disabled={isExporting}
                          onClick={() => void handleExport()}
                          type="button"
                          variant="secondary"
                        >
                          {isExporting ? "Exporting..." : "Export data"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-border pt-6">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Import
                      </h4>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        Restore data from a previously exported backup file.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <p className="max-w-xl text-sm leading-6 text-foreground">
                        Select a JSON backup file to restore your data. This
                        will replace all current data.
                      </p>
                      <div>
                        <input
                          accept=".json"
                          disabled={isImporting}
                          onChange={(e) => {
                            const file = e.currentTarget.files?.[0];
                            if (file) {
                              void handleImport(file);
                              e.currentTarget.value = "";
                            }
                          }}
                          style={{ display: "none" }}
                          type="file"
                          id="import-file-input"
                        />
                        <Button
                          disabled={isImporting}
                          onClick={() =>
                            document.getElementById("import-file-input")?.click()
                          }
                          type="button"
                          variant="secondary"
                        >
                          {isImporting ? "Importing..." : "Import data"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-border pt-6">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Reset
                      </h4>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        There is no undo for this action. You will need to
                        confirm it by typing the phrase exactly.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <p className="max-w-xl text-sm leading-6 text-foreground">
                        Reset the local database and restore the default
                        settings for the app.
                      </p>
                      <div>
                        <Button
                          onClick={() => {
                            setResetError(null);
                            setConfirmationInput("");
                            setIsResetDialogOpen(true);
                          }}
                          type="button"
                          variant="secondary"
                        >
                          Reset database
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </section>
      </main>

      <Dialog
        onOpenChange={(open) => {
          if (!open && isResetting) {
            return;
          }

          setIsResetDialogOpen(open);
          if (!open) {
            setConfirmationInput("");
            setResetError(null);
          }
        }}
        open={isResetDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em]">
              Confirm reset
            </p>
            <DialogTitleText>Reset the local database</DialogTitleText>
            <DialogDescriptionText>
              Type{" "}
              <span className="font-medium text-foreground">
                {RESET_CONFIRMATION_TEXT}
              </span>{" "}
              to confirm. This removes all stored application data and restores
              the default settings.
            </DialogDescriptionText>
          </DialogHeader>

          <div className="grid gap-5">
            <Field
              description="This must match the confirmation phrase exactly."
              error={resetError}
              label="Confirmation text"
              name="resetConfirmation"
            >
              <Input
                autoComplete="off"
                onChange={(event) => setConfirmationInput(event.target.value)}
                placeholder={RESET_CONFIRMATION_TEXT}
                value={confirmationInput}
              />
            </Field>

            <DialogFooter>
              <DialogCloseButton disabled={isResetting} type="button">
                Cancel
              </DialogCloseButton>
              <Button
                disabled={
                  isResetting ||
                  confirmationInput.trim() !== RESET_CONFIRMATION_TEXT
                }
                onClick={() => void handleReset()}
                type="button"
                variant="secondary"
              >
                {isResetting ? "Resetting..." : "Clear my data"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while talking to the local database.";
}
