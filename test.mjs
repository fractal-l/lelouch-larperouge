import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ATTRIBUTION,
  MAX_STATUS_LENGTH,
  STATUS_EMOJI,
  formatStatus,
  pickQuote,
} from "./lib.mjs";

const quotes = JSON.parse(
  await readFile(new URL("./quotes.json", import.meta.url), "utf8"),
);

test("every quote fits the GitHub status limit", () => {
  for (const quote of quotes) {
    const status = formatStatus(quote);
    assert.ok(
      status.length <= MAX_STATUS_LENGTH,
      `"${status}" is ${status.length} characters`,
    );
    assert.ok(status.startsWith("\u201c"));
    assert.ok(status.endsWith(`\u201d \u2013 ${ATTRIBUTION}`));
  }
});

test("status uses the shinto shrine emoji", () => {
  assert.equal(STATUS_EMOJI, ":shinto_shrine:");
});

test("pickQuote returns a formatted status", () => {
  const status = pickQuote(quotes);
  assert.ok(status.startsWith("\u201c"));
  assert.ok(status.endsWith(`\u201d \u2013 ${ATTRIBUTION}`));
});

test("pickQuote avoids repeating the current status", () => {
  const current = formatStatus(quotes[0]);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    assert.notEqual(pickQuote(quotes, { exclude: current }), current);
  }
});

test("pickQuote throws when no quote fits", () => {
  assert.throws(() => pickQuote(["x".repeat(MAX_STATUS_LENGTH)]));
});
