# @jobnest/ui

Minimal Base UI + Tailwind component package used by the monorepo template.

## Getting Started

Import components from the package:

```tsx
import { Button } from "@jobnest/ui";
```

Then choose one of the two style integration approaches:

### 1. Use the full compiled stylesheet

Best when you want the package to ship its own generated utility CSS.

```css
@import "@jobnest/ui/styles.css";
```

### 2. Use the theme-only export

Best when your app already runs its own Tailwind v4 pipeline and should
generate the component utilities itself.

```css
@import "./variants.css";
@import "tailwindcss";
@import "@jobnest/ui/theme.css";
@source "../../../../packages/ui/src/**/*.{ts,tsx}";
```

In this setup:

- `@acme/ui/theme.css` provides the theme tokens and base styles
- `@source` makes your app Tailwind build scan the UI package component classes
- your app generates the utility classes needed by the exported components

## Exports

- `Button`
- `@jobnest/ui/styles.css` - full compiled stylesheet with Tailwind utilities and theme tokens
- `@jobnest/ui/theme.css` - theme variables and base styles only, for apps that run their own Tailwind pipeline
