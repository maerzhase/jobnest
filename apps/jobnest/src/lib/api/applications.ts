import {
  commands,
  type ApplicationHistoryEvent,
  type ApplicationListItem,
  type ApplicationStatusGroup,
  type CreateTrackedApplicationInput,
  type UpdateApplicationStatusInput,
  type UpdateTrackedApplicationInput,
} from "./bindings";
import { executeLocalApiCall } from "./client";

export type {
  ApplicationHistoryEvent,
  ApplicationListItem,
  ApplicationStatusGroup,
  CreateTrackedApplicationInput,
  UpdateApplicationStatusInput,
  UpdateTrackedApplicationInput,
};

export const applicationsApi = {
  list(): Promise<ApplicationStatusGroup[]> {
    return executeLocalApiCall(() => commands.listApplications());
  },

  listHistory(): Promise<ApplicationHistoryEvent[]> {
    return executeLocalApiCall(() => commands.listApplicationHistory());
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

  updateStatus(input: UpdateApplicationStatusInput): Promise<void> {
    return executeLocalApiCall(async () => {
      await commands.updateApplicationStatus(input);
    });
  },

  remove(applicationId: string): Promise<void> {
    return executeLocalApiCall(async () => {
      await commands.deleteTrackedApplication(applicationId);
    });
  },
};
