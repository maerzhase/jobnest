import { Button } from "@acme/ui";
import { ThemeToggle } from "../components/theme-toggle";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-6 py-16">
      <div className="flex items-start justify-between gap-6">
        <div className="max-w-2xl space-y-4">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.24em]">
            Privacy-first job tracker
          </p>
          <h1 className="text-foreground text-4xl font-semibold tracking-tight sm:text-5xl">
            🐣 JobNest
          </h1>
          <p className="text-muted-foreground text-lg leading-8">
            Track roles, companies, notes, and progress in one calm place,
            with your job search data staying on your device.
          </p>
        </div>

        <ThemeToggle />
      </div>

      <div className="bg-card border-border flex flex-wrap items-center gap-4 rounded-3xl border p-6 shadow-sm shadow-black/5 backdrop-blur dark:shadow-black/30">
        <Button>Primary action</Button>
        <Button variant="secondary">Secondary action</Button>
      </div>
    </main>
  );
}
