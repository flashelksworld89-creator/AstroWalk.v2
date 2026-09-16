import { Check, RotateCcw } from 'lucide-react';
import { NAKSHATRAS, PLANETS, SIGNS } from '../lib/astro';

export default function PlacementsPanel({ mode, onModeChange, inputs, onUpdate, onReset }) {
  return (
    <section className="workspace-panel placements-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Planetary data</p>
          <h2>Placements</h2>
          <p>Live Lahiri sidereal transits are the default. Switch to manual mode to enter your own chart.</p>
        </div>
        <div className="mode-switch" role="group" aria-label="Placement source">
          <button type="button" className={mode === 'live' ? 'active' : ''} onClick={() => onModeChange('live')}>Live transits</button>
          <button type="button" className={mode === 'manual' ? 'active' : ''} onClick={() => onModeChange('manual')}>Manual</button>
        </div>
      </div>

      {mode === 'live' ? (
        <div className="live-message">
          <Check size={18} aria-hidden="true" />
          <div><strong>Current transits are active</strong><p>Planet positions and equal-house placements update from the selected map location and current time.</p></div>
        </div>
      ) : (
        <>
          <div className="placements-toolbar">
            <p>Changes appear on the map immediately and stay on this device.</p>
            <button type="button" className="text-button" onClick={onReset}><RotateCcw size={15} /> Reset to current transits</button>
          </div>
          <div className="placement-table-wrap">
            <table className="placement-table">
              <thead>
                <tr><th>Planet</th><th>Sidereal sign</th><th>Degree</th><th>House</th><th>Nakshatra</th><th>Pada</th><th>Bearing</th><th>R</th></tr>
              </thead>
              <tbody>
                {PLANETS.map((planet) => {
                  const input = inputs.find((item) => item.id === planet.id);
                  if (!input) return null;
                  return (
                    <tr key={planet.id}>
                      <th scope="row"><span className="table-glyph">{planet.glyph}</span>{planet.name}</th>
                      <td><select value={input.sign} onChange={(event) => onUpdate(planet.id, 'sign', event.target.value)} aria-label={`${planet.name} sign`}>{SIGNS.map((sign) => <option key={sign}>{sign}</option>)}</select></td>
                      <td><input type="number" min="0" max="29.999" step="0.01" value={input.degree} onChange={(event) => onUpdate(planet.id, 'degree', event.target.value)} aria-label={`${planet.name} degree`} /></td>
                      <td><select value={input.house} onChange={(event) => onUpdate(planet.id, 'house', event.target.value)} aria-label={`${planet.name} house`}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>H{index + 1}</option>)}</select></td>
                      <td><select value={input.nakshatra} onChange={(event) => onUpdate(planet.id, 'nakshatra', event.target.value)} aria-label={`${planet.name} nakshatra`}>{NAKSHATRAS.map((nakshatra) => <option key={nakshatra}>{nakshatra}</option>)}</select></td>
                      <td><select value={input.pada} onChange={(event) => onUpdate(planet.id, 'pada', event.target.value)} aria-label={`${planet.name} pada`}>{[1, 2, 3, 4].map((pada) => <option key={pada}>{pada}</option>)}</select></td>
                      <td><input type="number" min="0" max="359.9" step="0.1" value={input.bearing} onChange={(event) => onUpdate(planet.id, 'bearing', event.target.value)} aria-label={`${planet.name} compass bearing`} /></td>
                      <td><input type="checkbox" checked={input.retrograde} onChange={(event) => onUpdate(planet.id, 'retrograde', event.target.checked)} aria-label={`${planet.name} retrograde`} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
