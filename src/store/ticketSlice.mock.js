import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Simulazione del backend (ritardi e dati fake)
const mockApi = {
  issueTicket: async (serviceTypeId) => {
    await new Promise(r => setTimeout(r, 1000))
    return {
      id: Math.floor(Math.random() * 1000),
      ticket_number: `A${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`,
      service_type_id: serviceTypeId,
      status: 'WAITING',
      queue_position: 1
    }
  },
  fetchQueueStatus: async (serviceTypeId) => {
    await new Promise(r => setTimeout(r, 800))
    return {
      serviceTypeId,
      waitingTickets: Math.floor(Math.random() * 10) + 1
    }
  }
}

// Async actions (mocked)
export const issueTicket = createAsyncThunk(
  'tickets/issueTicket',
  async (serviceTypeId) => await mockApi.issueTicket(serviceTypeId)
)

export const fetchQueueStatus = createAsyncThunk(
  'tickets/fetchQueueStatus',
  async (serviceTypeId) => await mockApi.fetchQueueStatus(serviceTypeId)
)

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
      .addCase(issueTicket.pending, (state) => { state.loading = true })
      .addCase(issueTicket.fulfilled, (state, action) => {
        state.loading = false
        state.currentTicket = action.payload
      })
      .addCase(issueTicket.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchQueueStatus.fulfilled, (state, action) => {
        state.queueStatus = action.payload
      })
  }
})

export default ticketSlice.reducer
