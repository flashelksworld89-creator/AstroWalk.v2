import { ExternalLink, Map } from 'lucide-react';
import { googleStreetViewUrl } from '../lib/geo';

export default function StreetViewPanel({ destination, bearing, planet, onBack }) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const src = key
    ? `https://www.google.com/maps/embed/v1/streetview?key=${encodeURIComponent(key)}&location=${destination.lat},${destination.lng}&heading=${bearing}&pitch=0&fov=90`
    : '';

  return (
    <section className="street-view-panel">
      <div className="street-toolbar">
        <button type="button" className="secondary-button" onClick={onBack}><Map size={16} /> Back to map</button>
        <div><span>{planet.glyph}</span><strong>{planet.name} · {String(Math.round(bearing)).padStart(3, '0')}°</strong></div>
        <a className="primary-button" href={googleStreetViewUrl(destination, bearing)} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open Street View</a>
      </div>
      {src ? (
        <div className="street-embed-wrap">
          <iframe src={src} title={`Street View facing ${planet.name}`} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      ) : (
        <div className="street-empty">
          <span className="street-glyph">{planet.glyph}</span>
          <h2>Explore this destination at street level</h2>
          <p>Open Google Street View at this location, facing the selected planet’s mapped direction. Availability depends on local imagery.</p>
          <a className="primary-button" href={googleStreetViewUrl(destination, bearing)} target="_blank" rel="noreferrer"><ExternalLink size={17} /> Open Street View</a>
        </div>
      )}
    </section>
  );
}
