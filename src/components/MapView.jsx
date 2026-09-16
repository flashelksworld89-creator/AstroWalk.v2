import { Fragment, useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polygon, Polyline, Tooltip, Popup, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import { NAKSHATRAS, SIGNS, SIGN_GLYPHS, normalize, formatDegree, cardinalDirection } from '../lib/astro';
import { destinationPoint, METERS_PER_MILE } from '../lib/geo';

import { point, arc, band } from '../lib/wheelGeometry';

function Label({ position, children, kind = '', permanent = true }) {
  return <CircleMarker center={position} radius={5} pathOptions={{ opacity: 0, fillOpacity: 0 }} interactive={!permanent}>
    <Tooltip permanent={permanent} direction="center" className={`wheel-label ${kind}`}>{children}</Tooltip>
  </CircleMarker>;
}

function Wheel({ center, rangeMiles, placements, ascendant, selectedId, onSelectPlanet, layers, locationLabel, corridorMiles, fullScreen, compact }) {
  const map = useMap();
  const [, redraw] = useState(0);
  useMapEvents({ zoomend: () => redraw(v => v + 1), moveend: () => redraw(v => v + 1), resize: () => redraw(v => v + 1) });
  const radius = rangeMiles * METERS_PER_MILE;
  const size = map.getSize();
  const originPixel = map.latLngToContainerPoint([center.lat, center.lng]);
  const edgePixel = map.latLngToContainerPoint(point(center, 90, radius));
  const pixelRadius = originPixel.distanceTo(edgePixel);
  // Geometry always stays in meters. Only label density changes with screen space.
  const fullNames = pixelRadius > 480;
  const selected = placements.find(p => p.id === selectedId) || placements[0];
  const longitudeBearing = lon => normalize(lon - ascendant + 90);
  useEffect(() => {
    map.invalidateSize();
    const narrow = map.getSize().x < 721;
    const bounds = [point(center, 0, radius), point(center, 90, radius), point(center, 180, radius), point(center, 270, radius)];
    map.fitBounds(bounds, { paddingTopLeft: compact ? [24,65] : [narrow ? 18 : 60, fullScreen ? 155 : 115], paddingBottomRight: compact ? [24,40] : [fullScreen ? 30 : narrow ? 18 : 390, fullScreen ? 140 : narrow ? 265 : 100], maxZoom: 21, animate: false });
  }, [center.lat, center.lng, radius, map, fullScreen, compact]);
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  const labelBoxes = [];
  const visiblePlanets = [...placements].sort((a, b) => Number(b.id === selectedId) - Number(a.id === selectedId));
  function markerPosition(planet) {
    if (planet.id === selectedId && pixelRadius > 1) {
      const usable = Math.min(originPixel.x - 55, size.x - originPixel.x - 55, originPixel.y - (compact ? 60 : 110), size.y - originPixel.y - (compact ? 45 : fullScreen ? 140 : 260));
      if (usable > 35) {
        const pos = point(center, planet.bearing, radius * Math.min(.66, usable / pixelRadius));
        labelBoxes.push(map.latLngToContainerPoint(pos));
        return pos;
      }
    }
    // Stagger close bearings radially without altering the direction itself.
    for (const fraction of [0.66, 0.48, 0.32, 0.80]) {
      const pos = point(center, planet.bearing, radius * fraction);
      const px = map.latLngToContainerPoint(pos);
      if (px.x < 30 || px.x > size.x - 30 || px.y < 65 || px.y > size.y - 80) continue;
      const compact = pixelRadius < 240;
      if (labelBoxes.some(p => Math.abs(p.x - px.x) < (compact ? 65 : 115) && Math.abs(p.y - px.y) < 54)) continue;
      labelBoxes.push(px);
      return pos;
    }
    return null;
  }
  const selectedPoint = selected && point(center, selected.bearing, radius);
  const half = corridorMiles * METERS_PER_MILE / 2;
  const end = selected && destinationPoint(center, selected.bearing, radius);
  const corridor = selected && [point(center, selected.bearing - 90, half), point(end, selected.bearing - 90, half), point(end, selected.bearing + 90, half), point(center, selected.bearing + 90, half)];

  return <>
    {[0.25, 0.5, 0.75, 1].map(f => <Polyline key={f} positions={arc(center, 0, 360, radius * f)} interactive={false} pathOptions={{ color: '#334155', weight: 1, opacity: .4, dashArray: '2 7' }} />)}
    {layers.houses && Array.from({ length: 12 }, (_, i) => {
      const house = i + 1, bearing = normalize((house - 10) * 30);
      const angular = [1, 4, 7, 10].includes(house);
      const anchor = ({ 1: 'E · ASC', 4: 'S · IC', 7: 'W · DSC', 10: 'N · H10' })[house];
      return <Fragment key={house}>
        <Polyline positions={[[center.lat, center.lng], point(center, bearing, radius * .82)]} interactive={false} pathOptions={{ color: '#243b53', weight: angular ? 2.4 : 1.2, opacity: angular ? .85 : .55, dashArray: angular ? undefined : '8 6' }} />
        {pixelRadius > 240 && <Label position={point(center, bearing + 15, radius * .76)} kind="house">H{house}</Label>}
        {anchor && <Label position={point(center, bearing, radius * .80)} kind="axis">{anchor}</Label>}
      </Fragment>;
    })}
    {layers.nakshatras && NAKSHATRAS.map((name, i) => {
      const start = longitudeBearing(i * 360 / 27), span = 360 / 27;
      const active = selected?.nakshatraIndex === i;
      return <Fragment key={name}>
        <Polygon positions={band(center, start, span, radius * .84, radius * .94)} interactive={false} pathOptions={{ color: '#0e7490', weight: active ? 2 : 1, fillColor: active ? '#22d3ee' : '#cffafe', fillOpacity: active ? .40 : .23 }} />
        <Label key={pixelRadius > 120 ? 'visible' : 'hover'} position={point(center, start + span / 2, radius * .89)} kind="nak" permanent={pixelRadius > 120}>
          {fullNames ? `${i + 1} ${name}` : `${i + 1}`}
        </Label>
      </Fragment>;
    })}
    {layers.zodiac && SIGNS.map((name, i) => {
      const start = longitudeBearing(i * 30);
      return <Fragment key={name}>
        <Polygon positions={band(center, start, 30, radius * .95, radius)} interactive={false} pathOptions={{ color: '#704d08', weight: 1.2, fillColor: '#fef3c7', fillOpacity: .60 }} />
        <Label position={point(center, start + 15, radius * .975)} kind="sign">{SIGN_GLYPHS[i]}{pixelRadius > 380 ? ` ${name}` : ''}</Label>
      </Fragment>;
    })}
    {layers.zodiac && pixelRadius > 260 && Array.from({ length: 72 }, (_, i) => {
      const bearing = longitudeBearing(i * 5);
      return <Polyline key={i} positions={[point(center, bearing, radius * .95), point(center, bearing, radius * (i % 6 === 0 ? .975 : .962))]} interactive={false} pathOptions={{ color: '#704d08', weight: 1 }} />;
    })}
    {corridor && <Polygon positions={corridor} interactive={false} pathOptions={{ color: '#b45309', weight: 1, fillColor: '#fbbf24', fillOpacity: .12, dashArray: '4 6' }} />}
    {selectedPoint && <>
      <Polyline positions={[[center.lat, center.lng], selectedPoint]} interactive={false} pathOptions={{ color: '#422006', weight: 7, opacity: .8 }} />
      <Polyline positions={[[center.lat, center.lng], selectedPoint]} interactive={false} pathOptions={{ color: '#fbbf24', weight: 4, opacity: 1 }} />
    </>}
    {visiblePlanets.map(planet => {
      const pos = markerPosition(planet);
      if (!pos) return null;
      return <CircleMarker key={planet.id} center={pos} radius={22} pathOptions={{ opacity: 0, fillOpacity: 0 }} eventHandlers={{ click: () => onSelectPlanet(planet.id) }}>
        <Tooltip permanent interactive direction="center" className="wheel-planet">
          <button type="button" className={planet.id === selectedId ? 'active' : pixelRadius < 240 ? 'compact-planet' : ''} onClick={() => onSelectPlanet(planet.id)} aria-label={`Select ${planet.name}`}>
            <span>{planet.glyph}{(pixelRadius >= 240 || planet.id === selectedId) && ` ${planet.name}`}</span>{(pixelRadius >= 240 || planet.id === selectedId) && <small>{planet.signGlyph} {formatDegree(planet.degree)} · H{planet.house}</small>}
          </button>
        </Tooltip>
      </CircleMarker>;
    })}
    <CircleMarker center={[center.lat, center.lng]} radius={7} pathOptions={{ color: '#fff', weight: 3, fillColor: '#1d4ed8', fillOpacity: 1 }}><Popup>{locationLabel}</Popup></CircleMarker>
  </>;
}

export default function MapView(props) {
  const [tileError, setTileError] = useState(false);
  const selected = props.placements.find(p => p.id === props.selectedId) || props.placements[0];
  return <div className="map-frame" aria-label="Sidereal planetary map">
    <MapContainer center={[props.center.lat, props.center.lng]} zoom={11} maxZoom={21} zoomControl={false} className="leaflet-map">
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxNativeZoom={19} maxZoom={21} keepBuffer={1}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        eventHandlers={{ tileerror: () => setTileError(true) }} />
      <Wheel {...props} />
      {(props.fullScreen || props.compact) && <ZoomControl position="bottomleft" />}
    </MapContainer>
    <details className="wheel-key"><summary>Wheel key · houses / nakshatras / zodiac</summary><p>Solid/dashed spokes: houses. Blue numbered ring: nakshatras. Gold outer ring: zodiac. Gold ray: selected planet’s mapped direction.</p><ol>{NAKSHATRAS.map(name => <li key={name}>{name}</li>)}</ol></details>
    {selected && <div className="bearing-chip"><span>{selected.glyph}</span><strong>{Math.round(selected.bearing)}° {cardinalDirection(selected.bearing)} · {selected.nakshatraIndex + 1} {selected.nakshatra}</strong></div>}
    {tileError && <div className="tile-warning" role="status">Some street tiles could not load. Check your connection and reload.</div>}
  </div>;
}
