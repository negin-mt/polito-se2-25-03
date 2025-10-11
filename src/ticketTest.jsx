import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { issueTicket, fetchQueueStatus } from './store/ticketSlice.mock'

export default function TicketTest() {
  const dispatch = useDispatch()
  const { currentTicket, queueStatus, loading } = useSelector(state => state.tickets)

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>🎫 Ticket Redux Test</h2>
      <button onClick={() => dispatch(issueTicket(1))}>Get Ticket</button>
      <button onClick={() => dispatch(fetchQueueStatus(1))}>Check Queue</button>

      {loading && <p>Loading...</p>}
      {currentTicket && <p>Your ticket: {currentTicket.ticket_number}</p>}
      {queueStatus && <p>People waiting: {queueStatus.waitingTickets}</p>}
    </div>
  )
}
