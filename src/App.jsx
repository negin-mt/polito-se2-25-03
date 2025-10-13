import "bootstrap/dist/css/bootstrap.min.css";

import React from 'react'
import { useSelector } from 'react-redux'
import HomePage from './components/HomePage'
import TicketDisplay from './components/TicketDisplay'

export default function App() {
  // 🎟️ Ottieni lo stato globale dei ticket dallo store Redux
  const { currentTicket, loading, error } = useSelector(state => state.tickets)

  return (
    <div className="app-container" style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>🏛️ Office Queue Management</h1>

      {/* 🔄 Mostra messaggi di caricamento o errore */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* 🧩 Se l’utente ha già un ticket, mostra la schermata TicketDisplay */}
      {currentTicket ? (
        <TicketDisplay ticket={currentTicket} />
      ) : (
        // 🏠 Altrimenti mostra la HomePage (es. selezione del servizio)
        <HomePage />
      )}
    </div>
  )
}

// import TicketTest from './ticketTest.jsx'

// export default function App() {
//   return <TicketTest />
// }

