import { useState } from "react";
import { issueTicket } from "../services/ticketService";
import TicketDisplay from "./TicketDisplay";

export default function ServiceSelection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState(null);

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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Generating your ticket...
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-600">
        <p>{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setError("")}
        >
          Retry
        </button>
      </div>
    );

  if (ticket) return <TicketDisplay ticket={ticket} />;

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <h2 className="text-3xl font-semibold mb-4">Select a Service</h2>
      <button
        onClick={() => handleGetTicket(1)}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg"
      >
        Banking
      </button>
      <button
        onClick={() => handleGetTicket(2)}
        className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg"
      >
        Post Office
      </button>
      <button
        onClick={() => handleGetTicket(3)}
        className="bg-purple-500 text-white px-6 py-3 rounded-lg text-lg"
      >
        Customer Support
      </button>
    </div>
  );
}
