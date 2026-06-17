const DEFAULT_TRAILING_TEXT_LIMIT = 220;
const DEFAULT_PREVIOUS_PAGE_MIN_TEXT = 300;

export function hasMostlyBlankTrailingPage(pageTextLengths, options = {}) {
  if (!Array.isArray(pageTextLengths) || pageTextLengths.length < 2) return false;

  const trailingTextLimit = options.trailingTextLimit ?? DEFAULT_TRAILING_TEXT_LIMIT;
  const previousPageMinText = options.previousPageMinText ?? DEFAULT_PREVIOUS_PAGE_MIN_TEXT;
  const lastLength = Number(pageTextLengths.at(-1));
  const previousLength = Number(pageTextLengths.at(-2));

  if (!Number.isFinite(lastLength) || !Number.isFinite(previousLength)) return false;
  return lastLength <= trailingTextLimit && previousLength >= previousPageMinText;
}
