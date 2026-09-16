# AstroWalk 2.2 — Walking Map

Complete update for your existing AstroWalk repository. No new repository or
Google API key is needed.

## Install the update

1. Extract this ZIP into a new folder.
2. Open your current GitHub repository's main page, then Add file > Upload files.
3. Upload all the extracted contents together: src, tests, public, package.json,
   package-lock.json, index.html, vite.config.js, vercel.json, and README.md.
   Do not upload the ZIP or an extra enclosing folder.
4. Commit changes. Your connected Vercel project builds the source automatically.
5. Open the Ready production deployment. The header identifies version 2.2.

Keep Vercel's repository root at its default. The included vercel.json sets
Vite, npm run build, and output directory dist. No prebuilt dist is shipped.

## Walking Map

Street View is now Walking Map. It uses the same OpenStreetMap and wheel renderer
as the former close-up map, with the photograph pane and Google connection removed.

- Feet-scale radius from 25 to 2,500 feet, default 500 feet.
- All twelve planetary points, signs, degrees, houses, nakshatras and padas.
- Full screen / Exit full screen; browser fullscreen where available and an
  in-page fullscreen fallback on other browsers.
- Planet selection, feet range, location button, directions and time controls
  stay available in fullscreen.
- The radius persists independently from the main Map page's mile range.
- Use my location centers only the Walking Map. It takes a single location fix;
  tap again to refresh. It does not continuously track your device.
- Use searched address returns to the address from the main search field.
- Walking directions opens Google Maps directions in a separate tab without
  using a Google Maps API key. The destination is the selected ray's endpoint.
- A straight symbolic ray is not a walkable street route. Google Maps determines
  route availability; not every projected endpoint is reachable on foot.

Your Google environment variable may remain in Vercel; this version does not
read it or request Google Maps API scripts. Previously uploaded unused source
helpers do not need to be deleted manually.

## Main Map remains intact

The Map page retains its existing map renderer, 1–50-mile radius, layers,
fullscreen and route controls. The shortcut previously labeled Street view is
now Walking Map. Walking Map location and feet-range adjustments do not replace
the main Map's saved location or mile-range setting. Planet selection and chart
time are still shared between views, as they were previously.

## Time and calculation model

The time slider spans -12 to +12 hours in 15-minute steps, with one-hour buttons
and Now. Preview time is fixed until changed; Now follows the current time.
Displayed time uses the browser timezone. The timestamp tooltip exposes UTC.
All calculated placements and equal houses use the selected instant and active
view's location. Manual placements stay fixed and disable the time controls.

Astronomy Engine provides geocentric ecliptic longitudes. The app uses a linear
approximate Lahiri ayanamsa and mean lunar nodes for Rahu/Ketu. This is not a
certified ephemeris. Houses are equal 30-degree sectors from the eastern horizon
ascendant. Geographic compass conventions remain H1 east, H4 south, H7 west,
and H10 north. A planet ray is a symbolic mapped bearing, not sky azimuth.

Main wheel radius is center to edge (10 miles by default), not a constant width
for each nakshatra. Each angular sector widens farther from the center.

## Data and services

No login, Base44 account or birth information is required. Manual placements,
definitions, associated places and preferences are stored in this browser.
Maps and address searches use external OpenStreetMap-related services and need
a network connection. Location access requires browser permission.

## Development and checks

Use Node 22 or later:

```sh
npm ci
npm run dev
npm test
npm run build
```

The build runs regression tests before compiling. Tests cover wheel geometry,
feet-scale distances, twelve planetary entries, signs and nakshatra boundaries,
and eastern-horizon ascendants across a 24-hour window.

Desktop and phone browser checks exercise fullscreen, radius, time, location
success/denial, directions and isolation of the main map's settings. External
tiles and device position are simulated in automation; live tile delivery and
physical GPS accuracy remain dependent on the user's network and device.
