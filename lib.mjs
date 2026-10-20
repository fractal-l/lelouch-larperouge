export const MAX_STATUS_LENGTH = 80;
export const ATTRIBUTION = "Lelouch Lamperouge";
export const STATUS_EMOJI = ":shinto_shrine:";

const LEFT_QUOTE = "\u201c";
const RIGHT_QUOTE = "\u201d";
const EN_DASH = "\u2013";

export function formatStatus(quote) {
  return `${LEFT_QUOTE}${quote}${RIGHT_QUOTE} ${EN_DASH} ${ATTRIBUTION}`;
}

export function pickQuote(quotes, { exclude } = {}) {
  const candidates = quotes.filter(
    (quote) => formatStatus(quote).length <= MAX_STATUS_LENGTH,
  );

  if (candidates.length === 0) {
    throw new Error("No quotes fit within the GitHub status limit.");
  }

  const fresh = exclude
    ? candidates.filter((quote) => formatStatus(quote) !== exclude)
    : candidates;

  const pool = fresh.length > 0 ? fresh : candidates;
  return formatStatus(pool[Math.floor(Math.random() * pool.length)]);
}
