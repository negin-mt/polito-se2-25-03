// src/services/counterService.js
const BASE = "http://localhost:3001";

const handleResponse = async (res) => {
  if (res.ok) return await res.json();
  let err = { message: "Internal server error" };
  try { err = await res.json(); } catch {}
  throw new Error(err.message || err.error || "Internal server error");
};

const toArray = (json) => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.counters)) return json.counters;
  // fallback: se il server restituisce un oggetto mappa (id -> counter)
  if (json && typeof json === "object") return Object.values(json);
  return [];
};

export const getCounters = async () => {
  const res = await fetch(`${BASE}/api/counters`, { method: "GET" });
  const json = await handleResponse(res);
  return toArray(json); // <-- garantisce sempre un array
};
