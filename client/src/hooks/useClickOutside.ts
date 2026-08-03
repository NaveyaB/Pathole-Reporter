import { useEffect, useRef } from "react";

export const useClickOutside = (onOutside: () => void, active = true) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutside();
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOutside();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [onOutside, active]);

  return ref;
};
