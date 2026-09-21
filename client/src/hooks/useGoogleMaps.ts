import { useEffect, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps";

type MapsStatus = "loading" | "ready" | "error";

export const useGoogleMaps = (): {
  maps: typeof google.maps | null;
  status: MapsStatus;
  error: string | null;
} => {
  const [status, setStatus] = useState<MapsStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadGoogleMaps()
      .then(() => {
        if (active) setStatus("ready");
      })
      .catch((err: unknown) => {
        if (!active) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      active = false;
    };
  }, []);

  const maps = status === "ready" ? window.google?.maps : null;
  return { maps, status, error };
};