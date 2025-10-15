// src/services/queueService.js
const BASE = "http://localhost:3001";

/**
 * Helper per leggere/normalizzare la risposta come fate in API.mjs
 */
const handleResponse = async (res) => {
  if (res.ok) return await res.json();
  let err = { message: "Internal server error" };
  try { err = await res.json(); } catch {}
  // Accettiamo sia {message} sia {error}
  throw new Error(err.message || err.error || "Internal server error");
};

/**
 * Retry con backoff lineare semplice
 */
const withRetry = async (fn, retries = 1, delayMs = 800) => {
  try { return await fn(); }
  catch (e) {
    if (retries <= 0) throw e;
    await new Promise(r => setTimeout(r, delayMs));
    return withRetry(fn, retries - 1, delayMs);
  }
};

/**
 * POST /api/queue/call-next/:counterId
 */
export const callNextCustomer = async (counterId, { retries = 1 } = {}) =>
  withRetry(async () => {
    const res = await fetch(`${BASE}/api/queue/call-next/${counterId}`, { method: "POST" });
    const json = await handleResponse(res);
    // json atteso: { success: boolean, ticket?: {...}, message?/error? }
    return json;
  }, retries);

/**
 * GET /api/queue/current-ticket/:counterId
 */
export const getCurrentTicket = async (counterId, { retries = 0 } = {}) =>
  withRetry(async () => {
    const res = await fetch(`${BASE}/api/queue/current-ticket/${counterId}`, { method: "GET" });
    const json = await handleResponse(res);
    // json atteso: { success: true, ticket: {...} | null }
    return json;
  }, retries);

/**
 * POST /api/queue/complete-service/:ticketId
 */
export const completeService = async (ticketId, { retries = 1 } = {}) =>
  withRetry(async () => {
    const res = await fetch(`${BASE}/api/queue/complete-service/${ticketId}`, { method: "POST" });
    const json = await handleResponse(res);
    // json atteso: { success: true, ... }
    return json;
  }, retries);
