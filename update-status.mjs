#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { pickQuote } from "./lib.mjs";

const GRAPHQL_URL = "https://api.github.com/graphql";
const TOKEN = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;

const CURRENT_STATUS_QUERY = `
  query {
    viewer {
      status {
        message
      }
    }
  }
`;

const CHANGE_STATUS_MUTATION = `
  mutation ($message: String!) {
    changeUserStatus(input: { message: $message }) {
      status {
        message
      }
    }
  }
`;

async function graphql(query, variables = {}) {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "lelouch-larperouge",
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.errors?.length) {
    const details =
      payload.errors?.map((error) => error.message).join("; ") ??
      `HTTP ${response.status}`;
    throw new Error(`GitHub API error: ${details}`);
  }

  return payload.data;
}

async function getCurrentStatus() {
  const data = await graphql(CURRENT_STATUS_QUERY);
  return data.viewer.status?.message ?? null;
}

async function setStatus(message) {
  const data = await graphql(CHANGE_STATUS_MUTATION, { message });
  return data.changeUserStatus.status.message;
}

async function loadQuotes() {
  const raw = await readFile(new URL("./quotes.json", import.meta.url), "utf8");
  const quotes = JSON.parse(raw);

  if (!Array.isArray(quotes) || quotes.some((quote) => typeof quote !== "string")) {
    throw new Error("quotes.json must be an array of strings.");
  }

  return quotes;
}

async function main() {
  if (process.argv.includes("--help")) {
    console.log("Usage: GH_TOKEN=... node update-status.mjs [--dry-run]");
    return;
  }

  const quotes = await loadQuotes();

  if (process.argv.includes("--dry-run")) {
    console.log(pickQuote(quotes));
    return;
  }

  if (!TOKEN) {
    throw new Error(
      "GH_TOKEN is not set. Add a repository secret named GH_STATUS_TOKEN (a classic token with the `user` scope).",
    );
  }

  const status = pickQuote(quotes, { exclude: await getCurrentStatus() });
  const saved = await setStatus(status);

  console.log(`Updated GitHub status: ${saved}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
