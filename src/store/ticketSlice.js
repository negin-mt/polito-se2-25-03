// src/store/ticketSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// URL base del tuo backend (aggiorna la porta se necessario)
const API_BASE = 'http://localhost:3001/api'

// --- ASYNC ACTIONS ---

// 1️⃣ Genera un nuovo ticket
export const issueTicket = createAsyncThunk(
  'tickets/issueTicket',
  async (serviceTypeId) => {
    // Create ticket
    const ticketRes = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceTypeId })
    })
    if (!ticketRes.ok) throw new Error('Failed to issue ticket')
    const ticketData = await ticketRes.json()
    
    // Get service information
    const serviceRes = await fetch(`${API_BASE}/service/alias`)
    if (!serviceRes.ok) throw new Error('Failed to fetch services')
    const services = await serviceRes.json()
    const service = services.find(s => s.id === serviceTypeId)
    
    return {
      ticket: ticketData,
      service: service
    }
  }
)

// 2️⃣ Ottieni le informazioni di un ticket
export const fetchTicketInfo = createAsyncThunk(
  'tickets/fetchTicketInfo',
  async (ticketId) => {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}`)
    if (!res.ok) throw new Error('Failed to fetch ticket info')
    return await res.json()
  }
)

// 3️⃣ Ottieni lo stato della coda
export const fetchQueueStatus = createAsyncThunk(
  'tickets/fetchQueueStatus',
  async (serviceTypeId) => {
    const res = await fetch(`${API_BASE}/queue/status/${serviceTypeId}`)
    if (!res.ok) throw new Error('Failed to fetch queue status')
    return await res.json()
  }
)

// --- SLICE ---

const ticketSlice = createSlice({
  name: 'tickets',
  initialState: {
    currentTicket: null,
    queueStatus: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Issue ticket
      .addCase(issueTicket.pending, (state) => { state.loading = true })
      .addCase(issueTicket.fulfilled, (state, action) => {
        state.loading = false
        const { ticket, service } = action.payload
        const ticketData = ticket.data || ticket
        
        // Normalize the ticket data to match what TicketDisplay expects
        state.currentTicket = {
          ticketNumber: ticketData.ticket_number,
          serviceType: {
            name: service ? service.name : 'Unknown Service'
          },
          issuedAt: ticketData.issued_at,
          queuePosition: ticketData.queue_position || 'N/A',
          status: ticketData.status,
          serviceTypeId: ticketData.service_type_id
        }
      })
      .addCase(issueTicket.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Fetch ticket info
      .addCase(fetchTicketInfo.fulfilled, (state, action) => {
        state.currentTicket = action.payload
      })
      // Fetch queue status
      .addCase(fetchQueueStatus.fulfilled, (state, action) => {
        state.queueStatus = action.payload
      })
  }
})

export default ticketSlice.reducer
