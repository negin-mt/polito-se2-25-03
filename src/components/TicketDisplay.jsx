import { useEffect, useState } from "react";

export default function TicketDisplay({ ticket }) {
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      window.location.reload(); // torna alla selezione servizi
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg border rounded-2xl p-8 text-center w-96 print:w-full print:border-none">
        <h2 className="text-lg text-gray-700 mb-4 font-medium">
          YOUR TICKET NUMBER IS
        </h2>
        <div className="text-7xl font-bold text-blue-600 mb-4">
          {ticket.ticketNumber}
        </div>
        <div className="text-left space-y-2 mb-6">
          <p>
            <strong>Service:</strong> {ticket.serviceName}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(ticket.issueTime).toLocaleString()}
          </p>
          <p>
            <strong>Queue Position:</strong> {ticket.queuePosition}
          </p>
          <p>
            <strong>Estimated Wait:</strong> ~{ticket.estimatedWait} min
          </p>
        </div>

        <p className="text-gray-500 text-sm mb-4">
          Please wait for your number to be called
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Print Ticket
          </button>
          <button className="bg-gray-300 text-black px-4 py-2 rounded-lg">
            Get QR
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Redirecting in {secondsLeft}s...
        </p>
      </div>
    </div>
  );
}
