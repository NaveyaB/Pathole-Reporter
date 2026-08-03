import { useCallback, useState } from "react";
import { getErrorMessage } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

interface UseApiOptions {
  showErrorToast?: boolean;
}

export const useApi = <T,>(options?: UseApiOptions) => {
  const { error: toastError } = useToast();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (fn: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn();
        setData(result);
        return result;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        if (options?.showErrorToast !== false) toastError("Request failed", message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options?.showErrorToast, toastError]
  );

  return { data, loading, error, run, setData };
};

export const useGeolocation = () => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { position, error, loading, locate, setPosition };
};
