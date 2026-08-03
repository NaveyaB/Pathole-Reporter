import { useMemo, useState, useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import type { MapComplaint } from "@/types";
import { SEVERITY_META, STATUS_META, CITY_CENTER } from "@/constants";
import { cn, timeAgo, titleCase } from "@/lib/utils";

export interface MapPoint extends MapComplaint {}

interface Cluster {
  key: string;
  position: [number, number];
  points: MapPoint[];
}

const computeClusters = (points: MapPoint[], zoom: number): Cluster[] => {
  const cellSize = 0.004 * Math.pow(0.5, zoom - 12);
  const map = new Map<string, MapPoint[]>();
  points.forEach((p) => {
    const key = `${Math.floor(p.location.lat / cellSize)}-${Math.floor(p.location.lng / cellSize)}`;
    const arr = map.get(key) ?? [];
    arr.push(p);
    map.set(key, arr);
  });
  return Array.from(map.entries()).map(([key, pts]) => {
    const lat = pts.reduce((s, p) => s + p.location.lat, 0) / pts.length;
    const lng = pts.reduce((s, p) => s + p.location.lng, 0) / pts.length;
    return { key, position: [lat, lng], points: pts };
  });
};

const clusterIcon = (count: number) =>
  L.divIcon({
    className: "spr-cluster-icon",
    html: `<div class="spr-cluster-inner">${count}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

const statusColor = (status: string): string => STATUS_META[status as keyof typeof STATUS_META]?.dot ?? "bg-slate-400";

const MapAutoFit = ({ points }: { points: MapPoint[] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) {
      map.setView([CITY_CENTER.lat, CITY_CENTER.lng], 12);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.location.lat, p.location.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

const MapResize = () => {
  const map = useMapEvents({
    resize: () => map.invalidateSize(),
  });
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 200);
    return () => window.clearTimeout(t);
  }, [map]);
  return null;
};

interface MarkersLayerProps {
  points: MapPoint[];
  onSelect?: (p: MapPoint) => void;
}

const MarkersLayer = ({ points, onSelect }: MarkersLayerProps) => {
  const map = useMap();
  const [zoom, setZoom] = useState<number>(map.getZoom());

  useEffect(() => {
    const handler = () => setZoom(map.getZoom());
    map.on("zoomend", handler);
    return () => {
      map.off("zoomend", handler);
    };
  }, [map]);

  const clusters = useMemo(() => computeClusters(points, zoom), [points, zoom]);

  return (
    <>
      {clusters.map((cluster) => {
        if (cluster.points.length > 1) {
          return (
            <Marker
              key={cluster.key}
              position={cluster.position}
              icon={clusterIcon(cluster.points.length)}
              eventHandlers={{
                click: () => {
                  const b = L.latLngBounds(cluster.points.map((p) => [p.location.lat, p.location.lng] as [number, number]));
                  map.fitBounds(b, { padding: [32, 32], maxZoom: 16 });
                },
              }}
            />
          );
        }
        const p = cluster.points[0];
        return (
          <Marker
            key={p.id}
            position={[p.location.lat, p.location.lng]}
            eventHandlers={{ click: () => onSelect?.(p) }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-primary">{p.reportNumber}</span>
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", statusColor(p.status))}>
                    {titleCase(p.status)}
                  </span>
                </div>
                <p className="mb-1 text-sm font-semibold leading-snug">{p.title}</p>
                <p className="mb-2 text-xs text-muted-foreground">
                  {p.district} · {timeAgo(p.createdAt)}
                </p>
                <Link
                  to={`/complaints/${p.reportNumber}`}
                  className="inline-flex h-7 items-center rounded-md bg-primary px-2.5 text-xs font-medium text-white"
                >
                  View details
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

interface ComplaintMapProps {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
  height?: string | number;
  className?: string;
  onSelect?: (p: MapPoint) => void;
}

export const ComplaintMap = ({
  points,
  center = [CITY_CENTER.lat, CITY_CENTER.lng],
  zoom = 11,
  height = 420,
  className,
  onSelect,
}: ComplaintMapProps) => (
  <div className={cn("relative overflow-hidden rounded-xl border border-border", className)} style={{ height }}>
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
      attributionControl={true}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap &copy; CARTO'
      />
      <MapResize />
      <MapAutoFit points={points} />
      <MarkersLayer points={points} onSelect={onSelect} />
    </MapContainer>
  </div>
);

export const severityLegend = (): Array<{ label: string; hex: string }> =>
  (["low", "medium", "high", "critical"] as const).map((s) => ({
    label: SEVERITY_META[s].label,
    hex: SEVERITY_META[s].hex,
  }));
