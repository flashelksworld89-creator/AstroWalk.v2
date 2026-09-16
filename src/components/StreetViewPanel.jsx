import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Map } from 'lucide-react';
import { googleStreetViewUrl } from '../lib/geo';
import { formatSignDegree } from '../lib/astro';
import { loadGoogleMaps } from '../lib/googleMaps';
import MapView from './MapView';

export default function StreetViewPanel({ origin, position, onPosition, planet, placements, ascendant, selectedId, onSelect, layers, onBack }) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const canvas = useRef(null);
  const pano = useRef(null);
  const bearing = useRef(planet.bearing);
  bearing.current = planet.bearing;
  const [status, setStatus] = useState(key ? 'loading' : 'unconfigured');
  const [message, setMessage] = useState('');
  const [retry, setRetry] = useState(0);
  const [radiusFeet, setRadiusFeet] = useState(500);
  const [heading, setHeading] = useState(planet.bearing);
  const [imageDate, setImageDate] = useState('');

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    const listeners = [];
    let viewer;
    setStatus('loading');
    setMessage('');
    const authFailed = () => { if (!cancelled) { setStatus('error'); setMessage('Google rejected the connection. The site owner must check the key, billing and website restrictions.'); } };
    window.addEventListener('astrowalk-maps-auth-error', authFailed);
    loadGoogleMaps(key).then(maps => {
      if (cancelled) return;
      const service = new maps.StreetViewService();
      service.getPanorama({ location: origin, radius: 100, preference: maps.StreetViewPreference.NEAREST }, (data, result) => {
        if (cancelled) return;
        if (result !== maps.StreetViewStatus.OK || !data?.location?.latLng) {
          setStatus('error');
          setMessage(result === maps.StreetViewStatus.ZERO_RESULTS ? 'No Street View imagery was found within 100 meters. Search for a nearby street and try again.' : 'Google could not load this panorama. Check the connection or try another location.');
          return;
        }
        viewer = new maps.StreetViewPanorama(canvas.current, {
          pano: data.location.pano, pov: {heading: bearing.current, pitch: 0}, zoom: 0,
          motionTracking: false, motionTrackingControl: false, fullscreenControl: true,
        });
        pano.current = viewer;
        const updatePosition = () => {
          const p = viewer.getPosition();
          if (p) onPosition({lat: p.lat(), lng: p.lng()});
        };
        onPosition({lat:data.location.latLng.lat(), lng:data.location.latLng.lng()});
        setHeading(bearing.current);
        setImageDate(data.imageDate || '');
        listeners.push(viewer.addListener('position_changed', updatePosition));
        listeners.push(viewer.addListener('pov_changed', () => setHeading(viewer.getPov().heading)));
        listeners.push(viewer.addListener('pano_changed', () => {
          setImageDate('');
          const id = viewer.getPano();
          service.getPanorama({pano: id}, (next, code) => {
            if (!cancelled && viewer.getPano() === id && code === maps.StreetViewStatus.OK) setImageDate(next?.imageDate || '');
          });
        }));
        listeners.push(viewer.addListener('status_changed', () => {
          if (viewer.getStatus() !== maps.StreetViewStatus.OK) {setStatus('error');setMessage('This panorama could not load. Retry or choose another nearby street.');}
        }));
        setStatus('ready');
      });
    }).catch(error => { if (!cancelled) {setStatus('error');setMessage(error.message);} });
    return () => {
      cancelled = true;
      listeners.forEach(listener => listener.remove());
      viewer?.setVisible(false);
      pano.current = null;
      window.removeEventListener('astrowalk-maps-auth-error', authFailed);
    };
  }, [key, origin.lat, origin.lng, retry, onPosition]);

  return <section className="street-view-panel street-workspace">
    <div className="street-actions">
      <button type="button" className="secondary-button" onClick={onBack}><Map size={16} /> Back to map</button>
      <select aria-label="Street View planet" value={selectedId} onChange={e => onSelect(e.target.value)}>{placements.map(p => <option key={p.id} value={p.id}>{p.glyph} {p.name}</option>)}</select>
      <button type="button" className="secondary-button" disabled={status !== 'ready'} onClick={() => pano.current?.setPov({heading:planet.bearing,pitch:0})}>Face {planet.name}</button>
      <a className="primary-button" href={googleStreetViewUrl(position,planet.bearing)} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open in Google</a>
    </div>
    <div className="street-summary"><strong>{planet.name} · {formatSignDegree(planet)} · H{planet.house}</strong><span>{planet.nakshatra} · Pada {planet.pada} · mapped bearing {Math.round(planet.bearing)}°</span></div>
    <div className="street-split">
      <div className="panorama-shell">
        <div ref={canvas} className="panorama-canvas" aria-label="Interactive Google Street View" />
        {status !== 'ready' && <div className="panorama-message" role="status">
          <h2>{status === 'loading' ? 'Finding nearby Street View…' : status === 'unconfigured' ? 'Street View needs a connection' : 'Street View unavailable'}</h2>
          <p>{status === 'unconfigured' ? 'The site owner needs to connect Google Street View. You can use the feet-scale map here or open this location in Google.' : message}</p>
          {status === 'error' && <button type="button" className="secondary-button" onClick={() => setRetry(v => v+1)}>Retry Street View</button>}
          <a href={googleStreetViewUrl(position,planet.bearing)} target="_blank" rel="noreferrer">Open this location in Google Street View</a>
        </div>}
        {status === 'ready' && <div className="panorama-caption">Facing {Math.round(heading)}° · {imageDate ? `Imagery: ${imageDate}` : 'Recorded imagery'} · arrows move along streets</div>}
      </div>
      <div className="street-wheel-panel">
        <label className="street-radius">Wheel radius <input aria-label="Street wheel radius in feet" type="range" min="25" max="2500" step="25" value={radiusFeet} onChange={e => setRadiusFeet(Number(e.target.value))} /><output>{radiusFeet.toLocaleString()} ft</output></label>
        <div className="street-wheel-map"><MapView compact center={position} placements={placements} ascendant={ascendant} selectedId={selectedId} onSelectPlanet={onSelect} rangeMiles={radiusFeet / 5280} corridorMiles={Math.min(20,radiusFeet/10)/5280} layers={layers} locationLabel="Street View position" /></div>
        <p>Wheel follows the panorama’s location. Range is center to edge. Time controls change the chart, not the age of street photos.</p>
      </div>
    </div>
  </section>;
}
