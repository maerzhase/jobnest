"use client";

import { Button } from "@jobnest/ui";
import { startTransition, useCallback, useEffect, useState } from "react";
import { applicationsApi } from "../../lib/api/applications";
import { settingsApi, type AppSettings } from "../../lib/api/settings";
import { getErrorMessage } from "../../lib/error-handler";
import {
  type ApplicationListItem,
  type CreateApplicationValues,
  getFormDefaults,
  mapApplicationToFormValues,
} from "../../lib/form-mappers";
import { formatSalaryValue } from "../../lib/salary";
import { ApplicationDeleteAlert } from "./application-delete-alert";
import { ApplicationFormDialog } from "./application-form-dialog";
import { ApplicationsList } from "./applications-list";

type ApplicationDialogState =
  | { mode: "create" }
  | { mode: "edit"; application: ApplicationListItem };

export function ApplicationTracker() {
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [dialogState, setDialogState] = useState<ApplicationDialogState | null>(
    null
  );

  const activeApplication =
    dialogState?.mode === "edit" ? dialogState.application : null;
  const isDialogOpen = dialogState !== null;
  const preferredCurrency = settings?.preferredCurrency ?? "EUR";

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const items = await applicationsApi.list();
      setApplications(items);
    } catch (error) {
      setLoadError(getErrorMessage(error));
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
      setLoadError(getErrorMessage(error));
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

  const closeDialog = useCallback(
    (force = false) => {
      if (!force && (isSubmitting || isDeleting)) {
        return;
      }

      setSubmitError(null);
      setIsDeleteAlertOpen(false);
      setDialogState(null);
    },
    [isDeleting, isSubmitting]
  );

  const openCreateDialog = useCallback(() => {
    setSubmitError(null);
    setIsDeleteAlertOpen(false);
    setDialogState({ mode: "create" });
  }, []);

  const openEditDialog = useCallback((application: ApplicationListItem) => {
    setSubmitError(null);
    setIsDeleteAlertOpen(false);
    setDialogState({ mode: "edit", application });
  }, []);

  const getFormInitialValues = useCallback((): CreateApplicationValues => {
    if (activeApplication) {
      return mapApplicationToFormValues(activeApplication, preferredCurrency);
    }
    return getFormDefaults(preferredCurrency);
  }, [activeApplication, preferredCurrency]);

  const onSubmit = useCallback(
    async (values: CreateApplicationValues) => {
      setSubmitError(null);
      setIsSubmitting(true);

      try {
        if (activeApplication) {
          const updated = await applicationsApi.update({
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
          startTransition(() => {
            setApplications((current) =>
              current.map((application) =>
                application.id === updated.id ? updated : application
              )
            );
          });
          return;
        }

        const created = await applicationsApi.create({
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
        startTransition(() => {
          setApplications((current) => [created, ...current]);
        });
      } catch (error) {
        setSubmitError(getErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
    },
    [activeApplication, closeDialog, preferredCurrency]
  );

  const handleDelete = useCallback(async () => {
    if (!activeApplication) {
      return;
    }

    setSubmitError(null);
    setIsDeleting(true);

    try {
      await applicationsApi.remove(activeApplication.id);
      setIsDeleteAlertOpen(false);
      closeDialog(true);
      startTransition(() => {
        setApplications((current) =>
          current.filter((application) => application.id !== activeApplication.id)
        );
      });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }, [activeApplication, closeDialog]);

  return (
    <>
      <section>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Applications ({applications.length})
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={openCreateDialog} type="button">
              Add application
            </Button>
          </div>
        </div>

        {loadError ? (
          <p className="rounded-md border border-red-500/30 bg-red-500/8 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {loadError}
          </p>
        ) : null}

        <ApplicationsList
          applications={applications}
          isLoading={isLoading}
          onEdit={openEditDialog}
        />
      </section>

      <ApplicationDeleteAlert
        isOpen={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        error={submitError}
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
        error={submitError}
        isEditing={activeApplication !== null}
      />
    </>
  );
}
