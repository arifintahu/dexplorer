import { configureStore } from '@reduxjs/toolkit'
import connectSlice from './connectSlice'
import paramsSlice from './paramsSlice'
import streamSlice from './streamSlice'

export const store = configureStore({
  reducer: {
    connect: connectSlice,
    params: paramsSlice,
    stream: streamSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'stream/setClient',
          'connect/setClient',
          'connect/setTmClient',
          'stream/setSubsNewBlock',
          'stream/setSubsTxEvent',
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: [
          'payload.client',
          'payload.header.time',
          'payload.tx',
          'payload.result.tx',
          'payload.result.header.time',
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'connect.client',
          'stream.client',
          'connect.tmClient',
          'stream.newBlock.header.time',
          'stream.newBlock.header.lastBlockId.hash',
          'stream.txEvent.tx',
          'stream.txEvent.hash',
          'stream.txEvent.result.tx',
          'stream.txEvent.result.header.time',
          'stream.subsNewBlock',
          'stream.subsTxEvent',
          'stream.txEvent.result.data',
          'stream.newBlock.header.lastBlockId.parts.hash',
        ],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
