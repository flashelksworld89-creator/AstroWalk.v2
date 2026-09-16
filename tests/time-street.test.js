import test from 'node:test';
import assert from 'node:assert/strict';
import * as Astronomy from 'astronomy-engine';
import { siderealAscendant, lahiriAyanamsa, computeLivePlacements, placementFromLongitude } from '../src/lib/astro.js';
import { arc, band } from '../src/lib/wheelGeometry.js';

test('ascendant lies on eastern horizon throughout a 24-hour window', () => {
  for (const [lat,lng] of [[36.1,-115.1],[-33.86,151.2],[0,0],[51.5,-0.1]]) {
    for (let hour=-12;hour<=12;hour++) {
      const date=new Date(Date.UTC(2026,8,16,12+hour));
      const lon=(siderealAscendant(date,lat,lng)+lahiriAyanamsa(date))*Math.PI/180;
      const eq=Astronomy.EquatorFromVector(Astronomy.RotateVector(Astronomy.Rotation_ECT_EQD(date),new Astronomy.Vector(Math.cos(lon),Math.sin(lon),0,Astronomy.MakeTime(date))));
      const horizon=Astronomy.Horizon(date,new Astronomy.Observer(lat,lng,0),eq.ra,eq.dec,'');
      assert(Math.abs(horizon.altitude)<1e-7, `not on horizon at ${lat},${lng},${hour}`);
      assert(horizon.azimuth>=0 && horizon.azimuth<180, `western intersection at ${hour}`);
    }
  }
});

test('time changes recompute all twelve longitudes and equal houses', () => {
  const start=new Date('2026-09-16T12:00:00Z');
  const states=[-12,0,12].map(h=>computeLivePlacements(new Date(start.getTime()+h*3600000),36.1,-115.1));
  for(const state of states) {
    assert.equal(state.length,12);
    for(const p of state) {
      assert.equal(p.nakshatraIndex,Math.floor(p.siderealLongitude/(360/27)));
      assert(p.house>=1 && p.house<=12);
      assert(p.degree>=0 && p.degree<30);
    }
  }
  assert.notEqual(states[0][1].siderealLongitude,states[2][1].siderealLongitude);
  assert.notEqual(states[0][0].house,states[1][0].house);
});

test('sign, nakshatra and house boundary assignments', () => {
  assert.equal(placementFromLongitude('sun',0,0).sign,'Aries');
  assert.equal(placementFromLongitude('sun',30,0).sign,'Taurus');
  assert.equal(placementFromLongitude('sun',360/27+1e-9,0).nakshatra,'Bharani');
  assert.equal(placementFromLongitude('sun',29.999,0).house,1);
  assert.equal(placementFromLongitude('sun',30,0).house,2);
});

test('feet-scale wheel has finite geometry including 25 feet', () => {
  for(const feet of [25,50,100,500,2500]) {
    const radius=feet*.3048;
    const points=arc({lat:36.1,lng:-115.1},0,360,radius);
    assert(points.flat().every(Number.isFinite));
    assert(band({lat:36.1,lng:-115.1},0,360/27,radius*.84,radius).flat().every(Number.isFinite));
    // Due-north distance has a direct spherical latitude conversion.
    assert(Math.abs((points[0][0]-36.1)*Math.PI/180*6371008.8-radius)<1e-6);
  }
});
