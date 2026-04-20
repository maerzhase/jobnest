import { ScreenshotFrame, type ScreenshotName } from "./screenshot-frame";

export function StorySection({
  body,
  detail,
  image,
  title,
}: {
  body: string;
  detail: string;
  image: ScreenshotName;
  title: string;
}) {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-20 sm:gap-12 sm:px-8 sm:py-36">
      <article className="max-w-3xl space-y-4 sm:space-y-5">
        <h2 className="text-balance font-medium text-2xl text-foreground tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        <p className="font-light text-base text-foreground/85 leading-relaxed sm:text-lg">
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
