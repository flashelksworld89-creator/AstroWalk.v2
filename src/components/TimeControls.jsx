export default function TimeControls({ date, offset, onChange, manual }) {
  const label = new Intl.DateTimeFormat(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  }).format(date);
  return <section className="time-controls" aria-label="Chart time">
    <div><strong>{manual ? 'Manual placements' : offset === 0 ? 'Live now' : 'Time preview'}</strong>
      <time dateTime={date.toISOString()} title={date.toISOString()}>{label}</time>
    </div>
    <fieldset disabled={manual}>
      <button type="button" aria-label="Back one hour" disabled={offset <= -720} onClick={() => onChange(Math.max(-720, offset - 60))}>−1h</button>
      <label><span>−12h</span><input aria-label="Hours before or after now" type="range" min="-720" max="720" step="15" value={offset} onChange={e => onChange(Number(e.target.value))} /><span>+12h</span></label>
      <button type="button" aria-label="Forward one hour" disabled={offset >= 720} onClick={() => onChange(Math.min(720, offset + 60))}>+1h</button>
      <button type="button" onClick={() => onChange(0)}>Now</button>
    </fieldset>
    <small>{manual ? 'Switch to Live transits to explore time.' : `${offset > 0 ? '+' : ''}${offset / 60} h · browser timezone · equal houses · approximate Lahiri`}</small>
  </section>;
}
