import { configureStore } from '@reduxjs/toolkit'
import ticketReducer from './ticketSlice'   // 👈 usa la versione reale

const store = configureStore({
  reducer: {
    tickets: ticketReducer
  }
})

export default store
