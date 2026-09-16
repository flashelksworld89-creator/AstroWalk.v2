import test from 'node:test';
import assert from 'node:assert/strict';
import { arc, band } from '../src/lib/wheelGeometry.js';
import { destinationPoint, METERS_PER_MILE, distanceLabel } from '../src/lib/geo.js';
import { computeLivePlacements, makeManualPlacement, toManualInputs } from '../src/lib/astro.js';

test('wheel rings render finite coordinates at every supported range', () => {
  for (const origin of [{lat:40.7128,lng:-74.006}, {lat:36.1,lng:-115.1}, {lat:-33.86,lng:151.2}]) {
    for (let miles=1; miles<=50; miles++) {
      for (const span of [360,30,360/27]) {
        const radius = miles * METERS_PER_MILE;
        const points = arc(origin,0,span,radius);
        assert(points.length >= 2);
        assert(points.flat().every(Number.isFinite));
        const end = destinationPoint(origin,span,radius);
        assert(Math.abs(points.at(-1)[0]-end.lat)<1e-10);
        assert(Math.abs(points.at(-1)[1]-end.lng)<1e-10);
        assert(band(origin,0,span,radius*.84,radius).flat().every(Number.isFinite));
      }
    }
  }
});

test('all twelve bodies have usable live and manual placements', () => {
  const live = computeLivePlacements(new Date('2026-09-16T12:00:00Z'),36.1,-115.1);
  assert.equal(live.length,12);
  assert.equal(new Set(live.map(p=>p.id)).size,12);
  for (const p of [...live,...toManualInputs(live).map(makeManualPlacement)]) {
    assert(Number.isFinite(p.bearing));
    assert(p.house>=1 && p.house<=12);
    assert(p.degree>=0 && p.degree<30);
    assert(p.nakshatraIndex>=0 && p.nakshatraIndex<27);
  }
  assert(Math.abs(((live[11].siderealLongitude-live[10].siderealLongitude+360)%360)-180)<1e-8);
});

test('distance labels progress from feet to yards to miles', () => {
  assert.equal(distanceLabel(30.48),'100 ft');
  assert.equal(distanceLabel(914.4),'1000 yd');
  assert.equal(distanceLabel(METERS_PER_MILE),'1.0 mi');
});
