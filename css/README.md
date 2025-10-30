# CSS Architecture

This folder implements a layered CSS architecture for maintainability and reuse.

Layers (via `@layer`):
- base: variables, reset, base elements, typography, links
- layout: page structure (grid, header, main, footer, containers)
- components: reusable UI (buttons, cards, forms, nav, player, playlist, social)
- utilities: small helpers and animations
- pages: page-specific overrides (about, music, tools, contact)
- overrides: rare, last-resort fixes

Structure:
- core/ — Reusable core bundle for other apps
  - _variables.css
  - _reset.css
  - _base.css
  - index.css (imports the above)
- layout/
- components/
- utilities/
  - utilities.css
- pages/
- themes/ (optional)
- app.css — Site bundle that imports layout, components, utilities, pages
- core.css — Distributable core (can be copied from `core/index.css` or built via PostCSS)

Usage:
- For other apps: include `css/core/index.css` (or a minified copy as `core.css`).
- For this site: include `app.css` (to be wired after migration), which imports core plus site parts.

Notes:
- Prefer low-specificity selectors and `:where()` for overrides.
- Use `@supports` for advanced features (container queries, `dvh`, `env()` insets).
- Avoid `!important`; use layers and order instead.
