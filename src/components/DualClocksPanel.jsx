import { useState } from 'react';
import { Clock3, MapPin } from 'lucide-react';

function localDateValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function localTimeValue() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function ClockPanel({ side, title, orientation, defaultCenter, defaultLocationLabel }) {
  const [date, setDate] = useState(localDateValue);
  const [time, setTime] = useState(localTimeValue);
  const [location, setLocation] = useState(defaultLocationLabel || '');
  const [latitude, setLatitude] = useState(defaultCenter?.lat ?? 40.7128);
  const [longitude, setLongitude] = useState(defaultCenter?.lng ?? -74.006);
  const [ayanamsha, setAyanamsha] = useState('lahiri');

  return (
    <article className="dual-clock-card">
      <header className="dual-clock-card-header">
        <div><small>{side}</small><h2>{title}</h2></div>
        <span>{orientation}</span>
      </header>

      <div className="dual-clock-settings">
        <label>Date<input type="date" min="1526-01-01" max="2026-12-31" value={date} onChange={e => setDate(e.target.value)} /></label>
        <label>Time<input type="time" step="1" value={time} onChange={e => setTime(e.target.value)} /></label>
        <label className="wide-control">Location<input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, address, or label" /></label>
        <label>Latitude<input type="number" min="-90" max="90" step="0.000001" value={latitude} onChange={e => setLatitude(e.target.value)} /></label>
        <label>Longitude<input type="number" min="-180" max="180" step="0.000001" value={longitude} onChange={e => setLongitude(e.target.value)} /></label>
        <label className="wide-control">Ayanamsha<select value={ayanamsha} onChange={e => setAyanamsha(e.target.value)}><option value="lahiri">Lahiri</option></select></label>
      </div>

      <div className="dual-clock-stage">
        <div className="dual-clock-placeholder">
          <Clock3 size={34} />
          <strong>{title}</strong>
          <span>{orientation}</span>
          <p>Wheel rendering and historical sidereal calculations will be connected in the next build.</p>
        </div>
      </div>

      <footer className="dual-clock-footer"><MapPin size={13} /><span>{location || 'No location label'} · {latitude}, {longitude}</span><b>Lahiri · Sidereal</b></footer>
    </article>
  );
}

export default function DualClocksPanel({ defaultCenter, defaultLocationLabel }) {
  return (
    <section className="dual-clocks-workspace">
      <header className="dual-clocks-titlebar">
        <div><p>SIDEREAL ASTROLOGICAL CLOCKS</p><h1>Dual Clocks</h1></div>
        <span>Independent controls</span>
      </header>
      <div className="dual-clocks-grid">
        <ClockPanel side="LEFT CLOCK" title="AstroWalk Wheel" orientation="DSC / 7th-house orientation" defaultCenter={defaultCenter} defaultLocationLabel={defaultLocationLabel} />
        <ClockPanel side="RIGHT CLOCK" title="Traditional Wheel" orientation="Traditional horoscope orientation" defaultCenter={defaultCenter} defaultLocationLabel={defaultLocationLabel} />
      </div>
    </section>
  );
}
