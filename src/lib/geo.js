const EARTH_RADIUS_METERS = 6371008.8;
export const METERS_PER_MILE = 1609.344;

const radians = (degrees) => degrees * Math.PI / 180;
const degrees = (radiansValue) => radiansValue * 180 / Math.PI;

export function destinationPoint(origin, bearing, distanceMeters) {
  const angular = distanceMeters / EARTH_RADIUS_METERS;
  const theta = radians(bearing);
  const lat1 = radians(origin.lat);
  const lng1 = radians(origin.lng);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angular) + Math.cos(lat1) * Math.sin(angular) * Math.cos(theta)
  );
  const lng2 = lng1 + Math.atan2(
    Math.sin(theta) * Math.sin(angular) * Math.cos(lat1),
    Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2)
  );
  return { lat: degrees(lat2), lng: ((degrees(lng2) + 540) % 360) - 180 };
}

export function sectorPolygon(origin, startBearing, endBearing, radiusMeters, steps = 5) {
  const points = [[origin.lat, origin.lng]];
  const span = ((endBearing - startBearing) + 360) % 360 || 360;
  for (let index = 0; index <= steps; index += 1) {
    const bearing = startBearing + span * (index / steps);
    const point = destinationPoint(origin, bearing, radiusMeters);
    points.push([point.lat, point.lng]);
  }
  return points;
}

export function distanceLabel(meters, units = 'imperial') {
  if (units === 'metric') {
    return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
  }
  const feet = meters * 3.28084;
  if (feet < 300) return `${Math.round(feet)} ft`;
  if (meters < METERS_PER_MILE) return `${Math.round(feet / 3)} yd`;
  return `${(meters / METERS_PER_MILE).toFixed(meters < METERS_PER_MILE * 10 ? 1 : 0)} mi`;
}

export function googleRouteUrl(origin, destination, mode = 'walking') {
  const travelMode = mode === 'cycling' ? 'bicycling' : mode;
  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: travelMode,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function googleStreetViewUrl(destination, heading) {
  const params = new URLSearchParams({
    api: '1',
    map_action: 'pano',
    viewpoint: `${destination.lat},${destination.lng}`,
    heading: String(Math.round(heading)),
    pitch: '0',
    fov: '90',
  });
  return `https://www.google.com/maps/@?${params.toString()}`;
}
