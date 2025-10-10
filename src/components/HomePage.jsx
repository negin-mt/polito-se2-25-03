import { useState } from "react";
import ServiceSelection from "./ServiceSelection";
import DisplayQueue from "./DisplayQueue";


export default function HomePage() {
  const [view, setView] = useState("home");

  // --- View: Get Ticket ---
  if (view === "get-ticket") {
    return (
      <div className="page">
        <header className="header">
          <h1>Get Your Ticket</h1>
          <button className="back-btn" onClick={() => setView("home")}>
            ⬅ Back
          </button>
        </header>
        <ServiceSelection />
      </div>
    );
  }

  // --- View: Call Next Customer ---
  if (view === "call-next") {
    return (
      <div className="page">
        <header className="header">
          <h1>Call Next Customer</h1>
          <button className="back-btn" onClick={() => setView("home")}>
            ⬅ Back
          </button>
        </header>

        <main className="section">
          <p className="placeholder-text">
            This area will be used by officers to call the next customer.
          </p>
          <p className="placeholder-sub">
            (Feature in progress – Story Q2)
          </p>
        </main>
      </div>
    );
  }

  // --- View: Home Page ---
  return (
    <div className="page home">
      <header className="header">
        <h1 className="title">Queue Management System</h1>
        <p className="subtitle">Welcome!</p>
      </header>

      <main className="main">
        <div className="left">
          <div className="button-group">
            <button
              className="main-btn green"
              onClick={() => setView("get-ticket")}
            >
              🎟️ Get Ticket
            </button>

            <button
              className="main-btn blue"
              onClick={() => setView("call-next")}
            >
              👤 Call Next Customer
            </button>
          </div>
        </div>

        <aside className="display-queue">
          <DisplayQueue />
        </aside>
      </main>

      <footer className="footer">
        <p>© 2025 Polito Queue System</p>
      </footer>
    </div>
  );
}
