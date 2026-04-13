"use client";

import {
  AlertDialog,
  AlertDialogCancelButton,
  AlertDialogContent,
  AlertDialogDescriptionText,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitleText,
  Button,
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogDescriptionText,
  DialogFooter,
  DialogHeader,
  DialogTitleText,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTriggerButton,
  SelectValueText,
  cn,
} from "@acme/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoke } from "@tauri-apps/api/core";
import { startTransition, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { type AppSettings, CURRENCY_OPTIONS } from "../lib/settings";

const createApplicationSchema = z.object({
  jobPostUrl: z.string().trim().url("Enter a valid job post URL"),
  companyName: z.string().trim().min(1, "Company is required"),
  roleTitle: z.string().trim().min(1, "Role title is required"),
  salaryExpectation: z.string().optional(),
  salaryExpectationCurrency: z.string().trim().min(1, "Choose a currency"),
  salaryOffer: z.string().optional(),
  salaryOfferCurrency: z.string().trim().min(1, "Choose a currency"),
  status: z.enum(["saved", "applied", "interview", "offer", "rejected"]),
  notes: z.string().optional(),
});

type CreateApplicationValues = z.infer<typeof createApplicationSchema>;

type ApplicationListItem = {
  id: string;
  companyName: string;
  roleTitle: string;
  jobPostUrl: string | null;
  salaryExpectation: string | null;
  salaryOffer: string | null;
  status: string;
  appliedAt: string | null;
  firstResponseAt: string | null;
  notes: string | null;
  updatedAt: string;
  archivedAt: string | null;
};

const formDefaults: CreateApplicationValues = {
  jobPostUrl: "",
  companyName: "",
  roleTitle: "",
  salaryExpectation: "",
  salaryExpectationCurrency: "EUR",
  salaryOffer: "",
  salaryOfferCurrency: "EUR",
  status: "saved",
  notes: "",
};

const STATUS_OPTIONS = [
  { label: "Saved", value: "saved" },
  { label: "Applied", value: "applied" },
  { label: "Interview", value: "interview" },
  { label: "Offer", value: "offer" },
  { label: "Rejected", value: "rejected" },
] as const;

type ApplicationStatus = (typeof STATUS_OPTIONS)[number]["value"];

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
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [dialogState, setDialogState] = useState<ApplicationDialogState | null>(
    null,
  );

  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<CreateApplicationValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(createApplicationSchema),
  });

  const selectedStatus = watch("status");
  const selectedSalaryExpectationCurrency = watch("salaryExpectationCurrency");
  const selectedSalaryOfferCurrency = watch("salaryOfferCurrency");
  const activeApplication =
    dialogState?.mode === "edit" ? dialogState.application : null;
  const isDialogOpen = dialogState !== null;
  const preferredCurrency = settings?.preferredCurrency ?? "EUR";

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const items = await invoke<ApplicationListItem[]>("list_applications");
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
      const currentSettings = await invoke<AppSettings>("get_app_settings");
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

  const closeDialog = useCallback((force = false) => {
    if (!force && (isSubmitting || isDeleting)) {
      return;
    }

    setSubmitError(null);
    setIsDeleteAlertOpen(false);
    setDialogState(null);
    reset(getFormDefaults(preferredCurrency));
  }, [isDeleting, isSubmitting, preferredCurrency, reset]);

  const openCreateDialog = useCallback(() => {
    setSubmitError(null);
    setIsDeleteAlertOpen(false);
    reset(getFormDefaults(preferredCurrency));
    setDialogState({ mode: "create" });
  }, [preferredCurrency, reset]);

  const openEditDialog = useCallback(
    (application: ApplicationListItem) => {
      setSubmitError(null);
      setIsDeleteAlertOpen(false);
      reset(mapApplicationToFormValues(application, preferredCurrency));
      setDialogState({ mode: "edit", application });
    },
    [preferredCurrency, reset],
  );

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      if (activeApplication) {
        const updated = await invoke<ApplicationListItem>(
          "update_tracked_application",
          {
            input: {
              applicationId: activeApplication.id,
              jobPostUrl: values.jobPostUrl,
              companyName: values.companyName,
              roleTitle: values.roleTitle,
              salaryExpectation: formatSalaryValue(
                values.salaryExpectation,
                values.salaryExpectationCurrency || preferredCurrency,
              ),
              salaryOffer: formatSalaryValue(
                values.salaryOffer,
                values.salaryOfferCurrency || preferredCurrency,
              ),
              status: values.status,
              notes: values.notes,
            },
          }
        );

        closeDialog();
        startTransition(() => {
          setApplications((current) =>
            current.map((application) =>
              application.id === updated.id ? updated : application,
            ),
          );
        });
        return;
      }

      const created = await invoke<ApplicationListItem>("create_tracked_application", {
        input: {
          jobPostUrl: values.jobPostUrl,
          companyName: values.companyName,
          roleTitle: values.roleTitle,
          salaryExpectation: formatSalaryValue(
            values.salaryExpectation,
            values.salaryExpectationCurrency || preferredCurrency,
          ),
          salaryOffer: formatSalaryValue(
            values.salaryOffer,
            values.salaryOfferCurrency || preferredCurrency,
          ),
          status: values.status,
          notes: values.notes,
        },
      });

      closeDialog();
      startTransition(() => {
        setApplications((current) => [created, ...current]);
      });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  const handleDelete = useCallback(async () => {
    if (!activeApplication) {
      return;
    }

    setSubmitError(null);
    setIsDeleting(true);

    try {
      await invoke("delete_tracked_application", {
        applicationId: activeApplication.id,
      });
      setIsDeleteAlertOpen(false);
      closeDialog(true);
      startTransition(() => {
        setApplications((current) =>
          current.filter((application) => application.id !== activeApplication.id),
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

        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading applications...
          </p>
        ) : applications.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-5 py-10 text-center">
            <p className="text-base font-medium">Nothing tracked yet</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Add your first application to start building your local history.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((application) => (
              <li
                className="group rounded-lg border border-border bg-background/70 transition-all hover:border-foreground/30 hover:shadow-md"
                key={application.id}
              >
                <button
                  className="w-full px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={() => openEditDialog(application)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold leading-tight truncate">
                        {application.roleTitle}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {application.companyName}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className={cn(
                      "inline-flex rounded-sm px-2 py-1 text-xs font-semibold uppercase tracking-wide",
                      getStatusStyles(application.status)
                    )}>
                      {formatStatusLabel(application.status)}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    {application.salaryExpectation || application.salaryOffer ? (
                      <p className="line-clamp-1">
                        {[
                          application.salaryExpectation
                            ? `${application.salaryExpectation}`
                            : null,
                          application.salaryOffer
                            ? `${application.salaryOffer}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" / ")}
                      </p>
                    ) : null}
                    <p className="line-clamp-1">{getTimelineLabel(application)}</p>
                    {application.notes ? (
                      <p className="line-clamp-2">{application.notes}</p>
                    ) : null}
                  </div>
                </button>
                {application.jobPostUrl ? (
                  <div className="px-4 pb-3 pt-1">
                    <a
                      className="text-xs font-medium text-foreground/70 hover:text-foreground transition-colors"
                      href={application.jobPostUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open post →
                    </a>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <AlertDialog
        onOpenChange={setIsDeleteAlertOpen}
        open={isDeleteAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitleText>Delete application</AlertDialogTitleText>
            <AlertDialogDescriptionText>
              Are you sure you want to delete this application? This action cannot be undone.
            </AlertDialogDescriptionText>
          </AlertDialogHeader>

          {submitError ? (
            <p className="rounded-md border border-red-500/30 bg-red-500/8 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {submitError}
            </p>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancelButton disabled={isDeleting} type="button">
              Cancel
            </AlertDialogCancelButton>
            <Button
              className="border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-300"
              disabled={isDeleting}
              onClick={handleDelete}
              type="button"
              variant="secondary"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
        open={isDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em]">
              {activeApplication ? "Application details" : "New application"}
            </p>
            <DialogTitleText>
              {activeApplication ? "Edit tracked application" : "Add a role to track"}
            </DialogTitleText>
            <DialogDescriptionText>
              {activeApplication
                ? "Review this application, update the details, or remove it from your tracker."
                : "Capture the core details for this application and keep the timeline local."}
            </DialogDescriptionText>
          </DialogHeader>

          <form className="grid gap-5" onSubmit={onSubmit}>
            <Field
              error={errors.jobPostUrl?.message}
              label="Link to job post"
              name="jobPostUrl"
            >
              <Input
                autoComplete="url"
                autoCorrect="off"
                invalid={Boolean(errors.jobPostUrl)}
                placeholder="https://jobs.example.com/role"
                {...register("jobPostUrl")}
              />
            </Field>

            <Field
              error={errors.companyName?.message}
              label="Company"
              name="companyName"
              required
            >
              <Input
                autoComplete="organization"
                invalid={Boolean(errors.companyName)}
                placeholder="Acme Inc."
                {...register("companyName")}
              />
            </Field>

            <Field
              error={errors.roleTitle?.message}
              label="Role"
              name="roleTitle"
              required
            >
              <Input
                autoComplete="organization-title"
                invalid={Boolean(errors.roleTitle)}
                placeholder="Product Designer"
                {...register("roleTitle")}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                error={
                  errors.salaryExpectation?.message ??
                  errors.salaryExpectationCurrency?.message
                }
                label="Salary expectation"
                name="salaryExpectation"
              >
                <div className={cn(
                  "grid grid-cols-[124px_minmax(0,1fr)] rounded-md border bg-background shadow-sm transition-[border-color,box-shadow] focus-within:ring-3",
                  errors.salaryExpectation || errors.salaryExpectationCurrency
                    ? "border-red-500/50 focus-within:border-red-600 focus-within:ring-red-500/25"
                    : "border-input focus-within:border-foreground focus-within:ring-ring/25"
                )}>
                  <Select
                    name="salaryExpectationCurrency"
                    onValueChange={(value) => {
                      if (value) {
                        setValue("salaryExpectationCurrency", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    value={selectedSalaryExpectationCurrency}
                  >
                    <SelectTriggerButton className="h-11 rounded-none rounded-l-md border-0 border-r border-input shadow-none focus-visible:ring-0">
                      <SelectValueText placeholder="Currency" />
                    </SelectTriggerButton>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="border-0 shadow-none focus-visible:ring-0"
                    inputMode="decimal"
                    placeholder="60000"
                    {...register("salaryExpectation")}
                  />
                </div>
              </Field>

              <Field
                error={
                  errors.salaryOffer?.message ??
                  errors.salaryOfferCurrency?.message
                }
                label="Salary offer"
                name="salaryOffer"
              >
                <div className={cn(
                  "grid grid-cols-[124px_minmax(0,1fr)] rounded-md border bg-background shadow-sm transition-[border-color,box-shadow] focus-within:ring-3",
                  errors.salaryOffer || errors.salaryOfferCurrency
                    ? "border-red-500/50 focus-within:border-red-600 focus-within:ring-red-500/25"
                    : "border-input focus-within:border-foreground focus-within:ring-ring/25"
                )}>
                  <Select
                    name="salaryOfferCurrency"
                    onValueChange={(value) => {
                      if (value) {
                        setValue("salaryOfferCurrency", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    value={selectedSalaryOfferCurrency}
                  >
                    <SelectTriggerButton className="h-11 rounded-none rounded-l-md border-0 border-r border-input shadow-none focus-visible:ring-0">
                      <SelectValueText placeholder="Currency" />
                    </SelectTriggerButton>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="border-0 shadow-none focus-visible:ring-0"
                    inputMode="decimal"
                    placeholder="58000"
                    {...register("salaryOffer")}
                  />
                </div>
              </Field>
            </div>

            <Field error={errors.status?.message} label="Status" name="status" required>
              <Select
                name="status"
                onValueChange={(value) => {
                  if (value) {
                    setValue("status", value as ApplicationStatus, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                }}
                value={selectedStatus}
              >
                <SelectTriggerButton invalid={Boolean(errors.status)}>
                  <SelectValueText placeholder="Select a status" />
                </SelectTriggerButton>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field error={errors.notes?.message} label="Notes" name="notes">
              <textarea
                className={cn(
                  "flex min-h-28 w-full rounded-md border bg-background px-3 py-3 text-sm text-foreground shadow-sm transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-3",
                  errors.notes
                    ? "border-red-500/50 focus-visible:border-red-600 focus-visible:ring-red-500/25"
                    : "border-input focus-visible:border-foreground focus-visible:ring-ring/25"
                )}
                placeholder="Add context, recruiter details, or next steps."
                {...register("notes")}
              />
            </Field>


            {submitError ? (
              <p className="rounded-md border border-red-500/30 bg-red-500/8 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                {submitError}
              </p>
            ) : null}

            <DialogFooter>
              {activeApplication ? (
                <Button
                  className="mr-auto border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-300"
                  disabled={isSubmitting || isDeleting}
                  onClick={() => setIsDeleteAlertOpen(true)}
                  type="button"
                  variant="secondary"
                >
                  {isDeleting ? "Deleting..." : "Delete application"}
                </Button>
              ) : null}
              <DialogCloseButton
                disabled={isSubmitting || isDeleting}
                type="button"
              >
                Cancel
              </DialogCloseButton>
              <Button
                disabled={
                  isSubmitting ||
                  isDeleting ||
                  isLoadingSettings ||
                  (activeApplication ? !isDirty : false)
                }
                type="submit"
              >
                {isSubmitting
                  ? "Saving..."
                  : activeApplication
                    ? "Save changes"
                    : "Save application"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(parsed);
}

function formatStatusLabel(value: string) {
  return (
    STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

function getTimelineLabel(application: ApplicationListItem) {
  if (application.firstResponseAt) {
    if (application.appliedAt) {
      return `Applied ${formatDate(application.appliedAt)} · First answer ${formatDate(application.firstResponseAt)}`;
    }

    return `First answer ${formatDate(application.firstResponseAt)}`;
  }

  if (application.appliedAt) {
    return `Applied ${formatDate(application.appliedAt)}`;
  }

  return `Saved ${formatDate(application.updatedAt)}`;
}

function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while talking to the local database.";
}

function formatSalaryValue(value: string | undefined, currency: string) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  return `${currency} ${trimmed}`;
}

function getFormDefaults(preferredCurrency: string): CreateApplicationValues {
  return {
    ...formDefaults,
    salaryExpectationCurrency: preferredCurrency,
    salaryOfferCurrency: preferredCurrency,
  };
}

function mapApplicationToFormValues(
  application: ApplicationListItem,
  preferredCurrency: string,
): CreateApplicationValues {
  const salaryExpectation = parseSalaryValue(
    application.salaryExpectation,
    preferredCurrency,
  );
  const salaryOffer = parseSalaryValue(application.salaryOffer, preferredCurrency);

  return {
    jobPostUrl: application.jobPostUrl ?? "",
    companyName: application.companyName,
    roleTitle: application.roleTitle,
    salaryExpectation: salaryExpectation.amount,
    salaryExpectationCurrency: salaryExpectation.currency,
    salaryOffer: salaryOffer.amount,
    salaryOfferCurrency: salaryOffer.currency,
    status: normalizeStatus(application.status),
    notes: application.notes ?? "",
  };
}

function parseSalaryValue(value: string | null, fallbackCurrency: string) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return { amount: "", currency: fallbackCurrency };
  }

  const [currency, ...rest] = trimmed.split(/\s+/);
  if (!currency || rest.length === 0) {
    return { amount: trimmed, currency: fallbackCurrency };
  }

  return {
    amount: rest.join(" "),
    currency,
  };
}

function normalizeStatus(value: string): ApplicationStatus {
  return STATUS_OPTIONS.some((option) => option.value === value)
    ? (value as ApplicationStatus)
    : "saved";
}

function getStatusStyles(status: string): string {
  const _baseStyles = "bg-opacity-10";

  switch (status) {
    case "saved":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
    case "applied":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-300";
    case "interview":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "offer":
      return "bg-green-500/10 text-green-700 dark:text-green-300";
    case "rejected":
      return "bg-red-500/10 text-red-700 dark:text-red-300";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-300";
  }
}

