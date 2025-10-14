import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import API from "../API/API.mjs";

export default function TicketStatus() {
  const [show, setShow] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketInfo, setTicketInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setShow(false);
    setTicketInfo(null);
    setError(null);
    setTicketNumber('');
  };
  const handleShow = () => setShow(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticketNumber || ticketNumber.trim() === '') {
      setError('Inserisci il numero del ticket');
      return;
    }
    setLoading(true);
    setError(null);
    setTicketInfo(null);

    try {
      const resp = await API.getTicketByNumber(ticketNumber.trim());
      // API.getTicketByNumber ritorna json.data || json.ticket || json
      const t = resp?.data || resp?.ticket || resp || null;
      if (!t) {
        setError('Ticket non trovato');
      } else {
        setTicketInfo(t);
      }
    } catch (err) {
      setError(err.message || 'Errore durante la richiesta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="primary" size="lg" onClick={handleShow}>
        Check Ticket Status
      </Button>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ticket Status</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Mostra il form solo finché non abbiamo i dati o un errore */}
          {!ticketInfo && !error && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formTicketNumber">
                <Form.Label>Ticket Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter ticket number"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  Please enter your ticket number to check the status.
                </Form.Text>
              </Form.Group>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Checking...' : 'Submit'}
              </Button>
            </Form>
          )}

          {/* Mostra i dati del ticket se trovati */}
          {ticketInfo && (
            <div className="p-2">
              <h5 className="mb-3">Ticket Information</h5>
              <p><strong>Ticket Number:</strong> {ticketInfo.ticketNumber}</p>
              <p><strong>Status:</strong> {ticketInfo.status}</p>
              <p><strong>Service Type:</strong> {ticketInfo.serviceType}</p>
              <p><strong>Issued At:</strong> {ticketInfo.issuedAt}</p>
              {ticketInfo.queue_position && (
                <p><strong>Queue Position:</strong> {ticketInfo.queue_position}</p>
              )}
              <Button variant="secondary" onClick={() => {setTicketInfo(null); setError(null); setTicketNumber('');}}>
                Check another ticket
              </Button>
            </div>
          )}

          {/* Mostra messaggio di errore se presente */}
          {error && (
            <div className="text-center text-danger mt-3">
              <p>{error}</p>
              <Button variant="secondary" onClick={() => setError(null)}>
                Try again
              </Button>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
