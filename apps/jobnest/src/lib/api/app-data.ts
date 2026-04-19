import {
  commands,
  type AttachmentMigrationResult,
  type AttachmentMigrationStatus,
  type ExportBackupResult,
  type ExportData,
  type ImportBackupResult,
  type ImportDataInput,
} from "./bindings";
import { executeLocalApiCall } from "./client";

export type {
  AttachmentMigrationResult,
  AttachmentMigrationStatus,
  ExportBackupResult,
  ExportData,
  ImportBackupResult,
  ImportDataInput,
};

export const appDataApi = {
  export(filePath: string): Promise<ExportBackupResult> {
    return executeLocalApiCall(() => commands.exportBackup(filePath));
  },

  import(filePath: string): Promise<ImportBackupResult> {
    return executeLocalApiCall(() => commands.importBackup(filePath));
  },

  exportData(): Promise<ExportData> {
    return executeLocalApiCall(() => commands.exportAppData());
  },

  importData(input: ImportDataInput): Promise<ExportData> {
    return executeLocalApiCall(() => commands.importAppData(input));
  },

  getAttachmentMigrationStatus(): Promise<AttachmentMigrationStatus> {
    return executeLocalApiCall(() => commands.getAttachmentMigrationStatus());
  },

  migrateLegacyAttachments(): Promise<AttachmentMigrationResult> {
    return executeLocalApiCall(() => commands.migrateLegacyAttachments());
  },
};
