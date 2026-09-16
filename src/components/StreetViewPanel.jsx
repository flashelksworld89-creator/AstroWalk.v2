import { useEffect, useRef, useState } from 'react';
import { LocateFixed, Map, Navigation, Maximize, Minimize } from 'lucide-react';
import { destinationPoint, googleRouteUrl } from '../lib/geo';
import { formatSignDegree } from '../lib/astro';
import { readStored, writeStored } from '../lib/storage';
import MapView from './MapView';

// Retain the filename so uploading this release replaces the previous panel.
export default function WalkingMapPanel({ position, onPosition, planet, placements, ascendant, selectedId, onSelect, layers, onBack, locationLabel, usingDeviceLocation, fullScreen, onToggleFullScreen, sectionRef, timeControls }) {
  const [radiusFeet, setRadiusFeet] = useState(() => {
    const saved = Number(readStored('astrowalk.walkingRadiusFeet', 500));
    return Number.isFinite(saved) ? Math.max(25, Math.min(2500, saved)) : 500;
  });
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const request = useRef(0);
  useEffect(() => () => { request.current += 1; }, []);
  useEffect(() => writeStored('astrowalk.walkingRadiusFeet', radiusFeet), [radiusFeet]);
  const destination = destinationPoint(position, planet.bearing, radiusFeet * .3048);
  const useLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) { setLocationError('Location is unavailable in this browser. You can use your searched address.'); return; }
    const id = ++request.current;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(result => {
      if (id !== request.current) return;
      setLocating(false);
      onPosition({lat:result.coords.latitude, lng:result.coords.longitude});
    }, () => {
      if (id !== request.current) return;
      setLocating(false);
      setLocationError('Could not get your location. Allow location access or use your searched address.');
    }, {enableHighAccuracy:true, timeout:12000, maximumAge:0});
  };
  const useAddress = () => {request.current += 1;setLocating(false);setLocationError('');onPosition(null);};

  return <section ref={sectionRef} className={`walking-workspace${fullScreen ? ' expanded-walking' : ''}`} aria-label="Walking Map">
    <div className="walking-actions">
      <button type="button" className="secondary-button" onClick={onBack}><Map size={16} /> Back to map</button>
      <button type="button" className="secondary-button" aria-pressed={fullScreen} onClick={onToggleFullScreen}>{fullScreen ? <Minimize size={16} /> : <Maximize size={16} />}{fullScreen ? 'Exit full screen' : 'Full screen'}</button>
      <select aria-label="Walking Map planet" value={selectedId} onChange={e => onSelect(e.target.value)}>{placements.map(p => <option key={p.id} value={p.id}>{p.glyph} {p.name}</option>)}</select>
      <button type="button" className="secondary-button" disabled={locating} onClick={useLocation}><LocateFixed size={16} />{locating ? 'Finding location…' : 'Use my location'}</button>
      {usingDeviceLocation && <button type="button" className="secondary-button" onClick={useAddress}>Use searched address</button>}
      <a className="primary-button" href={googleRouteUrl(position,destination,'walking')} target="_blank" rel="noreferrer"><Navigation size={16} /> Walking directions</a>
    </div>
    {locationError && <p className="walking-error" role="alert">{locationError}</p>}
    <p className="walking-location">{usingDeviceLocation ? 'Device location (tap Use my location to refresh)' : locationLabel}</p>
    <div className="walking-summary"><strong>{planet.name} · {formatSignDegree(planet)} · H{planet.house}</strong><span>{planet.nakshatra} · Pada {planet.pada} · mapped bearing {Math.round(planet.bearing)}°</span></div>
    {fullScreen && timeControls}
    <label className="walking-radius">Wheel radius <input aria-label="Walking wheel radius in feet" type="range" min="25" max="2500" step="25" value={radiusFeet} onChange={e => setRadiusFeet(Number(e.target.value))} /><output>{radiusFeet.toLocaleString()} ft</output></label>
    <div className="walking-wheel-map"><MapView compact fullScreen={fullScreen} center={position} placements={placements} ascendant={ascendant} selectedId={selectedId} onSelectPlanet={onSelect} rangeMiles={radiusFeet / 5280} corridorMiles={Math.min(20,radiusFeet/10)/5280} layers={layers} locationLabel={usingDeviceLocation ? 'Device location' : locationLabel} /></div>
    <p className="walking-note">Range is center to edge. The gold line shows your planet’s mapped direction; Walking directions opens a street route in Google Maps. No Google API key is needed.</p>
  </section>;
}
