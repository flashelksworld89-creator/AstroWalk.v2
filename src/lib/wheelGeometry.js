import { destinationPoint } from './geo.js';

export function point(origin, bearing, radius) {
  const p = destinationPoint(origin, bearing, radius);
  return [p.lat, p.lng];
}

export function arc(origin, start, span, radius) {
  const segments = Math.max(1, Math.ceil(Math.abs(span) / 2));
  return Array.from({ length: segments + 1 }, (_, index) =>
    point(origin, start + span * index / segments, radius));
}

export function band(origin, start, span, inner, outer) {
  return [...arc(origin, start, span, outer), ...arc(origin, start, span, inner).reverse()];
}
