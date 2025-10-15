import { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function TicketDisplay({ ticket }) {
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      window.location.reload();
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Normalize expected fields from backend
  const ticketNumber = ticket.ticketNumber;
  const serviceName = ticket.serviceType?.name || ticket.serviceName;
  const issuedAt = ticket.issuedAt || ticket.issueTime;
  const queuePosition = ticket.queuePosition;

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Row className="align-items-center mb-3">
          <Col>
            <h2 className="h4 m-0">Your Ticket</h2>
          </Col>
          <Col xs="auto" className="text-muted" style={{ fontSize: "0.9rem" }}>
            Redirecting in {secondsLeft}s
          </Col>
        </Row>

        <Card className="text-center border-0" style={{ background: "linear-gradient(135deg, #f8f9fd 0%, #ffffff 100%)", border: "2px solid var(--border-light)" }}>
          <Card.Body className="py-4">
            <div className="mb-2" style={{ letterSpacing: "0.15em", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>TICKET NUMBER</div>
            <div style={{ fontSize: "3.5rem", fontWeight: 800, background: "linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-coral) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-0.02em" }}>{ticketNumber}</div>
            <div className="mt-4" style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>
              <div className="mb-2" style={{ padding: "0.5rem", borderRadius: "8px" }}><strong style={{ color: "var(--primary-dark)" }}>Service:</strong> {serviceName}</div>
              <div className="mb-2" style={{ padding: "0.5rem", borderRadius: "8px" }}><strong style={{ color: "var(--primary-dark)" }}>Date:</strong> {issuedAt ? new Date(issuedAt).toLocaleDateString() : "-"}</div>
              <div className="mb-2" style={{ padding: "0.5rem", borderRadius: "8px" }}><strong style={{ color: "var(--primary-dark)" }}>Time:</strong> {issuedAt ? new Date(issuedAt).toLocaleTimeString() : "-"}</div>
              <div style={{ padding: "0.5rem", borderRadius: "8px" }}><strong style={{ color: "var(--primary-dark)" }}>Queue Position:</strong> {queuePosition}</div>
            </div>
          </Card.Body>
        </Card>

        <div className="d-flex justify-content-end mt-3">
          <Button onClick={handlePrint} variant="primary" style={{ fontWeight: 600, padding: "0.75rem 1.5rem", borderRadius: "10px" }}>
            Print Ticket
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
