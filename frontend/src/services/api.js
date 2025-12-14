export const BASE = import.meta.env.VITE_API_URL;

if (!BASE) {
  throw new Error("VITE_API_URL is not defined");
}

export function apiUrl(path) {
  return `${BASE}${path}`;
}
