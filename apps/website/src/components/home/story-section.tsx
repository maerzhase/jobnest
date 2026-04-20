import { ScreenshotFrame } from "./shared";

export function StorySection({
  body,
  detail,
  image,
  title,
}: {
  body: string;
  detail: string;
  image: string;
  title: string;
}) {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-28 sm:px-8 sm:py-36">
      <article className="max-w-3xl space-y-5">
        <h2 className="text-balance font-medium text-3xl text-foreground tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        <p className="font-light text-lg text-foreground/85 leading-relaxed">
          {body}
        </p>
        <p className="max-w-2xl font-light text-base text-muted-foreground leading-relaxed">
          {detail}
        </p>
      </article>

      <ScreenshotFrame alt={title} name={image} />
    </section>
  );
}
