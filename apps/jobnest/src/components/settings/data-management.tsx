"use client";

import { Button } from "@jobnest/ui";
import { SettingsSection, SettingBlock } from "./settings-section";

type DataManagementProps = {
  onExport: () => Promise<void>;
  onImport: () => Promise<void>;
  onMigrateAttachments: () => Promise<void>;
  onResetClick: () => void;
  isExporting: boolean;
  isImporting: boolean;
  isMigratingAttachments: boolean;
  legacyAttachmentCount: number;
};

export function DataManagement({
  onExport,
  onImport,
  onMigrateAttachments,
  onResetClick,
  isExporting,
  isImporting,
  isMigratingAttachments,
  legacyAttachmentCount,
}: DataManagementProps) {
  return (
    <SettingsSection
      category="Data"
      title="Manage your data"
      description="Export a portable backup, restore from a backup, or migrate older linked files into managed storage."
    >
      <SettingBlock
        title="Export"
        description="Create a portable backup archive of your data and managed attachments."
      >
        <p className="max-w-xl text-sm leading-6 text-foreground">
          Save a complete backup archive with your applications, companies,
          notes, settings, and any files already managed by JobNest.
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
          description="Restore data from a portable backup archive or an older JSON backup."
        >
          <p className="max-w-xl text-sm leading-6 text-foreground">
            Choose a backup file to restore your data. Importing replaces
            your current local data.
          </p>
          <div>
            <Button
              disabled={isImporting}
              onClick={() => void onImport()}
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
          title="Attachment migration"
          description="Bring older linked files into JobNest-managed storage."
        >
          <p className="max-w-xl text-sm leading-6 text-foreground">
            {legacyAttachmentCount > 0
              ? `${legacyAttachmentCount} attachment${legacyAttachmentCount === 1 ? "" : "s"} still point to external file paths and may not travel with backups.`
              : "All current attachments are already managed by JobNest."}
          </p>
          <div>
            <Button
              disabled={isMigratingAttachments || legacyAttachmentCount === 0}
              onClick={() => void onMigrateAttachments()}
              type="button"
              variant="secondary"
            >
              {isMigratingAttachments ? "Migrating..." : "Migrate attachments"}
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
