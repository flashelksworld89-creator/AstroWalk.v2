import { useRef, useState } from 'react';
import { Download, MapPinPlus, Trash2, Upload } from 'lucide-react';
import { PLANETS } from '../lib/astro';
import { downloadJson } from '../lib/storage';

export default function DefinitionsPanel({ definitions, setDefinitions, center, locationLabel }) {
  const [selectedId, setSelectedId] = useState('sun');
  const [locationName, setLocationName] = useState(locationLabel || 'Current map center');
  const fileInput = useRef(null);
  const selected = PLANETS.find((planet) => planet.id === selectedId);
  const value = definitions[selectedId] || { text: '', locations: [] };

  const update = (patch) => setDefinitions((current) => ({
    ...current,
    [selectedId]: { ...current[selectedId], ...patch },
  }));

  const addLocation = () => {
    const name = locationName.trim() || 'Associated location';
    update({ locations: [...(value.locations || []), { id: crypto.randomUUID(), name, lat: center.lat, lng: center.lng }] });
    setLocationName('');
  };

  const importDefinitions = async (file) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed && typeof parsed === 'object') setDefinitions(parsed);
    } catch {
      window.alert('That file is not a valid AstroWalk definitions file.');
    }
  };

  return (
    <section className="workspace-panel definitions-panel">
      <aside className="definition-planets" aria-label="Choose planet definition">
        <p className="eyebrow">Your meanings</p>
        {PLANETS.map((planet) => (
          <button key={planet.id} type="button" className={selectedId === planet.id ? 'active' : ''} onClick={() => setSelectedId(planet.id)}>
            <span>{planet.glyph}</span>{planet.name}
          </button>
        ))}
      </aside>
      <div className="definition-editor">
        <div className="panel-heading compact">
          <div><p className="eyebrow">Custom definition</p><h2>{selected.glyph} {selected.name}</h2></div>
          <div className="definition-actions">
            <button type="button" className="secondary-button" onClick={() => downloadJson('astrowalk-definitions.json', definitions)}><Download size={16} /> Export</button>
            <button type="button" className="secondary-button" onClick={() => fileInput.current?.click()}><Upload size={16} /> Import</button>
            <input ref={fileInput} hidden type="file" accept="application/json" onChange={(event) => importDefinitions(event.target.files?.[0])} />
          </div>
        </div>
        <label className="field-label" htmlFor="definition-text">What {selected.name} means in your system</label>
        <textarea id="definition-text" className="definition-textarea" value={value.text || ''} onChange={(event) => update({ text: event.target.value })} />

        <div className="associated-heading"><div><h3>Associated locations</h3><p>Add the current map center as a place connected with {selected.name}.</p></div></div>
        <div className="add-location-row">
          <input value={locationName} onChange={(event) => setLocationName(event.target.value)} placeholder="Name this location" />
          <button type="button" className="primary-button" onClick={addLocation}><MapPinPlus size={17} /> Add map center</button>
        </div>
        <div className="location-list">
          {(value.locations || []).length === 0 ? <p className="empty-copy">No associated locations yet.</p> : value.locations.map((location) => (
            <div className="saved-location" key={location.id}>
              <div><strong>{location.name}</strong><small>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</small></div>
              <button type="button" aria-label={`Remove ${location.name}`} onClick={() => update({ locations: value.locations.filter((item) => item.id !== location.id) })}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <p className="privacy-note">Definitions and locations are stored only in this browser. Export a copy if you want to move them to another device.</p>
      </div>
    </section>
  );
}
