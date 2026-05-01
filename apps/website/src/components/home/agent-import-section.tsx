export function AgentImportSection() {
  return (
    <section id="import" className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-36">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 lg:items-start">
        <article className="space-y-4 sm:space-y-5">
          <h2 className="text-balance font-medium text-2xl text-foreground tracking-tight sm:text-4xl lg:text-5xl">
            Already tracking somewhere else? Bring it with you.
          </h2>
          <p className="font-light text-base text-foreground/85 leading-relaxed sm:text-lg">
            Because JobNest is fully local, there is no OAuth flow, no
            server-side import API, and no account to connect. Your data never
            touches a third-party service — not even ours.
          </p>
          <p className="font-light text-base text-muted-foreground leading-relaxed">
            That is also why we built the import around your own AI agent.
            Point it at our data format spec, hand it your existing tracker
            export, and let it do the conversion on your machine. Nothing
            leaves your control.
          </p>
        </article>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <Step key={step.title} index={i + 1} {...step} />
          ))}
          <a
            href="/llm.txt"
            target="_blank"
            rel="noreferrer"
            className="block pt-1 font-light text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            View format spec →
          </a>
        </div>
      </div>
    </section>
  );
}

const steps: { title: string; body: string }[] = [
  {
    title: "Export from your current tracker",
    body: "Download your data as a spreadsheet, CSV, or whatever format your current tool offers.",
  },
  {
    title: "Point your agent at the format spec",
    body: 'Open ChatGPT, Claude, or any LLM and say: "Read the import format at jobnest.app/llm.txt and convert my data to match it."',
  },
  {
    title: "Import the result into JobNest",
    body: "Save the generated JSON file, then go to Settings → Data → Import JSON. Done.",
  },
];

function Step({
  body,
  index,
  title,
}: {
  body: string;
  index: number;
  title: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-border/60 bg-card/40 px-5 py-4 backdrop-blur-sm sm:gap-5 sm:px-6 sm:py-5">
      <span
        aria-hidden
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground/8 font-medium text-foreground/50 text-xs tabular-nums"
      >
        {index}
      </span>
      <div className="space-y-1">
        <p className="font-medium text-foreground text-sm">{title}</p>
        <p className="font-light text-muted-foreground text-sm leading-relaxed">
          {body}
        </p>
      </div>
    </div>
  );
}
