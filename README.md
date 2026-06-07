# Family Itinerary — an Al3t3rd Cr3ation

A lightweight, iOS-style trip itinerary app that runs in any browser and installs as a Progressive Web App (PWA). Browse your trip day-by-day, explore saved places by category or location, see everything on a map, and import new itineraries or directories from Markdown / PDF — with smart de-duplication so nothing gets doubled up.

All your data stays **on your device** (in the browser's local storage). Nothing is uploaded anywhere.

## Live site

The app is served from GitHub Pages at:

```
https://alt3r3dp3rc3ption.github.io/Family_Vacation_Itinerary_PWA/
```

## GitHub Pages

1. Push these files to the repository (keep the `app/` folder intact).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then **Save**.
5. Wait ~1 minute. The live URL appears at the top of the Pages settings.

> PWAs require HTTPS — GitHub Pages provides this automatically. Opening the
> files directly from disk (`file://`) will **not** enable install/offline.

## Installing on your phone

- **iPhone / iPad (Safari):** open the live URL → tap **Share** → **Add to Home Screen**.
- **Android (Chrome):** open the live URL → tap the **Install** prompt (or ⋮ menu → *Install app*).

The app then runs full-screen and works offline after the first load.

## Project structure

```
index.html              App entry point (loads everything below)
Trip Itinerary.html     Same app — kept for reference; index.html is canonical
manifest.webmanifest    PWA manifest (name, icons, colors)
sw.js                   Service worker (offline caching)
app/
  styles.css            iOS-style design system
  seed.js               Bundled Copenhagen trip data
  store.js              On-device storage + merge / de-dupe engine
  parser.js             Markdown + PDF import parser
  components.jsx        Shared UI (nav, tabs, sheets, icons)
  itinerary.jsx         Itinerary tab (day-by-day timeline)
  directory.jsx         Directory tab (by category / location)
  map.jsx               Map tab (Leaflet pins)
  travel.jsx            Travel tab (flights, safety, offline prep)
  import.jsx            Import tab (upload + merge review)
  settings.jsx          Settings & share tab
  app.jsx               Root app / routing
  icon-192.png          App icons
  icon-512.png
tests/
  verify-pwa.ps1        Static verification for the GitHub Pages PWA
```

## Notes

- **Importing:** drop one or more `.md` or `.pdf` files. New places are added,
  blanks are auto-filled, and only genuine conflicts ask you to *Combine* or
  *Supersede* — re-importing the same file changes nothing.
- **Sharing:** use the in-app **Share** button to send a copy of your itinerary
  to Notes, Messages, Mail, etc. via the system share sheet.
- **Travel:** store Air France flight basics, emergency numbers, offline map prep,
  readiness checks, and places from Google Maps links.
- **Your data:** stored locally per-device. Clearing your browser data (or using
  the in-app *Erase all data*) removes it. Use **Export JSON backup** to keep a
  full local copy, including Travel data.
