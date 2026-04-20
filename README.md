<p align="center">
  <img src="./apps/jobnest/public/icon-transparent.png" alt="JobNest logo" width="120" />
</p>

# JobNest

JobNest is a local-first, privacy-first job application tracker. No account, no cloud, no tracking — your application history, notes, pipeline, and follow-ups stay on your device.

Built as a desktop app with Tauri, JobNest is free and open source under the MIT license.

➡️ [Download the latest release](https://github.com/maerzhase/jobnest/releases/latest)

## What We Are Building

JobNest helps you keep track of:

- companies you have applied to
- roles, application stages, and deadlines
- notes from interviews and follow-ups
- personal job search history stored locally

The product direction is centered on:

- privacy first
- local data ownership
- simple, calm UX
- fast desktop performance

## Tech Stack

This repo is a `pnpm` workspace powered by Turbo.

- `apps/jobnest` - the main JobNest app built with Next.js and wrapped with Tauri
- `apps/jobnest/src-tauri` - the Rust desktop shell and native app configuration
- `apps/website` - the public marketing site for JobNest
- `packages/ui` - shared UI components and styles

## Local-First Approach

JobNest stores all of your data locally on your machine. There is no hosted backend, no account, and no telemetry.

That means:

- better privacy for sensitive job search data
- direct ownership of your notes and application history
- no signup — open the app and start tracking
- a desktop experience that feels fast and focused

## A Small Note Before You Install

JobNest is in active early development and currently ships without an Apple developer signature. The first time you open it on macOS, the system will block it with a Gatekeeper warning.

To allow it through:

1. Try to open JobNest once (the warning will appear, that's expected).
2. Open **System Settings → Privacy & Security**.
3. Scroll to the **Security** section and choose **Open Anyway** next to the JobNest entry.
4. Confirm with your password or Touch ID.

We'll move to a fully signed and notarized build as soon as we land an Apple developer account.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the web app in development:

```bash
pnpm --filter jobnest dev
```

Run the Tauri desktop app in development:

```bash
pnpm --filter jobnest tauri dev
```

Build the workspace:

```bash
pnpm build
```

Build the desktop app bundle:

```bash
pnpm --filter jobnest tauri build
```

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm check
pnpm fix
pnpm --filter jobnest dev
pnpm --filter jobnest tauri dev
pnpm --filter jobnest tauri build
```

## Current Setup Notes

- Tauri uses `apps/jobnest/src-tauri/tauri.conf.json`
- the Tauri dev flow points at `http://localhost:3000`
- production frontend output is read from `apps/jobnest/out`
- the desktop app identifier is `com.m3000.jobnest`

## Status

JobNest is early in development. The foundation is in place for a privacy-first desktop tracker, and the next steps are shaping the product around a clean workflow for managing applications locally.

## License

JobNest is released under the [MIT License](./LICENSE).
