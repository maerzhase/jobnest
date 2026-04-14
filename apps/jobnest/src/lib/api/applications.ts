import {
  commands,
  type ApplicationListItem,
  type ApplicationStatusGroup,
  type CreateTrackedApplicationInput,
  type UpdateTrackedApplicationInput,
} from "./bindings";
import { executeLocalApiCall } from "./client";

export type {
  ApplicationListItem,
  ApplicationStatusGroup,
  CreateTrackedApplicationInput,
  UpdateTrackedApplicationInput,
};

export const applicationsApi = {
  list(): Promise<ApplicationStatusGroup[]> {
    return executeLocalApiCall(() => commands.listApplications());
  },

  create(
    input: CreateTrackedApplicationInput
  ): Promise<ApplicationListItem> {
    return executeLocalApiCall(() => commands.createTrackedApplication(input));
  },

  update(
    input: UpdateTrackedApplicationInput
  ): Promise<ApplicationListItem> {
    return executeLocalApiCall(() => commands.updateTrackedApplication(input));
  },

  remove(applicationId: string): Promise<void> {
    return executeLocalApiCall(async () => {
      await commands.deleteTrackedApplication(applicationId);
    });
  },
};
