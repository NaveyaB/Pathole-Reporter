import { useEffect, useRef, useState } from "react";

export const useCountUp = (target: number, duration = 900): number => {
  const [value, setValue] = useState(0);
  const ref = useRef<number>(0);
  const started = useRef(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }

    started.current = true;
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      ref.current = 0;
      started.current = false;
    };
  }, [target, duration]);

  return value;
};

export const useInView = <T extends HTMLElement>(options?: IntersectionObserverInit) => {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options ?? { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
};
