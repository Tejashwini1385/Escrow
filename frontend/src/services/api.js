// frontend/src/services/api.js
export const BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:5000" : "");

export function apiUrl(path) {
  if (!BASE) {
    console.error("❌ VITE_API_URL is missing");
    return path;
  }
  return `${BASE}${path}`;
}
