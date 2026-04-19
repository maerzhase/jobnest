"use client";

import { Fragment, type JSX } from "react";
import { getSearchQueryState } from "./helpers";

type HighlightedTextProps = {
  query?: string;
  text: string;
};

export function HighlightedText({
  query,
  text,
}: HighlightedTextProps): JSX.Element {
  const { hasQuery, normalizedQuery, trimmedQuery } = getSearchQueryState(query);

  if (!hasQuery) {
    return <>{text}</>;
  }

  const normalizedText = text.toLocaleLowerCase();
  const fragments: JSX.Element[] = [];
  let searchStartIndex = 0;
  let matchIndex = normalizedText.indexOf(normalizedQuery);

  if (matchIndex < 0) {
    return <>{text}</>;
  }

  while (matchIndex >= 0) {
    if (matchIndex > searchStartIndex) {
      fragments.push(
        <Fragment key={`text-${searchStartIndex}-${matchIndex}`}>
          {text.slice(searchStartIndex, matchIndex)}
        </Fragment>
      );
    }

    const matchEndIndex = matchIndex + trimmedQuery.length;
    fragments.push(
      <span
        key={`match-${matchIndex}-${matchEndIndex}`}
        className="rounded-[0.2rem] bg-foreground/12 text-foreground [box-decoration-break:clone]"
      >
        {text.slice(matchIndex, matchEndIndex)}
      </span>
    );

    searchStartIndex = matchEndIndex;
    matchIndex = normalizedText.indexOf(normalizedQuery, searchStartIndex);
  }

  if (searchStartIndex < text.length) {
    fragments.push(
      <Fragment key={`text-${searchStartIndex}-${text.length}`}>
        {text.slice(searchStartIndex)}
      </Fragment>
    );
  }

  return <>{fragments}</>;
}
