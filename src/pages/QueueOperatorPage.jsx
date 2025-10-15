// src/pages/QueueOperatorPage.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API/API.mjs";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

export default function QueueOperatorPage() {
  const navigate = useNavigate();
  const [counters, setCounters] = useState([]);
  const [selectedCounter, setSelectedCounter] = useState("");
  const [currentTicket, setCurrentTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const show = useCallback((msg, type = "success") => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 2500);
  }, []);

  // Carica counters
  useEffect(() => {
    let mounted = true;
    API.getCounters()
      .then(list => {
        if (!mounted) return;
        const arr = Array.isArray(list) ? list : [];
        setCounters(arr);
        if (arr.length) {
          const first = arr[0];
          const id = first.id ?? first.counterId ?? first.counter_id;
          setSelectedCounter(String(id));
        } else {
          setSelectedCounter("");
        }
      })
      .catch(err => show(err.message || "Errore nel caricamento dei counter", "error"));
    return () => { mounted = false; };
  }, [show]);

  // Carica ticket corrente al cambio counter
  useEffect(() => {
    if (!selectedCounter) { setCurrentTicket(null); return; }
    setLoading(true);
    API.getCurrentTicket(Number(selectedCounter))
      .then(res => { if (res?.success) setCurrentTicket(res.ticket || null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCounter]);

  const ticketId = useMemo(
    () => currentTicket?.id ?? currentTicket?.ticket_id ?? currentTicket?.ticketId ?? null,
    [currentTicket]
  );

  const ticketNumber = useMemo(
    () => currentTicket?.ticket_number ?? currentTicket?.ticketNumber ?? `#${ticketId ?? "—"}`,
    [currentTicket]
  );

  // CALL NEXT
  const handleCallNext = useCallback(async () => {
    if (!selectedCounter) { show("Seleziona un counter", "info"); return; }
    setLoading(true);
    try {
      const res = await API.callNextCustomer(Number(selectedCounter));
      if (res?.success && res?.ticket) {
        setCurrentTicket(res.ticket);
        show(`Ticket ${res.ticket.ticket_number || res.ticket.ticketNumber} chiamato`);
      } else {
        show("Nessun cliente in coda", "info");
      }
    } catch (e) {
      show(e.message || "Errore in Call Next", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedCounter, show]);

  // COMPLETE
  const handleComplete = useCallback(async () => {
    if (!ticketId) { show("Nessun ticket in servizio", "info"); return; }
    setLoading(true);
    try {
      await API.completeService(ticketId);
      setCurrentTicket(null);
      show("Servizio completato");
      // opzionale: ricarica anche lo stato del counter
      // const res = await API.getCurrentTicket(Number(selectedCounter));
      // if (res?.success) setCurrentTicket(res.ticket || null);
    } catch (e) {
      show(e.message || "Errore nel completamento", "error");
    } finally {
      setLoading(false);
    }
  }, [ticketId, selectedCounter, show]);

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Queue Operator</h4>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate("/")}
          style={{ fontWeight: 600 }}
        >
          ← Back to Home
        </Button>
      </div>

      {notice && (
        <Alert
          variant={notice.type === "error" ? "danger" : notice.type === "info" ? "info" : "success"}
          className="my-2"
        >
          {notice.msg}
        </Alert>
      )}

      <div className="d-flex gap-3 align-items-end my-3 flex-wrap">
        <Form.Group>
          <Form.Label>Seleziona Counter</Form.Label>
          <Form.Select
            value={selectedCounter}
            onChange={(e) => setSelectedCounter(e.target.value)}
            disabled={loading || counters.length === 0}
          >
            {(Array.isArray(counters) ? counters : []).map((c) => {
              const id = c.id ?? c.counterId ?? c.counter_id;
              const name = c.name ?? `Counter ${id}`;
              return <option key={id} value={String(id)}>{name}</option>;
            })}
          </Form.Select>
        </Form.Group>

        <div className="d-flex gap-2">
          <Button onClick={handleCallNext} disabled={loading || !selectedCounter}>
            {loading ? <Spinner size="sm" /> : "Call Next"}
          </Button>
          <Button variant="success" onClick={handleComplete} disabled={loading || !ticketId}>
            {loading ? <Spinner size="sm" /> : "Complete"}
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <strong>Ticket in servizio:</strong> {ticketId ? ticketNumber : "—"}
      </div>
    </div>
  );
}
