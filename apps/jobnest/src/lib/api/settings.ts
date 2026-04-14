import {
  commands,
  type AppSettings,
  type UpdateAppSettingsInput,
} from "./bindings";
import { executeLocalApiCall } from "./client";

export type { AppSettings, UpdateAppSettingsInput };

export const settingsApi = {
  get(): Promise<AppSettings> {
    return executeLocalApiCall(() => commands.getAppSettings());
  },

  update(input: UpdateAppSettingsInput): Promise<AppSettings> {
    return executeLocalApiCall(() => commands.updateAppSettings(input));
  },

  reset(): Promise<AppSettings> {
    return executeLocalApiCall(() => commands.resetAppData());
  },
};
