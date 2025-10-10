import { useState, useEffect } from "react";
import { issueTicket } from "../services/ticketService";
import TicketDisplay from "./TicketDisplay";

export default function ServiceSelection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState(null);
  const [services, setServices] = useState([]);

  useEffect(() => {
  fetch("http://localhost:3001/api/services")
    .then((res) => res.json())
    .then(setServices)
    .catch(() => setError("Unable to load services."));
}, []);

  const handleGetTicket = async (serviceTypeId) => {
    setLoading(true);
    setError("");
    try {
      const data = await issueTicket(serviceTypeId);
      setTicket(data);
    } catch (err) {
      setError(err.message || "Unable to issue ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Different Views ---
  if (loading) {
    return (
      <div className="center">
        <p>Generating your ticket...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="center">
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => setError("")}>Retry</button>
      </div>
    );
  }

  if (ticket) {
    return <TicketDisplay ticket={ticket} />;
  }

  // --- Default View: Show Services ---
  return (
    <div className="center">
      <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Select a Service
      </h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => handleGetTicket(service.id)}
            className="service-btn"
          >
            {service.name}
          </button>
        ))}
      </div>
    </div>
  );
}
