# Nick Vuci Website

Personal website for Nick Vuci's xenharmonic music projects and tools.

## Features

- Persistent footer audio player (desktop and mobile) with URL deep-linking to tracks
- Responsive layout using modern CSS (clamp, container queries where supported)
- Music library and dynamic Now Playing details
- Links to microtonal music tools and applications

## Structure

- `index.html` - Main website entry point
- `css/dist/app.min.css` - Production bundle (minified)
- `css/app.css` - Development bundle (imports core, layout, components, pages)
- `css/core/` - Reusable core bundle (variables, reset, base)
- `css/core.css` - Distributable core CSS for other apps (imports core + essentials)
- `main.js` - Hash-based navigation and content swapping (About/Music/Tools/Contact)
- `js/player-core.js` - Core footer audio player
- `js/player-init.js` - Player bootstrap
- `js/player-ios.js` - iOS-specific UX enhancements (media session, touch targets)
- `js/player-toggle.js` - Collapse/expand footer player
- `js/tracks.js` - Music track database and metadata
- `dev-docs/` - Developer documentation and refactoring notes

## Development

For technical documentation and refactoring plans, see the `dev-docs/` directory.

### CSS refactor (2025-10)

- Introduced layered CSS architecture using `@layer` and modular files under `css/`.
- New reusable core lives in `css/core/` (see `css/README.md`).
- Site loads the production bundle `css/dist/app.min.css` built from modular source files.
- PostCSS toolchain for bundling/minification: `npm run build` produces minified bundles in `css/dist/`.

## Housekeeping

- `js-modules/` (root) currently contains empty placeholders and is not used by the live site; consider deleting in a future cleanup commit.

## Contact

For more information, visit the website at [nickvuci.com](https://nickvuci.com).
