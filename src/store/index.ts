import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { connectSlice } from './connectSlice'
import { streamSlice } from './streamSlice'
import { createWrapper } from 'next-redux-wrapper'

const makeStore = () =>
  configureStore({
    reducer: {
      [connectSlice.name]: connectSlice.reducer,
      [streamSlice.name]: streamSlice.reducer,
    },
    devTools: true,
  })

export type AppStore = ReturnType<typeof makeStore>
export type AppState = ReturnType<AppStore['getState']>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>

export const wrapper = createWrapper<AppStore>(makeStore)
