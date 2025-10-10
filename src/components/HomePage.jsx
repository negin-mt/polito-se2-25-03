import { useState } from "react";
import ServiceSelection from "./ServiceSelection";

export default function HomePage() {
  const [view, setView] = useState("home");

  if (view === "get-ticket") {
    return <ServiceSelection />;
  }

  if (view === "call-next") {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center bg-gray-100">
        <h1 className="text-3xl font-semibold mb-6">Call Next Customer</h1>
        <p className="text-gray-600 mb-6">
          This section will allow officers to call the next customer.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          (This part will be developed in Story Q2)
        </p>
        <button
          onClick={() => setView("home")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">Welcome to the Queue System</h1>
      <div className="flex gap-8">
        <button
          onClick={() => setView("get-ticket")}
          className="bg-green-500 text-white px-6 py-4 text-xl rounded-lg hover:bg-green-600"
        >
          🎟️ Get Ticket
        </button>
        <button
          onClick={() => setView("call-next")}
          className="bg-blue-500 text-white px-6 py-4 text-xl rounded-lg hover:bg-blue-600"
        >
          👤 Call Next Customer
        </button>
      </div>
    </div>
  );
}
