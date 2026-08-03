export const generateId = (prefix = "id"): string => {
  const rand = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  return `${prefix}_${rand}`;
};

export const uid = (): string => Math.random().toString(36).slice(2, 10);

export const nowIso = (): string => new Date().toISOString();

export const daysBetween = (from: string, to = new Date().toISOString()): number => {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  return Math.max(0, (b - a) / (1000 * 60 * 60 * 24));
};

export const hoursBetween = (from: string, to = new Date().toISOString()): number => {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  return Math.max(0, (b - a) / (1000 * 60 * 60));
};

export const addDays = (iso: string, days: number): string => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const subtractDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};
