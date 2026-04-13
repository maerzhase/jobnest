export function AppHeader() {
  return (
    <header className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex size-11 items-center justify-center text-2xl"
      >
        🐣
      </span>
      <div className="min-w-0">
        <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
          JobNest
        </h1>
      </div>
    </header>
  );
}
