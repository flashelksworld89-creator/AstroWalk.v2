import * as Astronomy from 'astronomy-engine';

export const PLANETS = [
  { id: 'sun', name: 'Sun', glyph: '☉', body: Astronomy.Body.Sun },
  { id: 'moon', name: 'Moon', glyph: '☽', body: Astronomy.Body.Moon },
  { id: 'mercury', name: 'Mercury', glyph: '☿', body: Astronomy.Body.Mercury },
  { id: 'venus', name: 'Venus', glyph: '♀', body: Astronomy.Body.Venus },
  { id: 'mars', name: 'Mars', glyph: '♂', body: Astronomy.Body.Mars },
  { id: 'jupiter', name: 'Jupiter', glyph: '♃', body: Astronomy.Body.Jupiter },
  { id: 'saturn', name: 'Saturn', glyph: '♄', body: Astronomy.Body.Saturn },
  { id: 'uranus', name: 'Uranus', glyph: '♅', body: Astronomy.Body.Uranus },
  { id: 'neptune', name: 'Neptune', glyph: '♆', body: Astronomy.Body.Neptune },
  { id: 'pluto', name: 'Pluto', glyph: '♇', body: Astronomy.Body.Pluto },
  { id: 'rahu', name: 'Rahu', glyph: '☊', body: null },
  { id: 'ketu', name: 'Ketu', glyph: '☋', body: null },
];

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export const SIGN_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

export const DEFAULT_DEFINITIONS = {
  sun: 'Visibility, vitality, purpose, and places where identity can be expressed.',
  moon: 'Feeling, memory, belonging, and places that invite reflection or care.',
  mercury: 'Communication, learning, movement, trade, and exchange of ideas.',
  venus: 'Beauty, affection, harmony, art, pleasure, and meaningful connection.',
  mars: 'Action, courage, competition, effort, and places that demand initiative.',
  jupiter: 'Growth, opportunity, wisdom, generosity, and expanded perspective.',
  saturn: 'Discipline, structure, responsibility, endurance, and long-term work.',
  uranus: 'Innovation, surprise, freedom, disruption, and unfamiliar possibilities.',
  neptune: 'Imagination, spirituality, compassion, dreams, and dissolving boundaries.',
  pluto: 'Depth, power, release, regeneration, and profound transformation.',
  rahu: 'Amplification, appetite, experimentation, and movement toward the unfamiliar.',
  ketu: 'Release, insight, simplicity, spiritual memory, and movement away from attachment.',
};

export const normalize = (degrees) => ((degrees % 360) + 360) % 360;

function signedAngularDifference(a, b) {
  return ((a - b + 540) % 360) - 180;
}

function julianDate(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function decimalYear(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const end = Date.UTC(date.getUTCFullYear() + 1, 0, 1);
  return date.getUTCFullYear() + (date.getTime() - start) / (end - start);
}

export function lahiriAyanamsa(date) {
  return 23.85675 + (decimalYear(date) - 2000) * (50.290966 / 3600);
}

function tropicalLongitude(body, date) {
  const vector = Astronomy.GeoVector(body, date, true);
  const rotation = Astronomy.Rotation_EQJ_ECT(date);
  return Astronomy.SphereFromVector(Astronomy.RotateVector(rotation, vector)).lon;
}

function meanNodeLongitude(date) {
  const T = (julianDate(date) - 2451545.0) / 36525;
  return normalize(125.04455501 - 1934.13626197 * T + 0.0020762 * T * T + (T * T * T) / 467410 - (T ** 4) / 60616000);
}

export function siderealAscendant(date, lat, lng) {
  const jd = julianDate(date);
  const T = (jd - 2451545.0) / 36525;
  const gmst = normalize(
    280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T ** 3) / 38710000
  );
  const theta = normalize(gmst + lng) * Math.PI / 180;
  const epsilon = (23.439291111 - 0.013004167 * T) * Math.PI / 180;
  const phi = Math.max(-89.5, Math.min(89.5, lat)) * Math.PI / 180;
  const y = -Math.cos(theta);
  const x = Math.sin(epsilon) * Math.tan(phi) + Math.cos(epsilon) * Math.sin(theta);
  return normalize(Math.atan2(y, x) * 180 / Math.PI - lahiriAyanamsa(date));
}

export function placementFromLongitude(id, siderealLongitude, ascendant, retrograde = false) {
  const lon = normalize(siderealLongitude);
  const signIndex = Math.floor(lon / 30);
  const degree = lon % 30;
  const nakSize = 360 / 27;
  const padaSize = nakSize / 4;
  const nakIndex = Math.floor(lon / nakSize) % 27;
  const pada = Math.floor((lon % nakSize) / padaSize) + 1;
  const relative = normalize(lon - ascendant);
  const house = Math.floor(relative / 30) + 1;
  const houseOffset = relative % 30;
  const bearing = normalize((house - 10) * 30 + houseOffset);
  const planet = PLANETS.find((item) => item.id === id);
  return {
    ...planet,
    siderealLongitude: lon,
    sign: SIGNS[signIndex],
    signGlyph: SIGN_GLYPHS[signIndex],
    degree,
    house,
    houseOffset,
    nakshatra: NAKSHATRAS[nakIndex],
    nakshatraIndex: nakIndex,
    pada,
    bearing,
    retrograde,
    manual: false,
  };
}

export function computeLivePlacements(date, lat, lng) {
  const ascendant = siderealAscendant(date, lat, lng);
  const ayanamsa = lahiriAyanamsa(date);
  const regular = PLANETS.filter((planet) => planet.body).map((planet) => {
    const tropical = tropicalLongitude(planet.body, date);
    const before = tropicalLongitude(planet.body, new Date(date.getTime() - 6 * 3600000));
    const after = tropicalLongitude(planet.body, new Date(date.getTime() + 6 * 3600000));
    const retrograde = signedAngularDifference(after, before) < 0;
    return placementFromLongitude(planet.id, tropical - ayanamsa, ascendant, retrograde);
  });
  const rahuLon = normalize(meanNodeLongitude(date) - ayanamsa);
  return [
    ...regular,
    placementFromLongitude('rahu', rahuLon, ascendant, true),
    placementFromLongitude('ketu', rahuLon + 180, ascendant, true),
  ];
}

export function makeManualPlacement(input) {
  const planet = PLANETS.find((item) => item.id === input.id);
  const signIndex = Math.max(0, SIGNS.indexOf(input.sign));
  const degree = Math.max(0, Math.min(29.9999, Number(input.degree) || 0));
  const longitude = signIndex * 30 + degree;
  const nakSize = 360 / 27;
  const computedNakIndex = Math.floor(longitude / nakSize) % 27;
  const house = Math.max(1, Math.min(12, Number(input.house) || 1));
  const houseOffset = degree;
  return {
    ...planet,
    siderealLongitude: longitude,
    sign: SIGNS[signIndex],
    signGlyph: SIGN_GLYPHS[signIndex],
    degree,
    house,
    houseOffset,
    nakshatra: input.nakshatra || NAKSHATRAS[computedNakIndex],
    nakshatraIndex: Math.max(0, NAKSHATRAS.indexOf(input.nakshatra || NAKSHATRAS[computedNakIndex])),
    pada: Math.max(1, Math.min(4, Number(input.pada) || Math.floor((longitude % nakSize) / (nakSize / 4)) + 1)),
    bearing: Number.isFinite(Number(input.bearing)) ? normalize(Number(input.bearing)) : normalize((house - 10) * 30 + houseOffset),
    retrograde: Boolean(input.retrograde),
    manual: true,
  };
}

export function toManualInputs(placements) {
  return placements.map((placement) => ({
    id: placement.id,
    sign: placement.sign,
    degree: Number(placement.degree.toFixed(2)),
    house: placement.house,
    nakshatra: placement.nakshatra,
    pada: placement.pada,
    bearing: Number(placement.bearing.toFixed(1)),
    retrograde: placement.retrograde,
  }));
}

export function formatDegree(value) {
  const safe = normalize(value);
  const whole = Math.floor(safe);
  const minutes = Math.floor((safe - whole) * 60);
  return `${whole}°${String(minutes).padStart(2, '0')}′`;
}

export function formatSignDegree(placement) {
  return `${placement.signGlyph} ${placement.sign} ${formatDegree(placement.degree)}`;
}

export function cardinalDirection(bearing) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(normalize(bearing) / 22.5) % 16];
}
