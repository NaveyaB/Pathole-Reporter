import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Send,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { formatDistance, gmapsDistanceMeters } from "@/lib/google-maps";
import { locationApi } from "@/services";
import { CITY_CENTER, TAMIL_NADU_BOUNDS } from "@/constants";
import { cn } from "@/lib/utils";
import { Field } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/input";
import type { GeoPoint, ValidatedLocation } from "@/types";

interface GoogleLocationPickerProps {
  /** Submission-ready location the page currently holds (for the confirmed badge). */
  confirmedLocation?: ValidatedLocation | null;
  /** Fires with every fresh validation result. */
  onDraft: (loc: ValidatedLocation) => void;
  /** Fires when the user clicks "Confirm this location". */
  onConfirm: (loc: ValidatedLocation) => void;
  /** Fires with the browser GPS position when "Use my location" is used. */
  onReporterLocation?: (loc: GeoPoint) => void;
  /** Fires when the user clears/changes the confirmed location. */
  onConfirmReset?: () => void;
  /** Restore a previously picked location (returning to the step). */
  initial?: ValidatedLocation | null;
  /** Citizen-typed exact address of the pothole (controlled by the page). */
  exactAddress?: string;
  /** Fires whenever the citizen edits the exact pothole address. */
  onExactAddressChange?: (value: string) => void;
  /** Inline validation error for the exact pothole address. */
  exactAddressError?: string | null;
  height?: number;
  className?: string;
}

type Tone = "idle" | "ok" | "err" | "warn";

interface Status {
  tone: Tone;
  text: string;
}

const PICKER_ZOOM = 17;

export const GoogleLocationPicker = ({
  confirmedLocation,
  onDraft,
  onConfirm,
  onReporterLocation,
  onConfirmReset,
  initial,
  exactAddress = "",
  onExactAddressChange,
  exactAddressError,
  height = 380,
  className,
}: GoogleLocationPickerProps) => {
  const { maps, status: mapsStatus, error: mapsError } = useGoogleMaps();

  const mapRef = useRef<HTMLDivElement>(null);
  const searchAnchorRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef(0);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [draft, setDraft] = useState<ValidatedLocation | null>(null);
  const [validating, setValidating] = useState(false);
  const [locating, setLocating] = useState(false);
  const [reporterLocation, setReporterLocation] = useState<GeoPoint | null>(null);
  const [status, setStatus] = useState<Status>({ tone: "idle", text: "" });

  const isConfirmed =
    confirmedLocation != null &&
    draft != null &&
    confirmedLocation.lat === draft.lat &&
    confirmedLocation.lng === draft.lng;

  const placeMarker = (lat: number, lng: number) => {
    marker?.setPosition({ lat, lng });
    const gmap = map as google.maps.Map | null;
    if (!gmap) return;
    gmap.panTo({ lat, lng });
    const currentZoom = gmap.getZoom();
    if (typeof currentZoom === "number" && currentZoom < 15) gmap.setZoom(PICKER_ZOOM);
  };

  const runValidation = (lat: number, lng: number, placeId?: string) => {
    const id = ++seqRef.current;
    setValidating(true);
    setStatus({ tone: "idle", text: "Validating the selected location…" });
    placeMarker(lat, lng);

    locationApi
      .validate({ lat, lng, placeId })
      .then((res) => {
        if (id !== seqRef.current) return;
        setDraft(res);
        onDraft(res);
        setValidating(false);
        if (res.valid) {
          setStatus({
            tone: "ok",
            text: res.district ? `Verified in Tamil Nadu · ${res.district} district` : "Verified in Tamil Nadu",
          });
        } else {
          setStatus({ tone: "err", text: res.reason ?? "The selected location is not valid." });
        }
      })
      .catch((err: unknown) => {
        if (id !== seqRef.current) return;
        setValidating(false);
        setStatus({ tone: "err", text: err instanceof Error ? err.message : "Could not validate this location." });
      });
  };

  /* ---- Create map, marker and autocomplete once the API is loaded ---- */
  useEffect(() => {
    if (!maps || !mapRef.current || map) return;

    const start: { lat: number; lng: number } = initial
      ? { lat: initial.lat, lng: initial.lng }
      : CITY_CENTER;
    const zoom = initial ? PICKER_ZOOM : 7;

    const gmap = new maps.Map(mapRef.current, {
      center: start,
      zoom,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: true,
      gestureHandling: "greedy",
    });

    const gm = new maps.Marker({
      map: gmap,
      draggable: true,
      animation: maps.Animation.DROP,
    });

    gmap.addListener("click", (e: google.maps.MapMouseEvent) => {
      const ll = e.latLng;
      if (!ll) return;
      runValidation(ll.lat(), ll.lng());
    });

    gm.addListener("dragend", (e: google.maps.MapMouseEvent) => {
      const ll = e.latLng;
      if (!ll) return;
      runValidation(ll.lat(), ll.lng());
    });

    if (initial) {
      gm.setPosition({ lat: initial.lat, lng: initial.lng });
      setDraft(initial);
    }

    /* ---- Places API (New) autocomplete widget ------------------------ */
    let disposed = false;
    let autocompleteEl: google.maps.places.PlaceAutocompleteElement | null = null;

    const onPlaceSelected = (event: google.maps.places.PlacePredictionSelectEvent) => {
      const place = event.placePrediction.toPlace();
      place
        .fetchFields({ fields: ["displayName", "formattedAddress", "location", "id"] })
        .then(() => {
          const loc = place.location;
          if (!loc) {
            setStatus({ tone: "warn", text: "Could not resolve that place. Please pick a more specific address." });
            return;
          }
          const lat = loc.lat();
          const lng = loc.lng();
          gm.setPosition({ lat, lng });
          gmap.panTo({ lat, lng });
          runValidation(lat, lng, place.id);
        })
        .catch(() => {
          setStatus({ tone: "err", text: "Could not load this place. Try typing a more specific address." });
        });
    };

    const onPlaceError = () => {
      setStatus({
        tone: "warn",
        text: "Place search is unavailable right now — check that the Places API (New) is enabled for this API key, or tap the map to pin a spot.",
      });
    };

    google.maps
      .importLibrary("places")
      .then(({ PlaceAutocompleteElement }) => {
        if (disposed || !searchAnchorRef.current) return;
        autocompleteEl = new PlaceAutocompleteElement({
          value: initial?.formattedAddress ?? "",
          placeholder: "Search any town, road or landmark in Tamil Nadu…",
          includedRegionCodes: ["IN"],
          locationBias: new maps.LatLngBounds(
            new maps.LatLng(TAMIL_NADU_BOUNDS.south, TAMIL_NADU_BOUNDS.west),
            new maps.LatLng(TAMIL_NADU_BOUNDS.north, TAMIL_NADU_BOUNDS.east)
          ),
        });
        autocompleteEl.style.width = "100%";
        autocompleteEl.style.display = "block";
        autocompleteEl.addEventListener("gmp-select", onPlaceSelected);
        autocompleteEl.addEventListener("gmp-error", onPlaceError);
        searchAnchorRef.current.appendChild(autocompleteEl);
      })
      .catch(() => {
        if (!disposed) {
          setStatus({
            tone: "warn",
            text: "Place search could not be loaded. You can still pin a location by tapping the map or dragging the marker.",
          });
        }
      });

    setMap(gmap);
    setMarker(gm);

    return () => {
      disposed = true;
      gm.setMap(null);
      if (autocompleteEl) {
        autocompleteEl.removeEventListener("gmp-select", onPlaceSelected);
        autocompleteEl.removeEventListener("gmp-error", onPlaceError);
        autocompleteEl.remove();
      }
    };
  }, [maps]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Browser GPS ---------------------------------------------------- */
  const useMyLocation = () => {
    if (!maps) return;
    if (!navigator.geolocation) {
      setStatus({ tone: "err", text: "Geolocation is not supported by this browser." });
      return;
    }
    setLocating(true);
    setStatus({ tone: "idle", text: "Requesting your current GPS position…" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setReporterLocation(loc);
        onReporterLocation?.(loc);
        setLocating(false);
        runValidation(loc.lat, loc.lng);
      },
      (err) => {
        setLocating(false);
        setStatus({
          tone: "err",
          text:
            err.code === err.PERMISSION_DENIED
              ? "Location permission was denied. You can still search and pin a location anywhere in Tamil Nadu."
              : "Could not determine your current location. You can still pick a location manually.",
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  };

  /* ---- Distance between reporter and pothole --------------------------- */
  const distance = useMemo(() => {
    if (!reporterLocation || !draft) return null;
    return gmapsDistanceMeters(reporterLocation, { lat: draft.lat, lng: draft.lng });
  }, [reporterLocation, draft]);

  const handleConfirm = () => {
    if (!draft?.valid || validating) return;
    const confirmed = { ...draft, confirmed: true };
    setStatus({ tone: "ok", text: "Location confirmed — you can continue." });
    onConfirm(confirmed);
  };

  const resetFromConfirmed = () => {
    setDraft(null);
    setStatus({ tone: "idle", text: "Tap the map, drag the marker, or search for a new spot." });
    onConfirmReset?.();
  };

  const mapRendered = mapsStatus === "ready";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <div
          ref={searchAnchorRef}
          className={cn(
            "w-full",
            !mapRendered && "flex h-10 items-center rounded-lg border border-input bg-white px-3 text-sm text-muted-foreground/70 shadow-sm"
          )}
        >
          {!mapRendered && "Loading search…"}
        </div>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={!mapRendered || locating}
          className="absolute right-2 top-1/2 flex h-7 -translate-y-1/2 items-center gap-1.5 rounded-md border border-input bg-white px-2.5 text-xs font-medium text-primary shadow-sm transition-colors hover:bg-muted disabled:opacity-50"
        >
          <LocateFixed className={cn("h-3.5 w-3.5", locating && "animate-pulse")} />
          {locating ? "Locating…" : "My location"}
        </button>
      </div>

      {mapsStatus === "loading" && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-muted/20" style={{ height }}>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading Google Maps…</p>
        </div>
      )}

      {mapsStatus === "error" && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-6" style={{ height }}>
          <ShieldAlert className="h-7 w-7 text-rose-500" />
          <div className="text-center text-sm text-rose-700">
            <p className="font-semibold">Google Maps failed to load</p>
            <p className="mt-1 opacity-90">{mapsError}</p>
          </div>
        </div>
      )}

      {mapRendered && (
        <div className="relative overflow-hidden rounded-xl border border-border" style={{ height }}>
          <div ref={mapRef} className="h-full w-full" />

          <div className="absolute bottom-3 left-3 z-[1000] flex flex-col gap-2">
            {distance != null && reporterLocation && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-white/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur">
                <Navigation className="h-3.5 w-3.5 text-primary" />
                {formatDistance(distance)} from your location
              </div>
            )}
            {draft && (
              <div className="max-w-xs rounded-lg border border-border bg-white/95 px-3 py-2 text-xs text-foreground shadow-sm backdrop-blur">
                <span className="font-mono">
                  {draft.lat.toFixed(6)}, {draft.lng.toFixed(6)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exact pothole address */}
      <Field
        label="Exact pothole address"
        required
        error={exactAddressError ?? undefined}
        hint="Type the complete road address — door number, colony/street, road name and landmark. The map marker above is saved separately as GPS coordinates."
        className="pt-1"
      >
        <Textarea
          value={exactAddress}
          onChange={(e) => onExactAddressChange?.(e.target.value)}
          rows={3}
          maxLength={200}
          disabled={!mapRendered}
          placeholder="e.g. 2, Gandhi Nagar, Main Road, near MK School, Dindigul, Tamil Nadu"
          aria-invalid={Boolean(exactAddressError)}
        />
        <p className="text-right text-[11px] tabular-nums text-muted-foreground">{exactAddress.length}/200</p>
      </Field>

      {/* Status + address panel */}
      <div
        className={cn(
          "rounded-lg border p-3.5 text-sm",
          status.tone === "ok" && "border-emerald-200 bg-emerald-50 text-emerald-800",
          status.tone === "err" && "border-rose-200 bg-rose-50 text-rose-800",
          status.tone === "warn" && "border-amber-200 bg-amber-50 text-amber-800",
          status.tone === "idle" && "border-border bg-muted/30 text-muted-foreground"
        )}
      >
        <div className="flex items-start gap-2.5">
          {status.tone === "ok" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
          {status.tone === "err" && <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          {status.tone === "warn" && <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />}
          {(status.tone === "idle" || (validating && !status.text)) && (
            <Loader2 className={cn("mt-0.5 h-4 w-4 shrink-0", validating && "animate-spin")} />
          )}
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-medium">
              {validating ? "Validating location…" : status.text || "Search, tap the map, or drag the marker to pick a spot."}
            </p>
            {draft?.formattedAddress && (
              <p className="flex items-start gap-1.5 text-xs opacity-90">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-2">{draft.formattedAddress}</span>
              </p>
            )}
            {draft?.district && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-foreground ring-1 ring-black/5">
                  {draft.district} district
                </span>
                {draft.locality && (
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-foreground ring-1 ring-black/5">
                    {draft.locality}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {isConfirmed
            ? "Location confirmed for this report."
            : "Remote reporting is allowed anywhere in Tamil Nadu."}
        </p>
        <div className="flex items-center gap-2">
          {isConfirmed && (
            <button
              type="button"
              onClick={resetFromConfirmed}
            className="text-xs font-medium text-primary hover:underline"
          >
            Change location
          </button>
          )}
          <button
            type="button"
            disabled={validating || !draft?.valid || isConfirmed}
            onClick={handleConfirm}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium text-white shadow-sm transition-colors",
              !validating && draft?.valid && !isConfirmed
                ? "bg-primary hover:bg-primary/90"
                : "cursor-not-allowed bg-primary/40"
            )}
          >
            <Send className="h-4 w-4" />
            Confirm location
          </button>
        </div>
      </div>
    </div>
  );
};