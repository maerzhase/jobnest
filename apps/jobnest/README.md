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

That means the canonical downloadable desktop builds live in GitHub Releases instead of only in CI artifacts.

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
