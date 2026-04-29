"use client";

import { open } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import {
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
} from "@jobnest/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconExternalLink,
  IconPaperclip,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  APPLICATION_SOURCE_OPTIONS,
  normalizeApplicationSource,
} from "../../lib/application-source";
import { getErrorMessage } from "../../lib/error-handler";
import type { CreateApplicationValues } from "../../lib/form-mappers";
import { normalizeStatus, STATUS_OPTIONS } from "../../lib/status";
import { showErrorToast } from "../../lib/toast";
import { SalaryInput } from "./salary-input";

const applicationSourceValues = APPLICATION_SOURCE_OPTIONS.map(
  (option) => option.value
) as [
  CreateApplicationValues["applicationSource"],
  ...CreateApplicationValues["applicationSource"][],
];

const statusValues = STATUS_OPTIONS.map((option) => option.value) as [
  CreateApplicationValues["status"],
  ...CreateApplicationValues["status"][],
];

const createApplicationSchema = z.object({
  jobPostUrl: z.string().trim().url("Enter a valid job post URL"),
  companyName: z.string().trim().min(1, "Company is required"),
  roleTitle: z.string().trim().min(1, "Role title is required"),
  applicationSource: z.enum(applicationSourceValues),
  salaryExpectation: z.string(),
  salaryExpectationCurrency: z.string().trim().min(1, "Choose a currency"),
  salaryOffer: z.string(),
  salaryOfferCurrency: z.string().trim().min(1, "Choose a currency"),
  status: z.enum(statusValues),
  appliedAt: z.string(),
  notes: z.string(),
  attachments: z.array(
    z.object({
      kind: z.string().nullable(),
      fileName: z.string().trim().min(1, "File name is required"),
      filePath: z.string().trim().min(1, "File path is required"),
      mimeType: z.string().nullable(),
    })
  ),
});

type ApplicationFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: CreateApplicationValues;
  onSubmit: (values: CreateApplicationValues) => Promise<void>;
  onDelete?: () => void;
  isSubmitting: boolean;
  isDeleting: boolean;
  isLoadingSettings: boolean;
  isEditing: boolean;
};

export function ApplicationFormDialog({
  isOpen,
  onOpenChange,
  initialValues,
  onSubmit,
  onDelete,
  isSubmitting,
  isDeleting,
  isLoadingSettings,
  isEditing,
}: ApplicationFormDialogProps) {
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<CreateApplicationValues>({
    defaultValues: initialValues,
    resolver: zodResolver(createApplicationSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [initialValues, isOpen, reset]);

  const selectedStatus = watch("status");
  const selectedApplicationSource = watch("applicationSource");
  const selectedSalaryExpectationCurrency = watch("salaryExpectationCurrency");
  const selectedSalaryOfferCurrency = watch("salaryOfferCurrency");
  const salaryExpectation = watch("salaryExpectation");
  const salaryOffer = watch("salaryOffer");
  const attachments = watch("attachments");

  const handleAddAttachments = useCallback(async () => {
    try {
      const selection = await open({
        title: "Select attachments",
        multiple: true,
      });
      const selectedPaths = Array.isArray(selection)
        ? selection
        : selection
          ? [selection]
          : [];

      if (selectedPaths.length === 0) {
        return;
      }

      const nextAttachments = [...attachments];

      for (const filePath of selectedPaths) {
        if (nextAttachments.some((attachment) => attachment.filePath === filePath)) {
          continue;
        }

        const fileName = filePath.split(/[/\\\\]/).pop() || filePath;
        nextAttachments.push({
          kind: "file",
          fileName,
          filePath,
          mimeType: null,
        });
      }

      setValue("attachments", nextAttachments, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      showErrorToast({
        title: "Could not add attachments",
        description: getErrorMessage(error),
      });
    }
  }, [attachments, setValue]);

  const handleOpenAttachment = useCallback(async (filePath: string) => {
    try {
      await openPath(filePath);
    } catch (error) {
      showErrorToast({
        title: "Could not open attachment",
        description: getErrorMessage(error),
      });
    }
  }, []);

  const handleRemoveAttachment = useCallback(
    (filePath: string) => {
      setValue(
        "attachments",
        attachments.filter((attachment) => attachment.filePath !== filePath),
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      );
    },
    [attachments, setValue]
  );

  const handleFormSubmit = useCallback(
    async (values: CreateApplicationValues) => {
      await onSubmit(values);
      reset(initialValues);
    },
    [onSubmit, initialValues, reset]
  );

  const handleClose = useCallback(() => {
    if (!isSubmitting && !isDeleting) {
      reset(initialValues);
      onOpenChange(false);
    }
  }, [isSubmitting, isDeleting, reset, initialValues, onOpenChange]);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
      open={isOpen}
    >
      <DialogContent className="relative flex max-h-[min(90vh,780px)] max-w-4xl flex-col overflow-hidden p-0">
        <DialogHeader className="bg-card border-border/60 absolute inset-x-0 top-0 z-10 border-b px-6 pb-4 pt-6 sm:px-7">
          <DialogTitleText>
            {isEditing ? "Edit Application" : "Add Application"}
          </DialogTitleText>
          <DialogDescriptionText>
            {isEditing
              ? "Review this application, update the details, or remove it from your tracker."
              : "Capture the core details for this application and keep the timeline local."}
          </DialogDescriptionText>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col pt-24 sm:pt-26"
          onSubmit={handleSubmit(handleFormSubmit)}
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-7">
            <div className="grid gap-6">
              <section className="grid gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Role details
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Start with the essentials you need to recognize this application.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    className="min-w-0"
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
                    className="min-w-0"
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
                </div>

                <Field
                  error={errors.jobPostUrl?.message}
                  label="Job post URL"
                  name="jobPostUrl"
                  required
                >
                  <Input
                    autoComplete="url"
                    autoCorrect="off"
                    invalid={Boolean(errors.jobPostUrl)}
                    placeholder="https://jobs.example.com/role"
                    {...register("jobPostUrl")}
                  />
                </Field>
              </section>

              <section className="grid gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Tracking
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Keep the timeline accurate without cluttering the main details.
                  </p>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                  <Field
                    error={errors.status?.message}
                    label="Status"
                    name="status"
                    required
                  >
                    <Select
                      name="status"
                      onValueChange={(value) => {
                        if (value) {
                          setValue("status", normalizeStatus(value), {
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

                  <Field
                    error={errors.appliedAt?.message}
                    label="Application date"
                    name="appliedAt"
                  >
                    <Input
                      invalid={Boolean(errors.appliedAt)}
                      type="date"
                      {...register("appliedAt")}
                    />
                  </Field>

                  <Field
                    error={errors.applicationSource?.message}
                    label="Source"
                    name="applicationSource"
                    required
                  >
                    <Select
                      name="applicationSource"
                      onValueChange={(value) => {
                        if (value) {
                          setValue(
                            "applicationSource",
                            normalizeApplicationSource(value),
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            }
                          );
                        }
                      }}
                      value={selectedApplicationSource}
                    >
                      <SelectTriggerButton invalid={Boolean(errors.applicationSource)}>
                        <SelectValueText placeholder="Select a source" />
                      </SelectTriggerButton>
                      <SelectContent>
                        {APPLICATION_SOURCE_OPTIONS.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </section>

              <section className="grid gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Compensation
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add salary details if they matter for comparison.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    error={
                      errors.salaryExpectation?.message ??
                      errors.salaryExpectationCurrency?.message
                    }
                    label="Salary expectation"
                    name="salaryExpectation"
                  >
                    <SalaryInput
                      value={salaryExpectation || ""}
                      onChange={(value) => {
                        setValue("salaryExpectation", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      currency={selectedSalaryExpectationCurrency}
                      onCurrencyChange={(value) => {
                        setValue("salaryExpectationCurrency", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      invalid={
                        Boolean(errors.salaryExpectation) ||
                        Boolean(errors.salaryExpectationCurrency)
                      }
                      placeholder="60000"
                    />
                  </Field>

                  <Field
                    error={
                      errors.salaryOffer?.message ??
                      errors.salaryOfferCurrency?.message
                    }
                    label="Salary offer"
                    name="salaryOffer"
                  >
                    <SalaryInput
                      value={salaryOffer || ""}
                      onChange={(value) => {
                        setValue("salaryOffer", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      currency={selectedSalaryOfferCurrency}
                      onCurrencyChange={(value) => {
                        setValue("salaryOfferCurrency", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      invalid={
                        Boolean(errors.salaryOffer) ||
                        Boolean(errors.salaryOfferCurrency)
                      }
                      placeholder="58000"
                    />
                  </Field>
                </div>
              </section>

              <section className="grid gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Attachments
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Keep resumes, cover letters, or work samples linked to this application.
                      </p>
                    </div>
                    <Button
                      className="shrink-0"
                      disabled={isSubmitting || isDeleting}
                      onClick={() => void handleAddAttachments()}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <IconPlus aria-hidden="true" className="size-4" />
                      <span>Add files</span>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  {attachments.length > 0 ? (
                    attachments.map((attachment) => (
                      <div
                        key={attachment.filePath}
                        className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-muted/30 px-3 py-3"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="mt-0.5 text-muted-foreground">
                            <IconPaperclip aria-hidden="true" className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {attachment.fileName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => void handleOpenAttachment(attachment.filePath)}
                            size="xs"
                            type="button"
                            variant="ghost"
                          >
                            <IconExternalLink aria-hidden="true" className="size-4" />
                            <span>Open</span>
                          </Button>
                          <Button
                            aria-label={`Remove ${attachment.fileName}`}
                            onClick={() => handleRemoveAttachment(attachment.filePath)}
                            size="xs"
                            type="button"
                            variant="ghost"
                          >
                            <IconX aria-hidden="true" className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-md border border-dashed border-border/80 px-4 py-4 text-sm text-muted-foreground">
                      No files attached yet.
                    </div>
                  )}
                </div>
              </section>

              <section className="grid gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Notes
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Optional context like recruiter details or next steps.
                  </p>
                </div>

                <Field error={errors.notes?.message} label="Notes" name="notes">
                  <textarea
                    className={cn(
                      "flex min-h-24 w-full rounded-md border bg-background px-3 py-3 text-sm text-foreground shadow-sm transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-3",
                      errors.notes
                        ? "border-red-500/50 focus-visible:border-red-600 focus-visible:ring-red-500/25"
                        : "border-input focus-visible:border-foreground focus-visible:ring-ring/25"
                    )}
                    placeholder="Add context, recruiter details, or next steps."
                    {...register("notes")}
                  />
                </Field>
              </section>
            </div>
          </div>

          <DialogFooter className="border-border/60 border-t px-6 py-4 sm:px-7">
            {isEditing ? (
              <Button
                className="mr-auto border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-300"
                disabled={isSubmitting || isDeleting}
                onClick={onDelete}
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
                (isEditing ? !isDirty : false)
              }
              type="submit"
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Save application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
