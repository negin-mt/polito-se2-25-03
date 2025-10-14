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
          <Col xs="auto" className="text-muted">
            Redirecting in {secondsLeft}s
          </Col>
        </Row>

        <Card className="text-center border-0" style={{ backgroundColor: "#f8f9fa" }}>
          <Card.Body>
            <div className="mb-2" style={{ letterSpacing: "0.1em", color: "#6c757d" }}>TICKET NUMBER</div>
            <div style={{ fontSize: "3rem", fontWeight: 700 }}>{ticketNumber}</div>
            <div className="mt-3" style={{ fontSize: "1rem" }}>
              <div><strong>Service:</strong> {serviceName}</div>
              <div><strong>Date:</strong> {issuedAt ? new Date(issuedAt).toLocaleDateString() : "-"}</div>
              <div><strong>Time:</strong> {issuedAt ? new Date(issuedAt).toLocaleTimeString() : "-"}</div>
              <div><strong>Queue Position:</strong> {queuePosition}</div>
            </div>
          </Card.Body>
        </Card>

        <div className="d-flex justify-content-end mt-3">
          <Button onClick={handlePrint} variant="outline-primary">🖨️ Print Ticket</Button>
        </div>
      </Card.Body>
    </Card>
  );
}
