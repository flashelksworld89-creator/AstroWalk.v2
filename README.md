# AstroWalk 2.0 — fresh project

Complete source for a NEW GitHub repository and NEW Vercel project.

## Upload once

1. Extract the ZIP. Open the extracted folder until you see package.json,
   vercel.json, index.html, src, public, and tests together.
2. Create a GitHub repository, for example astrowalk-v2.
3. Upload ALL those files and folders to the repository's top level. Upload the
   contents, not the ZIP and not an extra enclosing folder. Commit the upload.
4. In Vercel, add a NEW project and import that new repository.
5. Framework: Vite. Root Directory: repository root (leave the default).
   Build Command: npm run build. Output Directory: dist.
   The included vercel.json specifies the build and output automatically.
6. Deploy, then use the NEW project's Visit link. The header says v2.0.

There is deliberately no prebuilt dist folder in this ZIP. Vercel must build
from source. No map key, login system, Base44 service or database is needed to
open the map. Do not copy files from the previous repository into this one.

Vercel configuration reference: https://vercel.com/docs/project-configuration

## Included

- OpenStreetMap street tiles and user-triggered address search.
- Coordinates or device location as the map center.
- Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Rahu, Ketu.
- Live approximate Lahiri sidereal placements; equal houses; mean lunar nodes.
- Manual sign, degree, house, nakshatra, pada, bearing and retrograde entries.
- House spokes, numbered nakshatra ring with a name key, zodiac ring, selected ray.
- House compass convention: H1 east, H4 south, H7 west, H10 north.
- Adjustable wheel radius 1–50 miles, default 10; separate route corridor width.
- Zoom-dependent labels, compact phone markers, fullscreen with exit control.
- Custom definitions and associated locations; JSON export/import.
- Feet/yards/miles and meters/kilometers for displayed distances.
- Route handoff to Google Maps; Street View handoff at the selected destination.
- Error recovery screen instead of an uninformative blank screen.

## Scope and external services

The 10-mile setting is the center-to-edge wheel radius, not a constant width for
each angular nakshatra sector. Each sector spans 13°20′ and gets wider farther
from the center. A projected planet marker is a symbolic compass direction,
not the celestial body's physical position on Earth or its true sky azimuth.
Navigation uses Google Maps streets rather than following the straight ray.

Embedded Street View is optional: set VITE_GOOGLE_MAPS_API_KEY in Vercel to
a Maps Embed API browser key restricted to your deployed domain. Redeploy after
adding it. Without a key, the Open Street View link works as a handoff. This
release does not draw a geographically tracked wheel inside Google's panorama.

Public tile/geocoding services and Google imagery need a network connection and
remain subject to their availability and usage rules. Production traffic may
require a dedicated provider. Browser location and compass access require
permission and suitable device support. The phone compass is an experimental
heading indicator, not calibrated turn-by-turn guidance.

Astronomical longitudes use Astronomy Engine, a linear approximate Lahiri
ayanamsa, and mean Rahu/Ketu. This is not a certified ephemeris. No birth date,
birth time, account or server profile is collected. Manual placements and
definitions persist in this browser; searches and map requests reach external
map providers.

## Development

Use Node 22 or later, then:

```sh
npm ci
npm run dev
```

npm test runs geometry and placement regression checks. npm run build runs
those checks and creates dist. npm run preview previews that build locally.
Opening index.html directly is not a supported way to run a Vite project.

## Verification

The previous Array.from wheel crash is covered by tests across all supported
integer radii. The release has also been checked in headless Chromium at desktop
and phone sizes. Browser tests substitute test tiles to avoid automated requests
to the public tile server; real maps, GPS hardware and Google imagery still need
a check on the deployed site.
