"use client";

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
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  APPLICATION_SOURCE_OPTIONS,
  normalizeApplicationSource,
} from "../../lib/application-source";
import type { CreateApplicationValues } from "../../lib/form-mappers";
import { normalizeStatus, STATUS_OPTIONS } from "../../lib/status";
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
  notes: z.string(),
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

  const selectedStatus = watch("status");
  const selectedApplicationSource = watch("applicationSource");
  const selectedSalaryExpectationCurrency = watch("salaryExpectationCurrency");
  const selectedSalaryOfferCurrency = watch("salaryOfferCurrency");
  const salaryExpectation = watch("salaryExpectation");
  const salaryOffer = watch("salaryOffer");

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
      <DialogContent>
        <DialogHeader>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em]">
            {isEditing ? "Application details" : "New application"}
          </p>
          <DialogTitleText>
            {isEditing ? "Edit tracked application" : "Add a role to track"}
          </DialogTitleText>
          <DialogDescriptionText>
            {isEditing
              ? "Review this application, update the details, or remove it from your tracker."
              : "Capture the core details for this application and keep the timeline local."}
          </DialogDescriptionText>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={handleSubmit(handleFormSubmit)}>
          <Field
            error={errors.jobPostUrl?.message}
            label="Link to job post"
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

          <Field
            error={errors.applicationSource?.message}
            label="How this role came in"
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
                <SelectValueText placeholder="Select how this role came in" />
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

          <div className="grid gap-4 sm:grid-cols-2">
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
          <DialogFooter>
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
