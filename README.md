# AstroWalk 2.1 — Street View and time controls

Complete updated source for your existing AstroWalk 2.0 repository.

## What changed

- Time slider from -12 to +12 hours in 15-minute increments; hourly step buttons
  and Now. The preview instant stays fixed until you move it or return to Now.
  Displayed times use the browser timezone (UTC is also exposed in the title).
- All twelve calculated placements, signs, degrees, nakshatras, padas and equal
  houses use the same selected instant and active location. Manual placements
  remain fixed and time controls are disabled in Manual mode.
- The ascendant explicitly selects the eastern ecliptic/horizon intersection;
  the earlier formula could select the western intersection and shift houses.
- Street View searches within 100 meters of the entered map location, not the
  distant planet-line endpoint. The companion wheel follows panorama movement.
- Street wheel radius: 25–2,500 feet, default 500 feet. This is center-to-edge
  ground distance on the companion map, not a perspective overlay on photographs.
- Missing-key, imagery-unavailable and connection-error messages with retry.

## Connect interactive Street View (required for imagery inside the app)

1. In Google Cloud, use a project with billing enabled and enable Maps JavaScript
   API. This release uses its Street View service; an Embed-only key is not enough.
2. Create or update a browser API key. Restrict it to Maps JavaScript API and to
   your website's HTTPS referrers, for example https://YOUR-SITE.vercel.app/*.
   Add a specific preview domain if you test there. Do not permit every website.
3. Vercel > your project > Settings > Environment Variables:
   name VITE_GOOGLE_MAPS_API_KEY; value your browser key. Include Production,
   and Preview only if you intend to use it there.
4. Save and redeploy the latest source so Vite includes the key. Browser API keys
   are public in built JavaScript; website/API restrictions protect their use.
5. Open Street view at a covered street. Google bills interactive panoramas under
   its Maps Platform pricing. Key setup cannot create imagery where none exists.

Sources:
- https://developers.google.com/maps/documentation/javascript/streetview
- https://developers.google.com/maps/documentation/javascript/error-messages

Without this setup, the companion map and Google handoff work, but embedded
photographs cannot load. Chart time does not change the date of recorded imagery.

## Upload once

1. Extract the ZIP. Open the extracted folder until you see package.json,
   vercel.json, index.html, src, public, and tests together.
2. Open your existing AstroWalk v2 GitHub repository.
3. Upload ALL those files and folders to the repository's top level. Upload the
   contents, not the ZIP and not an extra enclosing folder. Commit the upload.
4. Your connected Vercel project will deploy the commit.
5. Framework: Vite. Root Directory: repository root (leave the default).
   Build Command: npm run build. Output Directory: dist.
   The included vercel.json specifies the build and output automatically.
6. Once Ready, use the project's Visit link. The header says v2.1.

There is deliberately no prebuilt dist folder in this ZIP. Vercel must build
from source. No map key, login system, Base44 service or database is needed to
open the map. Upload this complete release together; do not mix individual files
from an older release.

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

Interactive Street View requires the Maps JavaScript API setup above. Without
a key, the Open in Google link works as a handoff. The geographically tracked
wheel is on a companion map, not inside the panorama.

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
