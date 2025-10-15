const SERVER_URL = "http://localhost:3001";

const handleResponse = async (res) => {
  if (res.ok) return await res.json();
  // prova a leggere json di errore, altrimenti fallback generico
  let err = { message: "Internal server error" };
  try { err = await res.json(); } catch {}
  throw new Error(err.message || err.error || "Internal server error");
};

const getHealth = async () => {
  const response = await fetch(SERVER_URL + '/api/health', {
    method: "GET",
    //credentials: "include",
  });
  return await handleResponse(response);
};

const getServiceTypes = async () => {
  const response = await fetch(SERVER_URL + '/api/service/type', {
    method: "GET",
    //credentials: "include",
  });
  const json = await handleResponse(response);
  // alcuni server ritornano { success, data }, altri direttamente array
  return Array.isArray(json) ? json : (json.data || json.serviceTypes || json);
};
const getServices = async () => {
  const response = await fetch(SERVER_URL + '/api/service/alias', {
    method: "GET",
    //credentials: "include",
  });
  const json = await handleResponse(response);
  return Array.isArray(json) ? json : (json.data || json.services || json);
};

const issueTicket = async (serviceTypeId) => {
  const response = await fetch(SERVER_URL + '/api/tickets', {
    method: "POST",
    //credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ serviceTypeId }),
  });
  const json = await handleResponse(response);
  return json.data || json.ticket || json; // compatibilità con diverse risposte
};
const getTicket = async (id) => {
  const response = await fetch(`${SERVER_URL}/api/tickets/${id}`, {
    method: "GET",
    //credentials: "include",
  });
  const json = await handleResponse(response);
  return json.data || json.ticket || json;
};

const getTicketByNumber = async (ticketNumber) => {
  const response = await fetch(`${SERVER_URL}/api/tickets/number/${encodeURIComponent(ticketNumber)}`, {
    method: "GET",
    //credentials: "include",
  });
  const json = await handleResponse(response);
  return json.data || json.ticket || json;
};
const getQueueStatus = async (serviceTypeId) => {
  const response = await fetch(`${SERVER_URL}/api/queue/status/${serviceTypeId}`, {
    method: "GET",
    //credentials: "include",
  });
  const json = await handleResponse(response);
  return json.data || json.status || json;
};

const cancelTicket = async (id) => {
  const response = await fetch(`${SERVER_URL}/api/tickets/${id}/cancel`, {
    method: "PATCH",
    //credentials: "include",
  });
  const json = await handleResponse(response);
  return json.data || json.result || json;
};


const API = { getHealth,
  getServiceTypes,
  getServices,
  issueTicket,
  getTicket,
  getTicketByNumber,
  getQueueStatus,
  cancelTicket};
export default API;