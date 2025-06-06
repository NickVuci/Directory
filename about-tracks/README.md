# Track About Documents

This directory contains custom HTML documents that provide detailed information about individual tracks. 

## How it Works

When a track is loaded, the player automatically looks for a corresponding HTML file in this directory. The file naming convention is:

- **For tracks with IDs**: `{track_id}.html` (e.g., `track_001.html`)
- **For tracks without IDs**: `{sanitized_title}.html` (e.g., `softer-for-j.html`)

## File Naming Rules

Track titles are sanitized for filenames by:
1. Converting to lowercase
2. Removing special characters (keeping only letters, numbers, spaces, hyphens)
3. Replacing spaces with hyphens
4. Removing duplicate hyphens

## Content Format

Each HTML file should contain valid HTML content that will be inserted into the about section. You can use:
- Paragraphs (`<p>`)
- Lists (`<ul>`, `<ol>`)
- Emphasis (`<strong>`, `<em>`)
- Basic formatting

## Fallback Behavior

If no custom document exists for a track, the player will show:
- "No custom info about this track currently."
- Basic track metadata (tuning, year, description)

## Example Files

- `track_001.html` - Custom about content for "Softer for J"
- Add more files as needed for other tracks

## Adding New Documents

1. Find the track ID from `tracks.js` or use the sanitized title
2. Create an HTML file with that name
3. Add your custom content
4. The player will automatically load it when that track plays
