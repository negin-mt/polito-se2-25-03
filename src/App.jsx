import "bootstrap/dist/css/bootstrap.min.css";

import React from 'react'
import { useSelector } from 'react-redux'
import HomePage from './components/HomePage'
import TicketDisplay from './components/TicketDisplay'

export default function App() {
  // 🎟️ Ottieni lo stato globale dei ticket dallo store Redux
  const { currentTicket, loading, error } = useSelector(state => state.tickets)

  return (
    <div className="app-container" style={{ textAlign: 'center', padding: '0' }}>
      {/* Loading and error states */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'var(--accent-coral)' }}>{error}</p>}

      {/* Show ticket display or homepage */}
      {currentTicket ? (
        <TicketDisplay ticket={currentTicket} />
      ) : (
        <HomePage />
      )}
    </div>
  )
}

// import TicketTest from './ticketTest.jsx'

// export default function App() {
//   return <TicketTest />
// }

