import { useState, useEffect } from "react";
import { issueTicket } from "../services/ticketService";
import TicketDisplay from "./TicketDisplay";

export default function ServiceSelection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState(null);
  const [services, setServices] = useState([]);

  // 🔹 Carica i servizi dal backend Express
  useEffect(() => {
    fetch("http://localhost:3001/api/services")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch services");
        return res.json();
      })
      .then(setServices)
      .catch(() => setError("Unable to load services."));
  }, []);

  // 🔹 Gestisce la richiesta di un nuovo ticket
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

  // 🔹 Stato: caricamento
  if (loading) {
    return (
      <div className="service-container">
        <p className="loading-text">Generating your ticket...</p>
      </div>
    );
  }

  // 🔹 Stato: errore
  if (error) {
    return (
      <div className="service-container">
        <p className="error-text">{error}</p>
        <button className="retry-btn" onClick={() => setError("")}>
          Retry
        </button>
      </div>
    );
  }

  // 🔹 Stato: biglietto generato
  if (ticket) {
    return <TicketDisplay ticket={ticket} />;
  }

  // 🔹 Stato: visualizza i servizi
  return (
    <div className="service-container">
      <h2 className="service-title">Select a Service</h2>

      <div className="service-list">
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
