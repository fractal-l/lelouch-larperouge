# Lelouch Larperouge

Changes my GitHub profile status to a random Lelouch Lamperouge quote every six hours.

**Format:** “quote” – Lelouch Lamperouge

The quote is picked at random from [`quotes.json`](./quotes.json), avoiding the quote that is already in the status. GitHub limits profile statuses to 80 characters, so every quote in the list is curated to fit the full formatted status.

## How it works

The [`update-status.yml`](./.github/workflows/update-status.yml) workflow runs every six hours (and on demand). It calls the GitHub GraphQL `changeUserStatus` mutation using a personal access token stored as a repository secret.

## Setup

1. Create a [classic personal access token](https://github.com/settings/tokens/new) with the `user` scope.
2. Save it as the `GH_STATUS_TOKEN` repository secret:

   ```sh
   gh secret set GH_STATUS_TOKEN --repo fractal-l/lelouch-larperouge
   ```

3. Run the workflow once to check everything works:

   ```sh
   gh workflow run update-status.yml --repo fractal-l/lelouch-larperouge
   ```

If you already use the GitHub CLI and do not mind reusing its OAuth token, you can upgrade it and upload it in one go:

```sh
gh auth refresh -h github.com -s user
gh secret set GH_STATUS_TOKEN --repo fractal-l/lelouch-larperouge --body "$(gh auth token)"
```

## Local usage

```sh
GH_TOKEN=ghp_... node update-status.mjs
node update-status.mjs --dry-run
node --test
```

`--dry-run` prints a formatted quote without calling the API.

## Notes

- `GH_TOKEN` needs the `user` scope to change profile status. Set the token to never expire, otherwise runs will start failing when it expires.
- GitHub disables scheduled workflows after 60 days without repository activity. The [`keepalive.yml`](./.github/workflows/keepalive.yml) workflow makes a small timestamp commit on the first of every month to prevent that.
- Scheduled runs can be delayed during periods of high GitHub Actions load.

## License

MIT
