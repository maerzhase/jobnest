# Monorepo Template

Opinionated `pnpm` + Turbo starter with one publishable UI package and one private Next.js app that consumes it through workspace dependencies.

## Workspace Layout

- `packages/ui` - publishable Base UI + Tailwind package
- `apps/web` - private example app consuming `@acme/ui`

## Getting Started

```bash
pnpm install
pnpm build
pnpm dev
```

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm check
pnpm fix
pnpm changeset
pnpm release
```

## Release Flow

1. Run `pnpm changeset` after changing a publishable package.
2. Commit the generated changeset with your code.
3. When the branch lands on `main`, the Changesets GitHub Action opens or updates a release PR.
4. Merging that PR publishes releaseable packages to npm.
