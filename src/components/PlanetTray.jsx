import { formatSignDegree } from '../lib/astro';

export default function PlanetTray({ placements, selectedId, onSelect }) {
  return (
    <div className="planet-tray" aria-label="Choose a planet">
      {placements.map((planet) => (
        <button
          key={planet.id}
          type="button"
          className={planet.id === selectedId ? 'planet-pill selected' : 'planet-pill'}
          onClick={() => onSelect(planet.id)}
          aria-pressed={planet.id === selectedId}
        >
          <span className="planet-glyph">{planet.glyph}</span>
          <span className="planet-pill-copy"><strong>{planet.name}</strong><small>{formatSignDegree(planet)}</small></span>
          {planet.retrograde && <span className="retrograde">R</span>}
        </button>
      ))}
    </div>
  );
}
