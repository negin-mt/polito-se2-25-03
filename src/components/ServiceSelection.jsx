import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import { issueTicket } from "../store/ticketSlice";
import TicketDisplay from "./TicketDisplay";

export default function ServiceSelection() {
  const dispatch = useDispatch();
  const { currentTicket, loading, error } = useSelector(state => state.tickets);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // 🔹 Carica i servizi dal backend Express
  useEffect(() => {
    setServicesLoading(true);
    fetch("http://localhost:3001/api/service/alias")
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
    try {
      const resultAction = await dispatch(issueTicket(serviceTypeId));
      
      if (issueTicket.fulfilled.match(resultAction)) {
        // Find the service information for display
        const service = services.find(s => s.id === serviceTypeId);
        const ticketData = resultAction.payload.data || resultAction.payload;
        
        // The Redux store will handle the ticket state
        // The App component will automatically show TicketDisplay
      }
    } catch (err) {
      console.error('Ticket creation failed:', err);
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
  if (currentTicket) {
    return <TicketDisplay ticket={currentTicket} />;
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
                <Card className="h-100" style={{ 
                  border: "1px solid var(--border-light)", 
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #f8f9fd 0%, #ffffff 100%)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "var(--shadow-sm)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  e.currentTarget.style.borderColor = "var(--accent-purple)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  e.currentTarget.style.borderColor = "var(--border-light)";
                }}>
                  <Card.Body className="d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="mb-1" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary-dark)", letterSpacing: "-0.01em" }}>{service.name}</h5>
                      {service.description && (
                        <div className="text-muted" style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{service.description}</div>
                      )}
                    </div>
                    <Button className="mt-3" variant="primary" onClick={() => handleGetTicket(service.id)} style={{ fontWeight: 600, borderRadius: "10px", padding: "0.6rem" }}>
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
