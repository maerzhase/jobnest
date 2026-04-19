import { beforeEach, describe, expect, it, vi } from "vitest";
import { appDataApi } from "./app-data";
import { settingsApi } from "./settings";

const {
  getAppSettingsMock,
  updateAppSettingsMock,
  resetAppDataMock,
  exportAppDataMock,
  importAppDataMock,
  exportBackupMock,
  importBackupMock,
  getAttachmentMigrationStatusMock,
  migrateLegacyAttachmentsMock,
} = vi.hoisted(() => ({
  getAppSettingsMock: vi.fn(),
  updateAppSettingsMock: vi.fn(),
  resetAppDataMock: vi.fn(),
  exportAppDataMock: vi.fn(),
  importAppDataMock: vi.fn(),
  exportBackupMock: vi.fn(),
  importBackupMock: vi.fn(),
  getAttachmentMigrationStatusMock: vi.fn(),
  migrateLegacyAttachmentsMock: vi.fn(),
}));

vi.mock("./bindings", () => ({
  commands: {
    getAppSettings: getAppSettingsMock,
    updateAppSettings: updateAppSettingsMock,
    resetAppData: resetAppDataMock,
    exportAppData: exportAppDataMock,
    importAppData: importAppDataMock,
    exportBackup: exportBackupMock,
    importBackup: importBackupMock,
    getAttachmentMigrationStatus: getAttachmentMigrationStatusMock,
    migrateLegacyAttachments: migrateLegacyAttachmentsMock,
  },
}));

describe("settingsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads settings through the generated bindings", async () => {
    const settings = {
      preferredCurrency: "EUR",
      updatedAt: "2026-04-14T00:00:00Z",
    };

    getAppSettingsMock.mockResolvedValue(settings);

    await expect(settingsApi.get()).resolves.toEqual(settings);
    expect(getAppSettingsMock).toHaveBeenCalledTimes(1);
  });

  it("updates settings through the generated bindings", async () => {
    const input = { preferredCurrency: "USD" };

    updateAppSettingsMock.mockResolvedValue({
      preferredCurrency: "USD",
      updatedAt: "2026-04-14T00:00:00Z",
    });

    await settingsApi.update(input);

    expect(updateAppSettingsMock).toHaveBeenCalledWith(input);
  });

  it("resets app data through the generated bindings", async () => {
    resetAppDataMock.mockResolvedValue({
      preferredCurrency: "EUR",
      updatedAt: "2026-04-14T00:00:00Z",
    });

    await settingsApi.reset();

    expect(resetAppDataMock).toHaveBeenCalledTimes(1);
  });
});

describe("appDataApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports a backup archive through the generated bindings", async () => {
    exportBackupMock.mockResolvedValue({
      bundledAttachmentCount: 2,
      legacyExternalAttachmentCount: 1,
    });

    await appDataApi.export("/tmp/jobnest-backup.zip");

    expect(exportBackupMock).toHaveBeenCalledWith("/tmp/jobnest-backup.zip");
  });

  it("imports a backup archive through the generated bindings", async () => {
    importBackupMock.mockResolvedValue({
      legacyExternalAttachmentCount: 1,
    });

    await appDataApi.import("/tmp/jobnest-backup.zip");

    expect(importBackupMock).toHaveBeenCalledWith("/tmp/jobnest-backup.zip");
  });

  it("loads legacy attachment migration status", async () => {
    getAttachmentMigrationStatusMock.mockResolvedValue({
      legacyAttachmentCount: 3,
    });

    await expect(appDataApi.getAttachmentMigrationStatus()).resolves.toEqual({
      legacyAttachmentCount: 3,
    });
    expect(getAttachmentMigrationStatusMock).toHaveBeenCalledTimes(1);
  });

  it("runs legacy attachment migration through the generated bindings", async () => {
    migrateLegacyAttachmentsMock.mockResolvedValue({
      migratedCount: 2,
      skippedMissingCount: 1,
      failedCount: 0,
    });

    await appDataApi.migrateLegacyAttachments();

    expect(migrateLegacyAttachmentsMock).toHaveBeenCalledTimes(1);
  });

  it("still exposes raw export data through the generated bindings", async () => {
    exportAppDataMock.mockResolvedValue({
      companies: [],
      roles: [],
      applications: [],
      contacts: [],
      notes: [],
      tasks: [],
      attachments: [],
      stage_events: [],
      application_history_events: [],
      app_settings: {
        preferredCurrency: "EUR",
        updatedAt: "2026-04-14T00:00:00Z",
      },
      export_version: "1",
      exported_at: "2026-04-14T00:00:00Z",
    });

    await appDataApi.exportData();

    expect(exportAppDataMock).toHaveBeenCalledTimes(1);
  });

  it("still imports raw app data through the generated bindings", async () => {
    const input = {
      companies: [],
      roles: [],
      applications: [],
      contacts: [],
      notes: [],
      tasks: [],
      attachments: [],
      stage_events: [],
      application_history_events: null,
      app_settings: null,
    };

    importAppDataMock.mockResolvedValue({
      companies: [],
      roles: [],
      applications: [],
      contacts: [],
      notes: [],
      tasks: [],
      attachments: [],
      stage_events: [],
      application_history_events: [],
      app_settings: {
        preferredCurrency: "EUR",
        updatedAt: "2026-04-14T00:00:00Z",
      },
      export_version: "1",
      exported_at: "2026-04-14T00:00:00Z",
    });

    await appDataApi.importData(input);

    expect(importAppDataMock).toHaveBeenCalledWith(input);
  });
});
