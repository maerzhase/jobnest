"use client";

import { Button } from "@acme/ui";
import { useRef } from "react";
import { SettingsSection, SettingBlock } from "./settings-section";

type DataManagementProps = {
  onExport: () => Promise<void>;
  onImport: (file: File) => Promise<void>;
  onResetClick: () => void;
  isExporting: boolean;
  isImporting: boolean;
};

export function DataManagement({
  onExport,
  onImport,
  onResetClick,
  isExporting,
  isImporting,
}: DataManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      await onImport(file);
      e.currentTarget.value = "";
    }
  };

  return (
    <SettingsSection
      category="Data"
      title="Manage your data"
      description="Export your data as a backup or import from a previous backup."
    >
      <SettingBlock
        title="Export"
        description="Download a complete backup of all your data as a JSON file."
      >
        <p className="max-w-xl text-sm leading-6 text-foreground">
          Create a backup of all applications, companies, roles,
          contacts, notes, and settings.
        </p>
        <div>
          <Button
            disabled={isExporting}
            onClick={() => void onExport()}
            type="button"
            variant="secondary"
          >
            {isExporting ? "Exporting..." : "Export data"}
          </Button>
        </div>
      </SettingBlock>

      <div className="mt-8 border-t border-border pt-6">
        <SettingBlock
          title="Import"
          description="Restore data from a previously exported backup file."
        >
          <p className="max-w-xl text-sm leading-6 text-foreground">
            Select a JSON backup file to restore your data. This
            will replace all current data.
          </p>
          <div>
            <input
              ref={fileInputRef}
              accept=".json"
              disabled={isImporting}
              onChange={handleFileSelect}
              style={{ display: "none" }}
              type="file"
              id="import-file-input"
            />
            <Button
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
              type="button"
              variant="secondary"
            >
              {isImporting ? "Importing..." : "Import data"}
            </Button>
          </div>
        </SettingBlock>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <SettingBlock
          title="Reset"
          description="There is no undo for this action. You will need to confirm it by typing the phrase exactly."
        >
          <p className="max-w-xl text-sm leading-6 text-foreground">
            Reset the local database and restore the default
            settings for the app.
          </p>
          <div>
            <Button
              onClick={onResetClick}
              type="button"
              variant="secondary"
            >
              Reset database
            </Button>
          </div>
        </SettingBlock>
      </div>
    </SettingsSection>
  );
}
