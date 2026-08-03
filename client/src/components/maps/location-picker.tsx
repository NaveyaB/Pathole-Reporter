import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, Crosshair } from "lucide-react";
import type { GeoPoint } from "@/types";
import { CITY_CENTER } from "@/constants";
import { cn } from "@/lib/utils";

const markerIcon = L.divIcon({
  className: "spr-pick-icon",
  html: `<div class="spr-pick-pin"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 27],
});

interface ClickCatcherProps {
  onChange: (pos: GeoPoint) => void;
}

const ClickCatcher = ({ onChange }: ClickCatcherProps) => {
  useMapEvents({
    click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
};

interface LocationPickerProps {
  value?: GeoPoint;
  onChange: (pos: GeoPoint) => void;
  height?: number;
  className?: string;
}

export const LocationPicker = ({ value, onChange, height = 320, className }: LocationPickerProps) => {
  const [position, setPosition] = useState<GeoPoint | null>(value ?? null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (value) setPosition(value);
  }, [value]);

  const handleChange = (pos: GeoPoint) => {
    setPosition(pos);
    onChange(pos);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border", className)}>
      <MapContainer
        center={position ? [position.lat, position.lng] : [CITY_CENTER.lat, CITY_CENTER.lng]}
        zoom={position ? 16 : 12}
        style={{ height, width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap &copy; CARTO" />
        <ClickCatcher onChange={handleChange} />
        {position && <Marker position={[position.lat, position.lng]} icon={markerIcon} />}
      </MapContainer>

      <button
        type="button"
        onClick={useMyLocation}
        disabled={locating}
        className="absolute right-3 top-3 z-[1000] flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-medium shadow-sm transition-all hover:shadow-md disabled:opacity-60"
      >
        <LocateFixed className={cn("h-4 w-4 text-primary", locating && "animate-pulse")} />
        {locating ? "Locating…" : "My location"}
      </button>

      {position ? (
        <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-2 rounded-lg border border-border bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
          <Crosshair className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs font-medium text-foreground">
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </span>
        </div>
      ) : (
        <div className="absolute bottom-3 left-3 z-[1000] rounded-lg border border-border bg-white/95 px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
          Tap the map to drop a pin
        </div>
      )}
    </div>
  );
};
