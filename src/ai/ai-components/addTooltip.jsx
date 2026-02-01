import React from "react";
import KeywordTooltip from "./KeywordTooltip.jsx";
import { tooltipWords } from "./tooltip.js";

export function addTooltip(text, context) {
  const terms = Object.keys(tooltipWords);
  if (terms.length === 0) return text;

  const regex = new RegExp(`\\b(${terms.join("|")})\\b`, "g"); // case-sensitive
  const matches = [...text.matchAll(regex)];

  if (matches.length === 0) return text;

  const parts = [];
  let lastIndex = 0;
  const wrappedWords = new Set();

  for (const match of matches) {
    const word = match[0];
    const offset = match.index;

    if (offset > lastIndex) {
      parts.push(text.slice(lastIndex, offset));
    }

    if (!wrappedWords.has(word)) {
      const tooltip = tooltipWords[word];
      if (tooltip) {
        parts.push(
          <KeywordTooltip
            key={offset}
            word={word}
            description={tooltip.description}
            icon={tooltip.icon}
            project={context?.project}
            sectionIndex={context?.sectionIndex}
            pushEvent={context?.pushEvent}
          />
        );
        wrappedWords.add(word);
      } else {
        parts.push(word);
      }
    } else {
      parts.push(word); 
    }

    lastIndex = offset + word.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
