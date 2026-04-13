<h1>
  <img src="./apps/jobnest/public/icon-transparent.png" alt="JobNest logo" width="42" valign="middle" />
  JobNest
</h1>

JobNest is a privacy-first job application tracker built for people who want a simple way to manage their job search without handing their data to another SaaS.

The core idea is straightforward: your application history, notes, company pipeline, and follow-up details should live on your device. JobNest is being built as a local-first desktop app with Tauri, so your data stays with you.

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
- `packages/ui` - shared UI components and styles

## Local-First Approach

JobNest is being designed so that your data is stored locally on your machine instead of being sent to a hosted backend by default.

That means the app can aim to offer:

- better privacy for sensitive job search data
- direct ownership of your notes and application history
- a simpler product surface without mandatory accounts
- a desktop experience that feels fast and focused

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
