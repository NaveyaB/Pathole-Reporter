/**
 * Tiny Google Maps JavaScript API loader.
 *
 * The key is never hard-coded — it must come from `VITE_GOOGLE_MAPS_API_KEY`
 * (see client/.env.example). The key should be a browser/JS key restricted to
 * the app's origins and restricted to the Maps JavaScript + Places API (New).
 *
 * Only the Maps JavaScript API base (map, marker) is loaded here. The modern
 * Places API (New) is fetched on demand via `google.maps.importLibrary("places")`
 * (see google-location-picker.tsx), so no legacy `libraries=` are requested.
 */

let loadPromise: Promise<typeof google> | null = null;

export const loadGoogleMaps = (): Promise<typeof google> => {
  if (typeof window === "undefined" || !window.document) {
    return Promise.reject(new Error("Google Maps can only be loaded in the browser"));
  }
  if (window.google?.maps) return Promise.resolve(window.google);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<typeof google>((resolve, reject) => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) {
      loadPromise = null;
      reject(new Error("Google Maps key is missing. Set VITE_GOOGLE_MAPS_API_KEY in client/.env.local"));
      return;
    }

    const callbackName = `__spr_gmaps_${Math.random().toString(36).slice(2, 10)}`;
    (window as unknown as Record<string, unknown>)[callbackName] = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      resolve(window.google);
    };

    const existing = window.document.getElementById("spr-google-maps");
    if (existing) existing.remove();

    const script = window.document.createElement("script");
    script.id = "spr-google-maps";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      key
    )}&callback=${callbackName}&loading=async`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      loadPromise = null;
      reject(new Error("Failed to load the Google Maps JavaScript API. Check the network and API key."));
    };
    window.document.head.appendChild(script);
  });

  return loadPromise;
};

/** Great-circle distance (Haversine) in metres. */
export const gmapsDistanceMeters = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export const formatDistance = (metres: number): string => {
  if (metres < 1000) return `${Math.max(1, Math.round(metres))} m`;
  return `${(metres / 1000).toFixed(1)} km`;
};