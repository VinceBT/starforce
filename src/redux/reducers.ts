import App, { AppInitialState } from './App/App.reducers'

const rootReducer = {
  app: App.reducer,
}

export type GlobalState = {
  app: AppInitialState
}

export default rootReducer
