import { config } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { haversineMeters, pointInPolygon } from "../utils/geo.js";
import { getComplaintsStore } from "../data/store.js";
import type { GeoPoint } from "../types/index.js";

/**
 * Location validation service.
 *
 * Coordinates are ALWAYS re-validated on the server. The frontend suggestions
 * (Places Autocomplete) are only a UX aid — the backend never trusts the raw
 * browser payload.
 */

/** Outward-expanded bounding box for fast pre-filtering (lat/lng). */
const TAMIL_NADU_BBOX = {
  minLat: 7.9,
  maxLat: 13.8,
  minLng: 76.0,
  maxLng: 80.45,
};

/**
 * Coarse Tamil Nadu outline as [lng, lat] pairs (polygon vertices). This is a
 * sanity gate only; when Google Geocoding is configured the authoritative
 * boundary check is the geocode `administrative_area_level_1` match.
 */
export const TAMIL_NADU_POLYGON: Array<[number, number]> = [
  [77.55, 8.09],
  [77.4, 8.35],
  [77.33, 8.62],
  [77.26, 9.0],
  [77.18, 9.55],
  [77.15, 10.05],
  [77.3, 10.35],
  [77.0, 10.6],
  [76.75, 10.85],
  [76.45, 11.0],
  [76.3, 11.2],
  [76.42, 11.55],
  [76.55, 11.85],
  [76.8, 12.15],
  [77.1, 12.45],
  [77.55, 12.7],
  [77.9, 12.95],
  [78.3, 13.05],
  [78.75, 13.2],
  [79.2, 13.45],
  [79.65, 13.5],
  [80.05, 13.6],
  [80.32, 13.45],
  [80.32, 13.1],
  [80.22, 12.6],
  [80.05, 12.05],
  [79.9, 11.55],
  [79.83, 11.0],
  [79.86, 10.7],
  [79.85, 10.28],
  [79.75, 9.95],
  [79.35, 9.25],
  [78.9, 9.1],
  [78.4, 8.85],
  [78.1, 8.5],
  [77.9, 8.22],
  [77.55, 8.09],
];

const TN_STATE_ALIASES = new Set(["tamil nadu", "tamilnadu", "tn"]);
/** States/UTs adjacent to Tamil Nadu — used to reject unambiguous misses. */
const NON_TN_STATES = new Set([
  "kerala",
  "karnataka",
  "andhra pradesh",
  "telangana",
  "puducherry",
  "pondicherry",
  "lakshadweep",
]);

interface GeocodeAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodeResult {
  formatted_address: string;
  place_id?: string;
  address_components: GeocodeAddressComponent[];
  geometry?: { location?: { lat: number; lng: number } };
}

interface GeocodeResponse {
  status: string;
  results: GeocodeResult[];
  error_message?: string;
}

export interface GeocodedLocation {
  formattedAddress: string;
  placeId?: string;
  district?: string;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
}

const findComponent = (
  result: GeocodeResult,
  type: string
): GeocodeAddressComponent | undefined =>
  result.address_components.find((c) => c.types.includes(type));

export const isValidCoordinate = (lat: unknown, lng: unknown): lat is number => {
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
};

export const parseCoordinate = (
  value: unknown,
  field: string
): number => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw ApiError.badRequest(`${field} must be a valid number`);
  return n;
};

/** Reverse geocode coordinates with the server-side key. Returns null when unavailable. */
export const reverseGeocode = async (lat: number, lng: number): Promise<GeocodedLocation | null> => {
  if (!config.googleMapsApiKey) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${encodeURIComponent(config.googleMapsApiKey)}`;
  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const data = (await res.json()) as GeocodeResponse;
  if (data.status !== "OK" || data.results.length === 0) return null;

  const result = data.results[0];
  const admin1 = findComponent(result, "administrative_area_level_1");
  const admin2 = findComponent(result, "administrative_area_level_2");
  const locality = findComponent(result, "locality");
  const sublocality1 = findComponent(result, "sublocality_level_1");
  const sublocality2 = findComponent(result, "sublocality_level_2");
  const country = findComponent(result, "country");

  return {
    formattedAddress: result.formatted_address,
    placeId: result.place_id,
    district: admin2?.short_name || (admin1?.short_name === "TN" ? "Tamil Nadu" : undefined),
    locality: locality?.short_name || sublocality1?.short_name || sublocality2?.short_name,
    city: locality?.short_name || sublocality1?.short_name,
    state: admin1?.long_name,
    country: country?.short_name,
  };
};

export interface BoundaryCheck {
  inTamilNadu: boolean;
  method: "geocode" | "polygon" | "bbox" | "unresolved";
}

/**
 * Decide whether a coordinate is inside Tamil Nadu.
 * 1. Fast bounding-box pre-filter.
 * 2. When Google Geocoding is configured, the admin-area level-1 match is the
 *    authoritative check (also catches enclaves like Puducherry).
 * 3. Coarse local polygon is the offline fallback.
 */
export const checkTamilNaduBoundary = async (lat: number, lng: number): Promise<BoundaryCheck> => {
  if (lng < TAMIL_NADU_BBOX.minLng || lng > TAMIL_NADU_BBOX.maxLng || lat < TAMIL_NADU_BBOX.minLat || lat > TAMIL_NADU_BBOX.maxLat) {
    return { inTamilNadu: false, method: "bbox" };
  }

  const geo = await reverseGeocode(lat, lng);
  if (geo?.country === "IN" && geo.state) {
    const state = geo.state.toLowerCase();
    if (TN_STATE_ALIASES.has(state)) return { inTamilNadu: true, method: "geocode" };
    if (NON_TN_STATES.has(state)) return { inTamilNadu: false, method: "geocode" };
  }

  return pointInPolygon(lng, lat, TAMIL_NADU_POLYGON)
    ? { inTamilNadu: true, method: "polygon" }
    : { inTamilNadu: false, method: "polygon" };
};

export interface ValidatedLocation {
  valid: boolean;
  inTamilNadu: boolean;
  boundaryMethod: BoundaryCheck["method"];
  lat: number;
  lng: number;
  formattedAddress?: string;
  district?: string;
  locality?: string;
  city?: string;
  state?: string;
  placeId?: string;
  reason?: string;
}

/**
 * Full server-side location validation used by both the `/locations/validate`
 * endpoint and complaint creation.
 */
export const validateLocation = async (
  payload: { lat: number; lng: number; placeId?: string }
): Promise<ValidatedLocation> => {
  const { lat, lng, placeId } = payload;

  if (!isValidCoordinate(lat, lng)) {
    return {
      valid: false,
      inTamilNadu: false,
      boundaryMethod: "bbox",
      lat,
      lng,
      reason: "The selected coordinates are not valid.",
    };
  }

  const boundary = await checkTamilNaduBoundary(lat, lng);
  if (!boundary.inTamilNadu) {
    return {
      valid: false,
      inTamilNadu: false,
      boundaryMethod: boundary.method,
      lat,
      lng,
      reason:
        boundary.method === "bbox"
          ? "This location is outside the supported Tamil Nadu coverage area."
          : "This location is not within the Tamil Nadu boundary.",
    };
  }

  const geo = await reverseGeocode(lat, lng);

  return {
    valid: true,
    inTamilNadu: true,
    boundaryMethod: boundary.method,
    lat,
    lng,
    formattedAddress: geo?.formattedAddress,
    district: geo?.district,
    locality: geo?.locality,
    city: geo?.city,
    state: geo?.state,
    placeId: placeId || geo?.placeId,
  };
};

/** Distance in metres between two points. */
export const distanceMeters = haversineMeters;

export interface NearbyDuplicate {
  complaintId: string;
  reportNumber: string;
  title: string;
  distanceMeters: number;
}

/**
 * Look for an existing report within `thresholdMeters` of the given coordinate.
 * Uses MongoDB `$geoNear` (2dsphere index) when connected, otherwise a
 * Haversine scan of the in-memory store.
 *
 * Threshold rationale: a pothole is typically a few metres wide. Potholes that
 * are genuinely separate but close together (e.g. two craters 30-40 m apart on
 * the same stretch) are common, so 25 m is deliberately conservative — it only
 * flags near-certain duplicates and never blocks legitimate separate reports.
 */
export const findNearbyDuplicate = async (
  lat: number,
  lng: number,
  thresholdMeters = 25
): Promise<NearbyDuplicate | null> => {
  const results = await getComplaintsStore().geoNear({
    coordinates: [lng, lat],
    maxDistance: thresholdMeters,
    limit: 1,
  });

  const nearest = results[0];
  if (!nearest) return null;

  const doc = nearest.doc;
  return {
    complaintId: doc.id,
    reportNumber: doc.reportNumber,
    title: doc.title,
    distanceMeters: Math.round(nearest.distance),
  };
};

/** Report coordinates kept separate from the pothole location. */
export const validateReporterLocation = (value: unknown): GeoPoint | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const v = value as { lat?: unknown; lng?: unknown };
  if (typeof v.lat !== "number" || typeof v.lng !== "number") return undefined;
  const lat = v.lat;
  const lng = v.lng;
  if (!isValidCoordinate(lat, lng)) return undefined;
  return { lat, lng };
};