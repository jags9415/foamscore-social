# foamscore-social

Public images for [Foamscore](https://foamscore.com)'s social posts on Instagram, Facebook and X. Buffer needs a public URL for every image, so the weekly social run renders the images here and links to their raw GitHub URLs.

Nothing private belongs in this repo.

## Layout

- `render.mjs` renders 1080 × 1350 JPEG cards from a JSON spec: `node render.mjs spec.json`. Templates: `quiz`, `tip`, `style`, `waitlist` (fields are documented at the top of the file).
- `posts/<YYYY-MM-DD>/<slug>.jpg` holds one folder per publishing date.
- `log.md` lists one line per post, so topics don't repeat.
- `samples/` has one example of each template, with the spec that made them.
- `fonts/` has DM Sans (SIL Open Font License, `fonts/OFL.txt`).

Image URL pattern: `https://raw.githubusercontent.com/jags9415/foamscore-social/main/posts/<date>/<slug>.jpg`

Rendering needs Node and Playwright with Chromium (preinstalled in Claude's cloud sessions).
