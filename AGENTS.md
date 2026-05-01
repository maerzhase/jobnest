# AGENTS.md

This file is a **strict operational guide** for coding agents working in the JobNest repository. Follow it precisely before making changes.

---

# Core Product Constraints

JobNest is:

- **Local-first** -> no external backend
- **Privacy-first** -> no user data leaves the device
- **Calm and simple** -> avoid unnecessary complexity

## Non-Negotiable Rules

- DO NOT introduce remote APIs or cloud services
- DO NOT add telemetry or tracking
- DO NOT introduce infrastructure-heavy solutions

---

# Repo Overview

JobNest is a `pnpm` workspace managed with Turbo.

## Apps

- `apps/jobnest` -> Next.js + Tauri desktop app
- `apps/jobnest/src-tauri` -> Rust backend (commands, DB, services)

## Packages

- `packages/ui` -> design system UI primitives and shared presentational components only

---

# System Architecture (Always Follow This Flow)

Frontend does NOT call a server.

React Component
↓
src/lib/api (wrapper)
↓
bindings.ts (generated)
↓
Tauri command
↓
Rust service / database

## Rule

- ALWAYS trace this path before making changes
- NEVER bypass layers

---

# Hard Rules (Do Not Violate)

- DO NOT edit generated files (`bindings.ts`)
- DO NOT call Tauri bindings directly from UI
- NEVER import or use `bindings.ts` outside of `src/lib/api`
- DO NOT introduce SSR-only features (Tauri requires static export)
- DO NOT introduce new architectural patterns if an existing one solves the problem
- DO NOT move business logic, data logic, hooks, or app-specific state into `packages/ui`
- DO NOT move code to `packages/ui` unless it is a reusable UI primitive or presentational component
- DO NOT refactor unrelated code during a task

---

# Required Practices

- ALWAYS modify API via `src/lib/api` wrappers
- PREFER Turbo-aware commands for lint, format, build, typecheck, and dev flows
- USE package-local commands only for app-specific scripts that Turbo does not orchestrate directly, such as `test`, `api:generate`, `api:check`, and `tauri`
- ALWAYS regenerate bindings after Rust changes:

  `pnpm --filter jobnest api:generate`

- ALWAYS run relevant checks before finishing
- ALWAYS keep changes minimal and localized

---

# Decision Guide (Where Changes Belong)

When making a change:

## UI Change Only

-> `src/components`

## Data / Logic Flow Change

-> `src/lib/api` + Rust command

## Persistence / Database Change

-> `src-tauri/src` (services, db)

## Reusable UI Component

-> `packages/ui` (only for reusable design-system primitives or presentational UI)

## Settings Feature

- UI: `src/components/settings`
- API: `src/lib/api/settings.ts`
- Rust: settings service

---

# Key Locations

## Frontend

- `src/app/page.tsx` -> home
- `src/components/application-tracker` -> main feature
- `src/components/settings/settings-screen.tsx`

## API Layer

- `src/lib/api` -> wrappers (DO modify here)
- `src/lib/api/bindings.ts` -> generated (DO NOT edit)

## Rust

- `src-tauri/src/commands` -> exposed commands
- `src-tauri/src/services` -> business logic
- `src-tauri/src/db.rs` -> persistence
- `src-tauri/src/lib.rs` -> command registration

---

# Generated Files

## bindings.ts

- Generated via Specta
- NEVER edit manually

## After changing Rust commands

1. Update command
2. Register in `lib.rs`
3. Run:

   `pnpm --filter jobnest api:generate`

---

# Commands

From repo root:

`pnpm install`
`pnpm dev`
`pnpm dev:tauri`
`pnpm build`
`pnpm check`
`pnpm fix`
`pnpm lint`
`pnpm typecheck`

## Targeted Turbo Commands

Use these when you want Turbo filtering, dependency awareness, and cache reuse:

`turbo run dev --filter=jobnest`
`turbo run build --filter=jobnest`
`turbo run lint --filter=jobnest`
`turbo run typecheck --filter=jobnest`
`turbo run lint --filter=@jobnest/ui`
`turbo run typecheck --filter=@jobnest/ui`

## Targeted Package Commands

Use these for scripts that are owned by the package and not exposed as root Turbo workflows:

`pnpm --filter jobnest tauri dev`
`pnpm --filter jobnest test`
`pnpm --filter jobnest api:generate`
`pnpm --filter jobnest api:check`

---

# Testing & Verification

## Small Changes

`pnpm --filter jobnest test`
`turbo run typecheck --filter=jobnest`
`turbo run lint --filter=jobnest`

## Shared UI

`turbo run typecheck --filter=@jobnest/ui`
`turbo run lint --filter=@jobnest/ui`

## Large Changes

`pnpm check`

## Rust/API Changes

`pnpm --filter jobnest api:check`

---

# Failure Recovery Guide

If something breaks:

## Bindings issues

-> Run:
`pnpm --filter jobnest api:generate`

## Type mismatches

-> Check:

- Rust command signature
- Generated bindings
- API wrapper types

## UI cannot call backend

-> Verify:

- Command exported in `lib.rs`
- Binding regenerated

## Build failure

-> Run:
`pnpm check`
-> If isolating a package issue, prefer:
`turbo run build --filter=jobnest`
-> Fix first error only

---

# Coding Conventions

- Use `pnpm` only
- Formatting via Biome
- 2-space indentation
- Prefer composable React components when modeling business logic in the UI
- Favor composition over large monolithic components
- Keep command handlers thin (Rust)
- Move logic into services
- Treat `packages/ui` as the design system layer, not a general shared-logic package

---

# Change Scope Guidelines

- Prefer editing existing files over creating new ones
- Avoid new abstractions unless clearly needed
- Do not introduce a new architectural pattern when an existing one already fits the problem
- Keep diffs small and focused
- Do not refactor unrelated areas
- In React code, prefer small composable components over feature-sized all-in-one components
- Keep app logic in the app unless the extracted code is clearly a reusable UI primitive

---

# Existing Tests

Located in:

- `src/lib/api/applications.test.ts`
- `src/lib/api/settings.test.ts`

## Rule

- Extend tests near API wrappers when possible

---

# Pre-Completion Checklist

Before finishing, verify:

- Changes follow UI -> API -> Rust flow
- No generated files were edited
- Bindings regenerated if Rust changed
- No logic was added to `packages/ui`
- Changes are minimal and scoped
- Relevant tests/typechecks pass
- Changeset created if the change is user-facing

---

# Changesets & Release Notes

This repository uses Changesets for versioning and release notes.

## Create a changeset when

- You change user-facing behavior, UI, flows, or features
- You add, remove, or materially change functionality
- You change shared UI primitives in `packages/ui`
- You introduce a breaking change

## Do not create a changeset when

- The change is a refactor with no user-facing impact
- The change is internal-only, such as tests, lint, or formatting
- The fix does not materially change behavior

## Command

`pnpm changeset`

Select the affected package and choose the version bump that matches the impact:

- `patch` -> small fixes or improvements
- `minor` -> new functionality
- `major` -> breaking change

## Release note rules

- ALWAYS write changesets in user-facing language
- DO NOT describe internal implementation details
- KEEP release notes concise and clear

Good release notes describe visible impact, for example:

- "Add ability to archive job applications"
- "Fix issue where applications could not be deleted"
- "Improve performance of application list rendering"

Bad release notes focus on internal work, for example:

- "Refactor application service"
- "Update types"
- "Fix bug"

---

# Standard Agent Workflow

1. Identify feature entry point
2. Trace UI -> API -> Rust
3. Decide correct layer for change
4. Implement minimal change
5. Regenerate bindings (if needed)
6. Run smallest relevant checks
7. Expand to full checks if necessary

---

# Example Change

## Task: Add new field to job applications

Steps:

1. Update Rust model
2. Update command payload
3. Register command in `lib.rs`
4. Run:
   `pnpm --filter jobnest api:generate`
5. Update API wrapper in `src/lib/api`
6. Update UI component

## Do NOT

- Edit `bindings.ts` manually
- Skip regeneration step

---

# Common Mistakes to Avoid

- Calling bindings directly from UI
- Editing generated files
- Adding unnecessary global state
- Packing too much business logic into a single React component when composition would keep it clearer
- Moving hooks, app state, or business logic into `packages/ui`
- Moving code to shared UI too early
- Introducing backend/network logic
- Over-engineering simple features

---

# When Unsure

Always:

1. Trace UI -> API -> Rust
2. Find existing similar implementation
3. Follow established pattern

---

# Guiding Principles

- Keep changes **simple**
- Keep everything **local-first**
- Prefer **existing patterns**
- Avoid **unnecessary complexity**

---

## Final Note

This document is **authoritative**. If a change conflicts with these rules, follow this guide.

---

# llm.txt Maintenance

`apps/website/public/llm.txt` is served at `/llm.txt` on the website. It is the canonical onboarding guide for AI agents and LLMs that need to import data into JobNest.

## Keep it in sync — always

When any of the following change, update `llm.txt` immediately as part of the same task:

| What changed | What to update in llm.txt |
|---|---|
| New field added to any entity (Company, Role, Application, Contact, Note, Task, Attachment, StageEvent) | Add the field to the relevant schema table and JSON example |
| Field removed or renamed | Remove or rename it everywhere it appears |
| New valid `status` value | Add it to the `status` valid values list and the normalization mapping |
| New valid `application_source`, note `kind`, or task `kind` value | Update the relevant "common values" note |
| New top-level key added to `ImportDataInput` | Add it to the import format overview and mark required/optional |
| Import behavior changes (e.g. no longer replaces all data) | Update the warning and the "How to import" section |

## Source of truth for the schema

The schema is generated from Rust via Specta. The authoritative types live in:

- `apps/jobnest/src-tauri/src/models.rs` — Rust structs
- `apps/jobnest/src/lib/api/bindings.ts` — generated TypeScript (do not edit manually)
- `apps/jobnest/src/lib/status.ts` — valid status values

After updating `llm.txt`, do a quick sanity check: every field in the JSON examples must match the current `bindings.ts` types.
