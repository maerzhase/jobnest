"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
} from "@acme/ui";
import { invoke } from "@tauri-apps/api/core";
import { startTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const createApplicationSchema = z.object({
  jobPostUrl: z.string().trim().url("Enter a valid job post URL"),
  companyName: z.string().trim().min(1, "Company is required"),
  roleTitle: z.string().trim().min(1, "Role title is required"),
  salaryExpectation: z.string().optional(),
  salaryOffer: z.string().optional(),
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
  salaryOffer: "",
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

export function ApplicationTracker() {
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    formState: { errors, isSubmitting },
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

  useEffect(() => {
    void loadApplications();
  }, []);

  async function loadApplications() {
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
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      const created = await invoke<ApplicationListItem>("create_tracked_application", {
        input: {
          jobPostUrl: values.jobPostUrl,
          companyName: values.companyName,
          roleTitle: values.roleTitle,
          salaryExpectation: values.salaryExpectation,
          salaryOffer: values.salaryOffer,
          status: values.status,
          notes: values.notes,
        },
      });

      reset(formDefaults);
      setIsCreateModalOpen(false);
      startTransition(() => {
        setApplications((current) => [created, ...current]);
      });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  return (
    <>
      <section>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Applications</h2>
            <p className="text-muted-foreground text-sm">
              Keep your current job search in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-border px-3 py-1 text-sm text-muted-foreground">
              {applications.length} total
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} type="button">
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
          <p className="text-sm text-muted-foreground">Loading applications...</p>
        ) : applications.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-5 py-10 text-center">
            <p className="text-base font-medium">Nothing tracked yet</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Add your first application to start building your local history.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {applications.map((application) => (
              <li
                className="rounded-md border border-border bg-background/70 px-4 py-4"
                key={application.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold">
                      {application.roleTitle}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {application.companyName}
                    </p>
                  </div>
                  <span className="bg-muted inline-flex rounded-md px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {formatStatusLabel(application.status)}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                  {application.jobPostUrl ? (
                    <p>
                      <a
                        className="text-foreground underline underline-offset-4"
                        href={application.jobPostUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open job post
                      </a>
                    </p>
                  ) : null}
                  {application.salaryExpectation || application.salaryOffer ? (
                    <p>
                      {[
                        application.salaryExpectation
                          ? `Expectation: ${application.salaryExpectation}`
                          : null,
                        application.salaryOffer
                          ? `Offer: ${application.salaryOffer}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                  <p>{getTimelineLabel(application)}</p>
                  {application.notes ? <p>Notes: {application.notes}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog
        onOpenChange={(open) => {
          if (!open && isSubmitting) {
            return;
          }

          if (!open) {
            setSubmitError(null);
            reset(formDefaults);
          }

          setIsCreateModalOpen(open);
        }}
        open={isCreateModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em]">
              New application
            </p>
            <DialogTitleText>Add a role to track</DialogTitleText>
            <DialogDescriptionText>
              Capture the core details for this application and keep the timeline local.
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
                placeholder="https://jobs.example.com/role"
                {...register("jobPostUrl")}
              />
            </Field>

            <Field
              error={errors.companyName?.message}
              label="Company"
              name="companyName"
            >
              <Input
                autoComplete="organization"
                placeholder="Acme Inc."
                {...register("companyName")}
              />
            </Field>

            <Field
              error={errors.roleTitle?.message}
              label="Role"
              name="roleTitle"
            >
              <Input
                autoComplete="organization-title"
                placeholder="Product Designer"
                {...register("roleTitle")}
              />
            </Field>

            <Field
              error={errors.salaryExpectation?.message}
              label="Salary expectation"
              name="salaryExpectation"
            >
              <Input
                inputMode="text"
                placeholder="EUR 60k"
                {...register("salaryExpectation")}
              />
            </Field>

            <Field
              error={errors.salaryOffer?.message}
              label="Salary offer"
              name="salaryOffer"
            >
              <Input
                inputMode="text"
                placeholder="EUR 58k"
                {...register("salaryOffer")}
              />
            </Field>

            <Field error={errors.status?.message} label="Status" name="status">
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
                <SelectTriggerButton>
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
                className="flex min-h-28 w-full rounded-md border border-input bg-background px-3 py-3 text-sm text-foreground shadow-sm transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-3 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60"
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
              <DialogCloseButton disabled={isSubmitting} type="button">
                Cancel
              </DialogCloseButton>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Saving..." : "Save application"}
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
  return STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value;
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
