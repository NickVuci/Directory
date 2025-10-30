# Nick Vuci Website

Personal website for Nick Vuci's xenharmonic music projects and tools.

## Features

- Persistent footer audio player (desktop and mobile) with URL deep-linking to tracks
- Responsive layout using modern CSS (clamp, container queries where supported)
- Music library and dynamic Now Playing details
- Links to microtonal music tools and applications

## Structure

- `index.html` - Main website entry point
- `css/app.css` - Modular site bundle (imports core, layout, components, pages)
- `css/core/` - Reusable core bundle (variables, reset, base)
- `css/core.css` - Distributable core CSS for other apps (imports core + essentials)
- `css/styles.css` - Legacy consolidated stylesheet (kept during migration)
- `main.js` - Hash-based navigation and content swapping (About/Music/Tools/Contact)
- `js/player-core.js` - Core footer audio player
- `js/player-init.js` - Player bootstrap and playlist integration hooks
- `js/player-ios.js` - iOS-specific UX enhancements (media session, touch targets)
- `js/player-toggle.js` - Collapse/expand footer player
- `js/tracks.js` - Music track database and metadata
- `dev-docs/` - Developer documentation and refactoring notes

### Archived (non-production assets)

- `archived/playlist-demos/` - Playlist development/demo HTML pages and their local stylesheet
	- `filter-auto-generation-test.html`
	- `filter-debug-console.html`
	- `filter-debug.html`
	- `test-engine.html`
	- `test-foundation.html`
	- `playlist.css` (moved from `css/playlist.css`)
- `archived/dev-notes/temp_music_files.txt` - Reference list of temporary music files (moved from repo root)

Notes:
- The legacy root-level `styles.css` has been archived to `archived/legacy-root-styles-2025-10-29.css` and is not used.
- The previous desktop floating player was removed in favor of a persistent footer player.
 - Original demo/test pages under `js/playlist/*.html` now exist only as minimal redirect stubs pointing to `archived/playlist-demos/`.
 - The old `css/playlist.css` at the repo root has been neutralized (comment-only) to prevent accidental use; the active demo stylesheet lives in `archived/playlist-demos/playlist.css`.

## Development

For technical documentation and refactoring plans, see the `dev-docs/` directory. Historical/legacy work lives under `archived/`.

### CSS refactor (2025-10)

- Introduced layered CSS architecture using `@layer` and modular files under `css/`.
- New reusable core lives in `css/core/` (see `css/README.md`).
- Site now loads `css/app.css` alongside legacy `css/styles.css` during migration; once parity is verified, switch to `app.css` only.
- Optional PostCSS toolchain added for bundling/minification: `npm run build` produces minified bundles in `css/dist/`.

## Housekeeping

- `js-modules/` (root) currently contains empty placeholders and is not used by the live site. Consider deleting or moving it under `archived/` in a future cleanup commit.
- Playlist demo/test pages previously under `js/playlist/*.html` have been archived to `archived/playlist-demos/` to keep the production tree lean.

## Roadmap (Playlist UI)

- Context menu for track actions (play next, add to queue, favorite)
- Queue management (selection, reordering via drag-and-drop)
- Scroll and visibility optimizations for large playlists
- Media artwork support (Media Session `artwork` integration)

## Contact

For more information, visit the website at [nickvuci.com](https://nickvuci.com).
