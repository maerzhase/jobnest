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
} from "@acme/ui";
import { invoke } from "@tauri-apps/api/core";
import { startTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const createApplicationSchema = z.object({
  companyName: z.string().trim().min(1, "Company is required"),
  roleTitle: z.string().trim().min(1, "Role title is required"),
});

type CreateApplicationValues = z.infer<typeof createApplicationSchema>;

type ApplicationListItem = {
  id: string;
  companyName: string;
  roleTitle: string;
  status: string;
  appliedAt: string | null;
  updatedAt: string;
  archivedAt: string | null;
};

const formDefaults: CreateApplicationValues = {
  companyName: "",
  roleTitle: "",
};

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
  } = useForm<CreateApplicationValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(createApplicationSchema),
  });

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
          companyName: values.companyName,
          roleTitle: values.roleTitle,
          status: "applied",
          appliedAt: new Date().toISOString(),
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
                    {application.status}
                  </span>
                </div>
                <p className="text-muted-foreground mt-4 text-sm">
                  Added {formatDate(application.appliedAt ?? application.updatedAt)}
                </p>
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
              Add the company and role title to start tracking this application.
            </DialogDescriptionText>
          </DialogHeader>

          <form className="grid gap-5" onSubmit={onSubmit}>
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
              label="Role title"
              name="roleTitle"
            >
              <Input
                autoComplete="organization-title"
                placeholder="Product Designer"
                {...register("roleTitle")}
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

function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while talking to the local database.";
}
