# RUSLXTREME 3.0

A frontend-only React, TypeScript, and Vite mission-control experience for RUSLXTREME 3.0, the competitive programming event organized by the IEEE Student Branch of Rajarata University of Sri Lanka.

## Run locally

```bash
npm install
npm run dev
```

The dev server is configured for `127.0.0.1:3000` with strict-port behavior. Use `npm run build` to run the TypeScript build check and generate `dist/`. Use `npm run preview` to serve the production build locally.

## Project structure

- `src/App.tsx` — page composition, navigation, gallery lightbox, and accessible interactions.
- `src/data.ts` — static event content with explicit `verified` and `placeholder` states.
- `src/components/` — reusable brand and section-heading components.
- `src/styles.css` — responsive visual system, space/mission-control artwork, motion, and reduced-motion rules.
- `public/assets/` — local SVG placeholders for the archive gallery and favicon mark.
- `public/manus-routes.json` — managed website route manifest.

## Content and asset notes

The brief did not provide official dates, venue, rules, committee names, sponsor names, contact channels, statistics, or competition results. The interface therefore labels those areas as placeholders and does not present sample teams or scores as real data. Replace placeholder records in `src/data.ts` with verified organizer information before publication.

The four gallery images are deliberately local abstract SVG assets created for this frontend. They are labeled as visual placeholders in the UI so they can be replaced with verified Previous Editions photography without changing the layout.

## Build and deploy to Vercel

1. Push this project to a Git repository.
2. In Vercel, choose **Add New Project** and import the repository.
3. Keep the detected framework as **Vite**.
4. Use `npm run build` as the build command and `dist` as the output directory.
5. Deploy. Vercel will serve the single-page app from the generated `dist/index.html`.

No backend, database, admin panel, or registration workflow is included by design. Team registration is closed.
