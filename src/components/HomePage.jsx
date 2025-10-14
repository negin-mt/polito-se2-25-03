import { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import ServiceSelection from "./ServiceSelection";
import DisplayQueue from "./DisplayQueue";
import TicketStatus from "./TicketLookUp";


export default function HomePage() {
  const [view, setView] = useState("home");
  // --- View: Get Ticket ---
  if (view === "get-ticket") {
    return (
      <Container fluid className="py-4">
        <Row className="align-items-center mb-3">
          <Col>
            <h1 className="h3 m-0">Get Your Ticket</h1>
          </Col>
          <Col xs="auto">
            <Button variant="outline-secondary" onClick={() => setView("home")}>
              ⬅ Back
            </Button>
          </Col>
        </Row>

        <Card className="shadow-sm">
          <Card.Body>
            <ServiceSelection />
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // --- View: Call Next Customer ---
  if (view === "call-next") {
    return (
      <Container fluid className="py-4">
        <Row className="align-items-center mb-3">
          <Col>
            <h1 className="h3 m-0">Call Next Customer</h1>
          </Col>
          <Col xs="auto">
            <Button variant="outline-secondary" onClick={() => setView("home")}>
              ⬅ Back
            </Button>
          </Col>
        </Row>

        <Card className="shadow-sm">
          <Card.Body>
            <p className="mb-1">This area will be used by officers to call the next customer.</p>
            <Badge bg="warning" text="dark">Feature in progress – Story Q2</Badge>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // --- View: Home Page ---
  return (
    <Container fluid className="py-4 homepage-container">
      <Row className="mb-4">
        <Col>
          <Card className="home-hero-card">
            <Card.Body className="text-white">
              <h1 className="display-6 mb-1 home-hero-title">Queue Management System</h1>
              <p className="mb-0 home-hero-subtitle">Welcome! Please choose an action below.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm h-100 home-main-card">
            <Card.Body>
              <Row className="g-3">
                <Col sm={6}>
                  <Card className="action-card primary">
                    <Card.Body>
                      <div>
                        <h5 className="mb-2">Get a Ticket</h5>
                        <p className="text-muted mb-3">Select a service and receive your queue number.</p>
                      </div>
                      <Button size="lg" variant="primary" onClick={() => setView("get-ticket")}>🎟️ Get Ticket</Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={6}>
                  <Card className="action-card success">
                    <Card.Body>
                      <div>
                        <h5 className="mb-2">Call Next Customer</h5>
                        <p className="text-muted mb-3">Operator console to call customers in order.</p>
                      </div>
                      <Button size="lg" variant="success" onClick={() => setView("call-next")}>👤 Call Next</Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={12}>
                  <Card className="action-card warning">
                    <Card.Body>
                      <h5 className="mb-3">Lookup Ticket</h5>
                      <div>
                        <TicketStatus />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <DisplayQueue />
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <div className="home-footer small">© 2025 Polito Queue System</div>
        </Col>
      </Row>
    </Container>
  );
}
