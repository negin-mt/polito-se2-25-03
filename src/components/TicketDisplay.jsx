import { useEffect, useState } from "react";

export default function TicketDisplay({ ticket }) {
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      window.location.reload(); // torna alla selezione dei servizi
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ticket-container">
      <div className="ticket-card">
        <h2 className="ticket-title">QUEUE TICKET</h2>

        <div className="ticket-content">
          <p>
            <strong>Ticket Number:</strong> {ticket.ticketNumber}
          </p>
          <p>
            <strong>Service:</strong> {ticket.serviceName}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(ticket.issueTime).toLocaleDateString()}
          </p>
          <p>
            <strong>Time:</strong>{" "}
            {new Date(ticket.issueTime).toLocaleTimeString()}
          </p>
          <p>
            <strong>Queue Position:</strong> {ticket.queuePosition}
          </p>
          <p className="ticket-message">
            Please wait for your number to be called on the display.
          </p>
        </div>

        <div className="ticket-actions">
          <button onClick={handlePrint} className="print-btn">
            🖨️ Print Ticket
          </button>
        </div>

        <p className="redirect-msg">Redirecting in {secondsLeft}s...</p>
      </div>
    </div>
  );
}
