import { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import { issueTicket } from "../services/ticketService";
import TicketDisplay from "./TicketDisplay";

export default function ServiceSelection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState(null);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // 🔹 Carica i servizi dal backend Express
  useEffect(() => {
    setServicesLoading(true);
    fetch("http://localhost:3001/api/services")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch services");
        return res.json();
      })
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setError("Unable to load services."))
      .finally(() => setServicesLoading(false));
  }, []);

  // 🔹 Gestisce la richiesta di un nuovo ticket
  const handleGetTicket = async (serviceTypeId) => {
    setLoading(true);
    setError("");
    try {
      const resp = await issueTicket(serviceTypeId);
      // Normalize payload to match backend structure { success, data: { ...ticket } }
      const normalized = resp && resp.data ? resp.data : resp;
      setTicket(normalized || null);
    } catch (err) {
      setError(err.message || "Unable to issue ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Stato: caricamento
  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status" className="mb-3" />
          <div>Generating your ticket...</div>
        </Card.Body>
      </Card>
    );
  }

  // 🔹 Stato: errore
  if (error) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <Alert variant="danger" className="mb-3">{error}</Alert>
          <div className="d-flex justify-content-end">
            <Button variant="outline-secondary" onClick={() => setError("")}>Retry</Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  // 🔹 Stato: biglietto generato
  if (ticket) {
    return <TicketDisplay ticket={ticket} />;
  }

  // 🔹 Stato: visualizza i servizi
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="h5 m-0">Select a Service</h2>
          {servicesLoading && (
            <div className="d-flex align-items-center text-muted" style={{ gap: "0.5rem" }}>
              <Spinner size="sm" animation="grow" /> Loading
            </div>
          )}
        </div>

        {services.length === 0 && !servicesLoading ? (
          <Alert variant="warning" className="mb-0">No services available right now.</Alert>
        ) : (
          <Row className="g-3">
            {services.map((service) => (
              <Col key={service.id} xs={12} sm={6} md={4} lg={3}>
                <Card className="h-100 border-0" style={{ backgroundColor: "#f8f9fa" }}>
                  <Card.Body className="d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="mb-1" style={{ fontSize: "1.05rem" }}>{service.name}</h5>
                      {service.description && (
                        <div className="text-muted" style={{ fontSize: "0.9rem" }}>{service.description}</div>
                      )}
                    </div>
                    <Button className="mt-3" variant="primary" onClick={() => handleGetTicket(service.id)}>
                      Get Ticket
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}
