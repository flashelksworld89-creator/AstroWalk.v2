import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bike,
  BookOpen,
  Footprints,
  Car,
  Clock3,
  ChevronDown,
  Compass,
  Crosshair,
  Layers3,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Maximize,
  Minimize,
  Navigation,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import MapView from './components/MapView';
import PlanetTray from './components/PlanetTray';
import PlacementsPanel from './components/PlacementsPanel';
import DefinitionsPanel from './components/DefinitionsPanel';
import WalkingMapPanel from './components/StreetViewPanel';
import TimeControls from './components/TimeControls';
import DualClocksPanel from './components/DualClocksPanel';
import {
  DEFAULT_DEFINITIONS,
  NAKSHATRAS,
  computeLivePlacements,
  formatSignDegree,
  makeManualPlacement,
  siderealAscendant,
  toManualInputs,
  cardinalDirection,
  normalize,
} from './lib/astro';
import { destinationPoint, distanceLabel, googleRouteUrl, METERS_PER_MILE } from './lib/geo';
import { readStored, writeStored } from './lib/storage';

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 };

function initialDefinitions() {
  const stored = readStored('astrowalk.definitions', null);
  if (stored) return stored;
  return Object.fromEntries(Object.entries(DEFAULT_DEFINITIONS).map(([id, text]) => [id, { text, locations: [] }]));
}

function NavigationTabs({ active, onChange }) {
  const tabs = [
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'walking', label: 'Walking Map', icon: Footprints },
    { id: 'clocks', label: 'Dual Clocks', icon: Clock3 },
    { id: 'placements', label: 'Placements', icon: SlidersHorizontal },
    { id: 'definitions', label: 'Definitions', icon: BookOpen },
  ];
  return (
    <nav className="main-tabs" aria-label="Main sections">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" className={active === id ? 'active' : ''} onClick={() => onChange(id)} aria-current={active === id ? 'page' : undefined}>
          <Icon size={18} aria-hidden="true" /><span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function App() {
  const [center, setCenter] = useState(() => readStored('astrowalk.center', DEFAULT_CENTER));
  const [locationLabel, setLocationLabel] = useState(() => readStored('astrowalk.locationLabel', 'New York, NY'));
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [activeTab, setActiveTab] = useState('map');
  const [fullScreen, setFullScreen] = useState(false);
  const mapSection = useRef(null);
  const nativeFullscreen = useRef(false);
  const exitFullScreen = () => {
    setFullScreen(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };
  const enterFullScreen = () => {
    setFullScreen(true);
    setShowLayers(false);
    mapSection.current?.requestFullscreen?.().catch(() => {});
  };
  useEffect(() => {
    const changed = () => {
      if (document.fullscreenElement) nativeFullscreen.current = true;
      else if (nativeFullscreen.current) {
        nativeFullscreen.current = false;
        setFullScreen(false);
      }
    };
    const escape = event => { if (event.key === 'Escape') setFullScreen(false); };
    document.addEventListener('fullscreenchange', changed);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('fullscreenchange', changed);
      document.removeEventListener('keydown', escape);
    };
  }, []);
  useEffect(() => {
    if (!fullScreen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [fullScreen]);
  const [mode, setMode] = useState(() => readStored('astrowalk.mode', 'live'));
  const [now, setNow] = useState(() => new Date());
  const [timeOffset, setTimeOffset] = useState(0);
  const [timeAnchor, setTimeAnchor] = useState(null);
  const [manualTime, setManualTime] = useState(() => new Date());
  const [walkingPosition, setWalkingPosition] = useState(null);
  const changeTime = minutes => {
    if (mode === 'manual') return;
    const offset = Math.max(-720, Math.min(720, minutes));
    setTimeOffset(offset);
    if (offset === 0) {setTimeAnchor(null);setNow(new Date());}
    else if (timeAnchor === null) setTimeAnchor(now.getTime());
  };
  const chartDate = useMemo(() => mode === 'manual' ? manualTime : timeOffset === 0 ? now : new Date(timeAnchor + timeOffset * 60000), [mode, manualTime, now, timeAnchor, timeOffset]);
  const chartCenter = activeTab === 'walking' && walkingPosition ? walkingPosition : center;
  useEffect(() => setWalkingPosition(null), [center.lat, center.lng]);
  const [rangeMiles, setRangeMiles] = useState(() => readStored('astrowalk.rangeMiles', 10));
  const [corridorMiles, setCorridorMiles] = useState(() => readStored('astrowalk.corridorMiles', 0.25));
  const [units, setUnits] = useState(() => readStored('astrowalk.units', 'imperial'));
  const [selectedId, setSelectedId] = useState('sun');
  const [definitions, setDefinitions] = useState(initialDefinitions);
  const [showLayers, setShowLayers] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [targetId, setTargetId] = useState('line');
  const [routeMode, setRouteMode] = useState('walking');
  const [deviceHeading, setDeviceHeading] = useState(null);
  const [compassError, setCompassError] = useState('');
  const [layers, setLayers] = useState({ zodiac: true, nakshatras: true, houses: true });

  const livePlacements = useMemo(() => computeLivePlacements(chartDate, chartCenter.lat, chartCenter.lng), [chartDate, chartCenter.lat, chartCenter.lng]);
  const ascendant = useMemo(() => siderealAscendant(chartDate, chartCenter.lat, chartCenter.lng), [chartDate, chartCenter.lat, chartCenter.lng]);
  const [manualInputs, setManualInputs] = useState(() => readStored('astrowalk.manualPlacements', toManualInputs(livePlacements)));
  const manualPlacements = useMemo(() => manualInputs.map(makeManualPlacement), [manualInputs]);
  const placements = mode === 'manual' ? manualPlacements : livePlacements;
  const selected = placements.find((planet) => planet.id === selectedId) || placements[0];
  const associatedLocations = definitions[selected?.id]?.locations || [];
  const lineDestination = selected
    ? destinationPoint(center, selected.bearing, rangeMiles * METERS_PER_MILE)
    : center;
  const destination = targetId === 'line'
    ? lineDestination
    : associatedLocations.find((location) => location.id === targetId) || lineDestination;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => writeStored('astrowalk.center', center), [center]);
  useEffect(() => writeStored('astrowalk.locationLabel', locationLabel), [locationLabel]);
  useEffect(() => writeStored('astrowalk.mode', mode), [mode]);
  useEffect(() => writeStored('astrowalk.rangeMiles', rangeMiles), [rangeMiles]);
  useEffect(() => writeStored('astrowalk.corridorMiles', corridorMiles), [corridorMiles]);
  useEffect(() => writeStored('astrowalk.units', units), [units]);
  useEffect(() => writeStored('astrowalk.manualPlacements', manualInputs), [manualInputs]);
  useEffect(() => writeStored('astrowalk.definitions', definitions), [definitions]);
  useEffect(() => setTargetId('line'), [selectedId]);

  const searchLocation = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    const coordinateMatch = query.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
    if (coordinateMatch) {
      const lat = Number(coordinateMatch[1]);
      const lng = Number(coordinateMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setCenter({ lat, lng });
        setLocationLabel(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        setQuery('');
        setActiveTab('map');
        return;
      }
    }
    setSearching(true);
    setLocationError('');
    try {
      const params = new URLSearchParams({ q: query, format: 'jsonv2', limit: '1', addressdetails: '1' });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, { headers: { 'Accept-Language': 'en' } });
      if (!response.ok) throw new Error('Location search is unavailable.');
      const results = await response.json();
      if (!results[0]) throw new Error('No matching location was found. Try adding a city or ZIP code.');
      setCenter({ lat: Number(results[0].lat), lng: Number(results[0].lon) });
      setLocationLabel(results[0].display_name);
      setQuery('');
      setActiveTab('map');
    } catch (error) {
      setLocationError(error.message || 'Could not find that location.');
    } finally {
      setSearching(false);
    }
  };

  const useCurrentLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('This browser does not support location access.');
      return;
    }
    setSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationLabel('Current location');
        setActiveTab('map');
        setSearching(false);
      },
      () => {
        setLocationError('Location access was not granted. You can still search for an address.');
        setSearching(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const enableCompass = async () => {
    setCompassError('');
    try {
      if (typeof DeviceOrientationEvent === 'undefined') throw new Error('Compass data is not available on this device.');
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') throw new Error('Compass permission was not granted.');
      }
      const handler = (event) => {
        const heading = event.webkitCompassHeading ?? (event.alpha == null ? null : normalize(360 - event.alpha));
        if (heading != null) setDeviceHeading(heading);
      };
      window.addEventListener('deviceorientation', handler, true);
    } catch (error) {
      setCompassError(error.message || 'Could not start the phone compass.');
    }
  };

  const updateManualInput = (id, field, rawValue) => {
    setManualInputs((current) => current.map((input) => {
      if (input.id !== id) return input;
      const value = ['degree', 'house', 'pada', 'bearing'].includes(field) ? Number(rawValue) : rawValue;
      const next = { ...input, [field]: value };
      if (field === 'sign' || field === 'degree') {
        const signIndex = Math.max(0, ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'].indexOf(next.sign));
        const longitude = signIndex * 30 + Math.max(0, Math.min(29.999, Number(next.degree) || 0));
        const nakSize = 360 / 27;
        next.nakshatra = NAKSHATRAS[Math.floor(longitude / nakSize) % 27];
        next.pada = Math.floor((longitude % nakSize) / (nakSize / 4)) + 1;
      }
      if (field === 'house' || field === 'degree') {
        next.bearing = Number(normalize((Number(next.house) - 10) * 30 + Number(next.degree)).toFixed(1));
      }
      return next;
    }));
  };

  const resetManual = () => setManualInputs(toManualInputs(livePlacements));
  const beginRoute = () => window.open(googleRouteUrl(center, destination, routeMode), '_blank', 'noopener,noreferrer');

  return (
    <div className={`app-shell${fullScreen ? ' map-fullscreen' : ''}`}>
      <header className="app-header">
        <div className="brand-block"><div className="brand-mark"><Compass size={21} /></div><div><h1>AstroWalk</h1><p>Sidereal map compass · v2.2</p></div></div>
        <form className="location-search" onSubmit={searchLocation}>
          <Search size={17} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Enter an address, city, landmark, or coordinates" aria-label="Search for a location" />
          {query && <button className="clear-search" type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button>}
          <button className="search-button" type="submit" disabled={searching}>{searching ? 'Finding…' : 'Center map'}</button>
        </form>
        <div className="header-actions">
          <button type="button" className="icon-action" onClick={useCurrentLocation} aria-label="Use my current location"><LocateFixed size={19} /></button>
          <button type="button" className={deviceHeading == null ? 'compass-action' : 'compass-action active'} onClick={enableCompass}>
            <Navigation size={17} />{deviceHeading == null ? 'Phone compass' : `${Math.round(deviceHeading)}°`}
          </button>
        </div>
      </header>
      {(locationError || compassError) && <div className="error-banner" role="alert">{locationError || compassError}</div>}

      <NavigationTabs active={activeTab} onChange={setActiveTab} />
      {!fullScreen && <TimeControls date={chartDate} offset={timeOffset} onChange={changeTime} manual={mode === 'manual'} />}

      <main className="app-main">
        {activeTab === 'map' && (
          <section ref={mapSection} className={`map-workspace${fullScreen ? ' expanded-map' : ''}`}>
            {fullScreen && <div className="fullscreen-time"><TimeControls date={chartDate} offset={timeOffset} onChange={changeTime} manual={mode === 'manual'} /></div>}
            <div className="map-controls">
              <div className="range-control">
                <label htmlFor="range">Wheel radius</label>
                <input id="range" type="range" min="1" max="50" step="1" value={rangeMiles} onChange={(event) => setRangeMiles(Number(event.target.value))} />
                <output>{rangeMiles} mi</output>
              </div>
              <button type="button" className="map-control-button" onClick={() => setShowLayers((value) => !value)} aria-expanded={showLayers}><Layers3 size={17} /> Layers <ChevronDown size={14} /></button>
              <button type="button" className="map-control-button fullscreen-button" onClick={fullScreen ? exitFullScreen : enterFullScreen} aria-pressed={fullScreen}>
                {fullScreen ? <Minimize size={17} /> : <Maximize size={17} />}{fullScreen ? 'Exit full screen' : 'Full screen'}
              </button>
              {fullScreen && <select className="fullscreen-planets" aria-label="Choose planet" value={selectedId} onChange={event => setSelectedId(event.target.value)}>{placements.map(p => <option key={p.id} value={p.id}>{p.glyph} {p.name}</option>)}</select>}
              {showLayers && (
                <div className="layers-popover">
                  {Object.entries({ zodiac: 'Zodiac signs', nakshatras: 'Nakshatras', houses: 'Houses' }).map(([key, label]) => (
                    <label key={key}><input type="checkbox" checked={layers[key]} onChange={(event) => setLayers((current) => ({ ...current, [key]: event.target.checked }))} />{label}</label>
                  ))}
                  <label>Units<select value={units} onChange={(event) => setUnits(event.target.value)}><option value="imperial">Feet / yards / miles</option><option value="metric">Meters / kilometers</option></select></label>
                  <label>Route corridor<select value={corridorMiles} onChange={(event) => setCorridorMiles(Number(event.target.value))}><option value="0.1">0.1 mile</option><option value="0.25">0.25 mile</option><option value="0.5">0.5 mile</option><option value="1">1 mile</option></select></label>
                </div>
              )}
              <div className="location-chip"><MapPin size={14} /><span title={locationLabel}>{locationLabel}</span></div>
              <div className="source-chip">{mode === 'manual' ? 'Manual placements' : timeOffset === 0 ? 'Live transits' : 'Time preview'} · Lahiri</div>
            </div>

            <MapView
              fullScreen={fullScreen}
              center={center}
              placements={placements}
              ascendant={ascendant}
              selectedId={selectedId}
              onSelectPlanet={(id) => { setSelectedId(id); setShowRoute(false); }}
              rangeMiles={rangeMiles}
              corridorMiles={corridorMiles}
              layers={layers}
              locationLabel={locationLabel}
            />

            <PlanetTray placements={placements} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setShowRoute(false); }} />

            {selected && (
              <aside className={showRoute ? 'planet-detail route-open' : 'planet-detail'}>
                <button className="detail-close" type="button" onClick={() => setShowRoute(false)} aria-label="Collapse planet details"><X size={17} /></button>
                <div className="detail-title"><span>{selected.glyph}</span><div><p>{mode === 'manual' ? 'Manual placement' : timeOffset === 0 ? 'Live sidereal transit' : 'Sidereal time preview'}</p><h2>{selected.name}</h2></div>{selected.retrograde && <em>Retrograde</em>}</div>
                <div className="detail-grid">
                  <div><small>Placement</small><strong>{formatSignDegree(selected)}</strong></div>
                  <div><small>House</small><strong>H{selected.house} · {String(Math.round(selected.bearing)).padStart(3, '0')}° {cardinalDirection(selected.bearing)}</strong></div>
                  <div><small>Nakshatra</small><strong>{selected.nakshatra} · Pada {selected.pada}</strong></div>
                  <div><small>Range</small><strong>{distanceLabel(rangeMiles * METERS_PER_MILE, units)}</strong></div>
                </div>
                <p className="planet-definition">{definitions[selected.id]?.text}</p>
                {!showRoute ? (
                  <div className="detail-actions">
                    <button type="button" className="primary-button" onClick={() => setShowRoute(true)}><Navigation size={17} /> Choose destination</button>
                    <button type="button" className="secondary-button" onClick={() => setActiveTab('walking')}><Footprints size={17} /> Walking Map</button>
                  </div>
                ) : (
                  <div className="route-options">
                    <label>Destination<select value={targetId} onChange={(event) => setTargetId(event.target.value)}><option value="line">Planet line endpoint · {rangeMiles} mi</option>{associatedLocations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label>
                    <div className="travel-modes" role="group" aria-label="Travel mode">
                      <button type="button" className={routeMode === 'walking' ? 'active' : ''} onClick={() => setRouteMode('walking')}><Navigation size={16} /> Walk</button>
                      <button type="button" className={routeMode === 'cycling' ? 'active' : ''} onClick={() => setRouteMode('cycling')}><Bike size={16} /> Cycle</button>
                      <button type="button" className={routeMode === 'driving' ? 'active' : ''} onClick={() => setRouteMode('driving')}><Car size={16} /> Drive</button>
                    </div>
                    <button type="button" className="primary-button full" onClick={beginRoute}><Crosshair size={17} /> Begin route</button>
                    <p>Navigation opens with real streets. The highlighted corridor remains {corridorMiles} mile wide in AstroWalk.</p>
                  </div>
                )}
              </aside>
            )}
          </section>
        )}

        {activeTab === 'walking' && selected && (
          <WalkingMapPanel position={walkingPosition || center} onPosition={setWalkingPosition} usingDeviceLocation={Boolean(walkingPosition)} locationLabel={locationLabel} planet={selected} placements={placements} ascendant={ascendant} selectedId={selectedId} onSelect={setSelectedId} layers={layers} sectionRef={mapSection} fullScreen={fullScreen} onToggleFullScreen={fullScreen ? exitFullScreen : enterFullScreen} timeControls={<TimeControls date={chartDate} offset={timeOffset} onChange={changeTime} manual={mode === 'manual'} />} onBack={() => {exitFullScreen();setActiveTab('map');}} />
        )}
        {activeTab === 'clocks' && (
          <DualClocksPanel defaultCenter={center} defaultLocationLabel={locationLabel} />
        )}
        {activeTab === 'placements' && (
          <PlacementsPanel mode={mode} onModeChange={value => { if(value === 'manual') setManualTime(chartDate); setMode(value); }} chartDate={chartDate} timeOffset={timeOffset} placements={livePlacements} inputs={manualInputs} onUpdate={updateManualInput} onReset={resetManual} />
        )}
        {activeTab === 'definitions' && (
          <DefinitionsPanel definitions={definitions} setDefinitions={setDefinitions} center={center} locationLabel={locationLabel} />
        )}
      </main>
    </div>
  );
}
