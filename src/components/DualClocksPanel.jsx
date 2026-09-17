export default function DualClocksPanel() {
  return (
    <section className="dual-clocks-workspace">

      <header className="dual-clocks-header">
        <div>
          <p className="dual-clocks-kicker">SIDEREAL ASTROLOGICAL CLOCKS</p>
          <h1>Dual Clock</h1>
        </div>

        <div className="dual-clocks-status">
          Independent chart controls
        </div>
      </header>

      <div className="dual-clocks-grid">

        <article className="astro-clock-panel">
          <div className="astro-clock-heading">
            <div>
              <small>LEFT CLOCK</small>
              <h2>AstroWalk Wheel</h2>
            </div>

            <span>DSC Orientation</span>
          </div>

          <div className="astro-clock-controls">
            <label>
              Date
              <input type="date" />
            </label>

            <label>
              Time
              <input type="time" step="1" />
            </label>

            <label>
              Location
              <input
                type="text"
                placeholder="City or coordinates"
              />
            </label>
          </div>

          <div className="astro-clock-stage">
            <div className="clock-placeholder">
              <strong>AstroWalk Wheel</strong>
              <span>Custom DSC / 7th-house orientation</span>
            </div>
          </div>
        </article>


        <article className="astro-clock-panel">
          <div className="astro-clock-heading">
            <div>
              <small>RIGHT CLOCK</small>
              <h2>Traditional Wheel</h2>
            </div>


            <span>Traditional Orientation</span>
          </div>

          <div className="astro-clock-controls">
            <label>
              Date
              <input type="date" />
            </label>

            <label>
              Time
              <input type="time" step="1" />
            </label>

            <label>
              Location
              <input
                type="text"
                placeholder="City or coordinates"
              />
            </label>
          </div>

          <div className="astro-clock-stage">
            <div className="clock-placeholder">
              <strong>Traditional Wheel</strong>
              <span>Standard horoscope orientation</span>
            </div>
          </div>
        </article>

      </div>
    </section>
  );
}
