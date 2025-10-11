// src/store/index.js
import { configureStore } from '@reduxjs/toolkit'
import ticketReducer from './ticketSlice'

const store = configureStore({
  reducer: {
    tickets: ticketReducer
  }
})

export default store
