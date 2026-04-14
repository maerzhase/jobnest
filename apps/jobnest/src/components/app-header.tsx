import Image from "next/image";

export function AppHeader() {
  return (
    <header className="flex items-center gap-3" data-tauri-drag-region>
      <Image
        src="/icon-transparent.png"
        alt=""
        aria-hidden="true"
        width={44}
        height={44}
        className="size-11 shrink-0 object-contain"
        priority
      />
      <div className="min-w-0">
        <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
          JobNest
        </h1>
      </div>
    </header>
  );
}
