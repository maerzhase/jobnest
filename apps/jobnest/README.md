# 🐣 JobNest App

This app is the desktop client for JobNest, a privacy-first job application tracker built to keep your data on your device.

It combines a Next.js frontend with a Tauri desktop shell:

- Next.js powers the UI and app routes
- Tauri wraps the frontend in a lightweight native desktop app
- Rust handles the native layer in `src-tauri`

## Architecture

The app is organized around two parts:

- `src/app` contains the Next.js application UI
- `src-tauri` contains the Tauri 2 configuration, Rust entrypoint, and desktop bundling setup

In development:

- Next.js runs a local dev server on `http://localhost:3000`
- Tauri opens a native window that points to that dev server

In production:

- Next.js builds a static export to `out`
- Tauri uses that exported frontend as the bundled desktop UI

This setup gives us a fast product workflow:

- React and Next.js for the interface
- Tauri for desktop packaging and native capabilities
- local-first foundations without requiring a hosted backend

## Prerequisites

Before running the app locally, make sure you have:

- Node.js 20 or newer
- `pnpm` 10 or newer
- Rust and Cargo installed
- Tauri system dependencies for your operating system

Tauri has a short platform setup guide here:

- [Tauri prerequisites](https://tauri.app/start/prerequisites/)

## Install

From the repo root:

```bash
pnpm install
```

## Development

### Environment Variables

Copy the example file and create your local overrides in `apps/jobnest/.env.local`:

```bash
cp apps/jobnest/.env.example apps/jobnest/.env.local
```

Currently supported local env vars:

- `NEXT_PUBLIC_JOBNEST_MOCK_UPDATE_NOTICE=true`
  - Shows the sidebar update notice in development so you can preview the UI without publishing a real update.

Run the frontend only:

```bash
pnpm --filter jobnest dev
```

Run the desktop app with Tauri:

```bash
pnpm --filter jobnest tauri dev
```

Run the desktop app through Turbo:

```bash
pnpm dev:tauri
```

The Tauri dev command starts the Next.js app first through `beforeDevCommand` and then opens the native desktop shell.

## Build

Build the frontend workspace:

```bash
pnpm --filter jobnest build
```

Build the desktop app bundle:

```bash
pnpm --filter jobnest tauri build
```

## Releasing

Versioning and publishing now flow through Changesets.

Create a changeset for any release-worthy app change:

```bash
pnpm changeset
```

When the Changesets release PR is merged into `main`:

- Changesets versions `apps/jobnest/package.json`
- the release script syncs the same version into `src-tauri/tauri.conf.json` and `src-tauri/Cargo.toml`
- GitHub Actions builds the Tauri bundles for macOS, Linux, and Windows
- the generated installers are uploaded to a GitHub Release

For macOS releases, GitHub Actions must have Apple signing and notarization secrets configured.
Without those secrets, the workflow now fails instead of uploading a bundle that Gatekeeper may flag as damaged.

That means the canonical downloadable desktop builds live in GitHub Releases instead of only in CI artifacts.

## In-App Updates

JobNest now exposes a native `Check for Updates…` menu item:

- macOS: `JobNest` -> `Check for Updates…`
- Windows/Linux: `Help` -> `Check for Updates…`

Release builds can now publish updater artifacts to GitHub Releases. To finish enabling that flow in CI, add these secrets:

- `JOBNEST_UPDATER_PUBLIC_KEY`
- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

The release workflow injects the updater endpoint for:

- `https://github.com/maerzhase/jobnest/releases/latest/download/latest.json`

## Important Files

- `package.json` - app scripts and frontend dependencies
- `next.config.ts` - static export setup for Tauri
- `src-tauri/tauri.conf.json` - desktop app configuration
- `src-tauri/src/lib.rs` - Rust-side Tauri application entrypoint

## Notes

- This app uses `pnpm`, not npm or yarn
- Tauri is configured to load the dev app from `localhost:3000`
- production assets are bundled from the `out` directory
- shared components come from the workspace UI package
