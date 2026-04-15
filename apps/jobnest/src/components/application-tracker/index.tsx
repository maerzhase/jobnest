"use client";

import {
  IconLayoutKanban,
  IconListDetails,
} from "@tabler/icons-react";
import { ToggleGroup, ToggleGroupItem } from "@jobnest/ui";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import {
  applicationsApi,
  type ApplicationStatusGroup,
} from "../../lib/api/applications";
import { settingsApi, type AppSettings } from "../../lib/api/settings";
import { getErrorMessage } from "../../lib/error-handler";
import {
  type ApplicationListItem,
  type CreateApplicationValues,
  getFormDefaults,
  mapApplicationToFormValues,
} from "../../lib/form-mappers";
import { formatSalaryValue, parseSalaryValue } from "../../lib/salary";
import type { ApplicationStatus } from "../../lib/status";
import { showErrorToast, showSuccessToast } from "../../lib/toast";
import { ApplicationDeleteAlert } from "./application-delete-alert";
import { ApplicationFormDialog } from "./application-form-dialog";
import { ApplicationsList } from "./applications-list";

type ApplicationDialogState =
  | { mode: "create" }
  | { mode: "edit"; application: ApplicationListItem };

type ApplicationViewMode = "list" | "kanban";

export function ApplicationTracker() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applicationGroups, setApplicationGroups] = useState<
    ApplicationStatusGroup[]
  >([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [viewMode, setViewMode] = useState<ApplicationViewMode>("kanban");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [movingApplicationId, setMovingApplicationId] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [dialogState, setDialogState] = useState<ApplicationDialogState | null>(
    null
  );

  const activeApplication =
    dialogState?.mode === "edit" ? dialogState.application : null;
  const isDialogOpen = dialogState !== null;
  const preferredCurrency = settings?.preferredCurrency ?? "EUR";
  const shouldOpenCreateDialog = searchParams.get("new") === "1";
  const totalApplications = applicationGroups.reduce(
    (count, group) => count + group.applications.length,
    0
  );

  const clearCreateDialogParam = useCallback(() => {
    if (!shouldOpenCreateDialog) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("new");
    const nextQuery = nextSearchParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams, shouldOpenCreateDialog]);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);

    try {
      const groups = await applicationsApi.list();
      setApplicationGroups(groups);
    } catch (error) {
      showErrorToast({
        title: "Could not load applications",
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setIsLoadingSettings(true);

    try {
      const currentSettings = await settingsApi.get();
      setSettings(currentSettings);
    } catch (error) {
      showErrorToast({
        title: "Could not load tracker settings",
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
    void loadSettings();
  }, [loadApplications, loadSettings]);

  useEffect(() => {
    if (isDialogOpen) {
      void loadSettings();
    }
  }, [isDialogOpen, loadSettings]);

  useEffect(() => {
    if (!shouldOpenCreateDialog || isDialogOpen) {
      return;
    }

    setIsDeleteAlertOpen(false);
    setDialogState({ mode: "create" });
  }, [isDialogOpen, shouldOpenCreateDialog]);

  const closeDialog = useCallback(
    (force = false) => {
      if (!force && (isSubmitting || isDeleting)) {
        return;
      }

      setIsDeleteAlertOpen(false);
      setDialogState(null);
      clearCreateDialogParam();
    },
    [clearCreateDialogParam, isDeleting, isSubmitting]
  );

  const openEditDialog = useCallback((application: ApplicationListItem) => {
    setIsDeleteAlertOpen(false);
    setDialogState({ mode: "edit", application });
  }, []);

  const getFormInitialValues = useCallback((): CreateApplicationValues => {
    if (activeApplication) {
      return mapApplicationToFormValues(activeApplication, preferredCurrency);
    }
    return getFormDefaults(preferredCurrency);
  }, [activeApplication, preferredCurrency]);

  const refreshApplications = useCallback(() => {
    startTransition(() => {
      void loadApplications();
    });
  }, [loadApplications]);

  const onSubmit = useCallback(
    async (values: CreateApplicationValues) => {
      setIsSubmitting(true);

      try {
        if (activeApplication) {
          await applicationsApi.update({
            applicationId: activeApplication.id,
            jobPostUrl: values.jobPostUrl,
            companyName: values.companyName,
            roleTitle: values.roleTitle,
            salaryExpectation: formatSalaryValue(
              values.salaryExpectation,
              values.salaryExpectationCurrency || preferredCurrency
            ) ?? null,
            salaryOffer: formatSalaryValue(
              values.salaryOffer,
              values.salaryOfferCurrency || preferredCurrency
            ) ?? null,
            status: values.status,
            notes: values.notes || null,
          });

          closeDialog();
          refreshApplications();
          showSuccessToast({
            title: "Application updated",
            description: "Your changes were saved.",
          });
          return;
        }

        await applicationsApi.create({
          jobPostUrl: values.jobPostUrl,
          companyName: values.companyName,
          roleTitle: values.roleTitle,
          salaryExpectation: formatSalaryValue(
            values.salaryExpectation,
            values.salaryExpectationCurrency || preferredCurrency
          ) ?? null,
          salaryOffer: formatSalaryValue(
            values.salaryOffer,
            values.salaryOfferCurrency || preferredCurrency
          ) ?? null,
          status: values.status,
          appliedAt: null,
          firstResponseAt: null,
          notes: values.notes || null,
        });

        closeDialog();
        refreshApplications();
        showSuccessToast({
          title: "Application saved",
          description: "The role was added to your tracker.",
        });
      } catch (error) {
        showErrorToast({
          title: activeApplication
            ? "Could not update application"
            : "Could not save application",
          description: getErrorMessage(error),
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [activeApplication, closeDialog, preferredCurrency, refreshApplications]
  );

  const handleDelete = useCallback(async () => {
    if (!activeApplication) {
      return;
    }

    setIsDeleting(true);

    try {
      await applicationsApi.remove(activeApplication.id);
      setIsDeleteAlertOpen(false);
      closeDialog(true);
      refreshApplications();
      showSuccessToast({
        title: "Application deleted",
        description: "The role was removed from your tracker.",
      });
    } catch (error) {
      showErrorToast({
        title: "Could not delete application",
        description: getErrorMessage(error),
      });
    } finally {
      setIsDeleting(false);
    }
  }, [activeApplication, closeDialog, refreshApplications]);

  const handleMoveToStatus = useCallback(
    async (application: ApplicationListItem, status: ApplicationStatus) => {
      if (application.status === status) {
        return;
      }

      setMovingApplicationId(application.id);

      const previousGroups = applicationGroups;

      setApplicationGroups((currentGroups) => {
        const nextGroups = currentGroups
          .map((group) => {
            const applications = group.applications.filter(
              (item) => item.id !== application.id
            );

            if (group.status === status) {
              return {
                ...group,
                applications: [{ ...application, status }, ...applications],
              };
            }

            return {
              ...group,
              applications,
            };
          })
          .filter((group) => group.applications.length > 0);

        if (nextGroups.some((group) => group.status === status)) {
          return nextGroups;
        }

        return [
          ...nextGroups,
          {
            status,
            applications: [{ ...application, status }],
          },
        ];
      });

      try {
        const expectation = parseSalaryValue(
          application.salaryExpectation,
          preferredCurrency
        );
        const offer = parseSalaryValue(application.salaryOffer, preferredCurrency);

        await applicationsApi.update({
          applicationId: application.id,
          status,
          jobPostUrl: application.jobPostUrl ?? "",
          companyName: application.companyName,
          roleTitle: application.roleTitle,
          salaryExpectation: formatSalaryValue(
            expectation.amount,
            expectation.currency
          ) ?? null,
          salaryOffer:
            formatSalaryValue(offer.amount, offer.currency) ?? null,
          notes: application.notes ?? null,
        });
        refreshApplications();
      } catch (error) {
        setApplicationGroups(previousGroups);
        showErrorToast({
          title: "Could not update status",
          description: getErrorMessage(error),
        });
      } finally {
        setMovingApplicationId(null);
      }
    },
    [applicationGroups, preferredCurrency, refreshApplications]
  );

  return (
    <>
      <section className="flex h-full min-h-0 w-full flex-col">
        <div className="sticky top-0 z-10 w-full border-b border-border/40 bg-card">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
            <div>
              <h2>
                Applications ({totalApplications})
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <ToggleGroup
                aria-label="Application view"
                onValueChange={(nextView) => {
                  if (nextView) {
                    setViewMode(nextView);
                  }
                }}
                size="sm"
                value={viewMode}
              >
                <ToggleGroupItem
                  aria-label="Show applications as a kanban board"
                  title="Kanban view"
                  value="kanban"
                >
                  <IconLayoutKanban aria-hidden="true" className="size-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  aria-label="Show applications as a list"
                  title="List view"
                  value="list"
                >
                  <IconListDetails aria-hidden="true" className="size-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>

        <div
          className={`px-4 pt-4 sm:px-5 ${
            viewMode === "kanban"
              ? "flex min-h-0 flex-1 flex-col overflow-hidden"
              : ""
          }`}
        >
          <ApplicationsList
            groups={applicationGroups}
            isLoading={isLoading}
            onEdit={openEditDialog}
            onMoveToStatus={handleMoveToStatus}
            movingApplicationId={movingApplicationId}
            viewMode={viewMode}
          />
        </div>
      </section>

      <ApplicationDeleteAlert
        isOpen={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      <ApplicationFormDialog
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
        initialValues={getFormInitialValues()}
        onSubmit={onSubmit}
        onDelete={() => setIsDeleteAlertOpen(true)}
        isSubmitting={isSubmitting}
        isDeleting={isDeleting}
        isLoadingSettings={isLoadingSettings}
        isEditing={activeApplication !== null}
      />
    </>
  );
}
