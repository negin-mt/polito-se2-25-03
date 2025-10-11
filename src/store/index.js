import { configureStore } from '@reduxjs/toolkit'
import ticketReducer from './ticketSlice.mock'   // 👈 usa la versione mock

const store = configureStore({
  reducer: {
    tickets: ticketReducer
  }
})

export default store
