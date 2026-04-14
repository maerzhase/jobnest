import {
  commands,
  type ExportData,
  type ImportDataInput,
} from "./bindings";
import { executeLocalApiCall } from "./client";

export type { ExportData, ImportDataInput };

export const appDataApi = {
  export(): Promise<ExportData> {
    return executeLocalApiCall(() => commands.exportAppData());
  },

  import(input: ImportDataInput): Promise<ExportData> {
    return executeLocalApiCall(() => commands.importAppData(input));
  },
};
