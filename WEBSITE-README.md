# Nick Vuci Website

Personal website for Nick Vuci's xenharmonic music and tools: [nickvuci.com](https://nickvuci.com).

It is a static site with no framework. Styling follows the Nick Vuci design system (tokens, type, burgundy band header, Ivory and Nocturne themes).

## Structure

- `index.html` – the shell: band header, navigation, content area, player footer
- `about.html`, `music-list.html`, `tools.html`, `contact.html` – page fragments loaded into the shell
- `main.js` – hash routing (`#page=tools`, `#page=music-list&track=<id>`) and the music list
- `js/tracks.js` – the track list, built from the filenames in `music/`
- `js/player.js` – the slim audio player (`window.globalPlayer`)
- `js/theme.js` – the light/dark toggle in the header; follows the system until the visitor picks, and remembers the choice
- `css/` – modular source (`app.css` imports core, layout, components, pages); `css/dist/app.min.css` is the bundle the site loads
- `assets/` – NV monogram and app icon, local social icons (`assets/icons/`)
- `favicon/` – the NV app icon at each size

## Adding a track

Put the MP3 in `music/` named `NickVuci-YYYYMMDD-<tuning>-<Title>.mp3`, then add the filename to the list in `js/tracks.js`. Tuning `22edo` is shown as 22-EDO. Track ids are `<date>-<title>`, so they stay unique.

## Development

```bash
npm install
npm run build      # rebuild css/dist/
npm run lint:css
python3 -m http.server 8000   # serve locally; pages are fetched, so file:// will not work
```

Commit the rebuilt `css/dist/` with any CSS change.
