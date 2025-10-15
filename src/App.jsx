import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import HomePage from "./components/HomePage";
import TicketDisplay from "./components/TicketDisplay";
import QueueOperatorPage from "./pages/QueueOperatorPage.jsx";

export default function App() {
  // 🎟️ Stato globale dei ticket (Redux)
  const { currentTicket, loading, error } = useSelector((state) => state.tickets);

  return (
    <BrowserRouter>
      <div className="app-container" style={{ textAlign: "center", padding: 0 }}>
        {/* Navbar minimale (opzionale) */}
        <nav className="navbar navbar-light bg-light px-3 justify-content-between">
          <Link className="navbar-brand" to="/">Queue System</Link>
          <div className="d-flex gap-2">
            <Link className="btn btn-outline-primary btn-sm" to="/">Home</Link>
            <Link className="btn btn-primary btn-sm" to="/operator">Operator</Link>
          </div>
        </nav>

        {/* Loading / Error */}
        {loading && <p className="mt-3">Loading...</p>}
        {error && <p className="mt-2" style={{ color: "var(--accent-coral)" }}>{error}</p>}

        {/* Routes */}
        <Routes>
          {/* Root: comportamento attuale */}
          <Route
            path="/"
            element={currentTicket ? <TicketDisplay ticket={currentTicket} /> : <HomePage />}
          />

          {/* Pagina operatore */}
          <Route path="/operator" element={<QueueOperatorPage />} />

          {/* (Opzionale) rotta dedicata al display, se vuoi raggiungerla anche senza currentTicket */}
          <Route
            path="/display"
            element={currentTicket ? <TicketDisplay ticket={currentTicket} /> : <HomePage />}
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// import TicketTest from './ticketTest.jsx'

// export default function App() {
//   return <TicketTest />
// }

