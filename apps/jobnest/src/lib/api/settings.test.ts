import { beforeEach, describe, expect, it, vi } from "vitest";
import { appDataApi } from "./app-data";
import { settingsApi } from "./settings";

const {
  getAppSettingsMock,
  updateAppSettingsMock,
  resetAppDataMock,
  exportAppDataMock,
  importAppDataMock,
} = vi.hoisted(() => ({
  getAppSettingsMock: vi.fn(),
  updateAppSettingsMock: vi.fn(),
  resetAppDataMock: vi.fn(),
  exportAppDataMock: vi.fn(),
  importAppDataMock: vi.fn(),
}));

vi.mock("./bindings", () => ({
  commands: {
    getAppSettings: getAppSettingsMock,
    updateAppSettings: updateAppSettingsMock,
    resetAppData: resetAppDataMock,
    exportAppData: exportAppDataMock,
    importAppData: importAppDataMock,
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

  it("exports app data through the generated bindings", async () => {
    exportAppDataMock.mockResolvedValue({
      companies: [],
      roles: [],
      applications: [],
      contacts: [],
      notes: [],
      tasks: [],
      attachments: [],
      stage_events: [],
      app_settings: {
        preferredCurrency: "EUR",
        updatedAt: "2026-04-14T00:00:00Z",
      },
      export_version: "1",
      exported_at: "2026-04-14T00:00:00Z",
    });

    await appDataApi.export();

    expect(exportAppDataMock).toHaveBeenCalledTimes(1);
  });

  it("imports app data through the generated bindings", async () => {
    const input = {
      companies: [],
      roles: [],
      applications: [],
      contacts: [],
      notes: [],
      tasks: [],
      attachments: [],
      stage_events: [],
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
      app_settings: {
        preferredCurrency: "EUR",
        updatedAt: "2026-04-14T00:00:00Z",
      },
      export_version: "1",
      exported_at: "2026-04-14T00:00:00Z",
    });

    await appDataApi.import(input);

    expect(importAppDataMock).toHaveBeenCalledWith(input);
  });
});
