import { setIn } from 'immutable'
import { createAction, createReducer } from 'redux-act'

import { GlobalState } from '../reducers'

export type AppInitialState = {
  started: boolean
}

/* ----- Initial state ---- */
const initialState: AppInitialState = {
  started: false,
}

/* ----- Actions ---- */
const actions = {
  setStarted: createAction<{ started: boolean }>('setStarted'),
}

/* ----- Reducer ---- */
const reducer = createReducer((on) => {
  on(actions.setStarted, (state, { started }) => setIn(state, ['started'], started))
}, initialState)

/* ----- Selectors ---- */
const getState = (state: GlobalState) => state
const getProps = (state: GlobalState, props: any) => props
const getRoot = (state: GlobalState) => state.app
const getStarted = (state: GlobalState) => getRoot(state).started

const selectors = {
  getStarted,
}

const persistConfig = {
  blacklist: ['started'],
}

const App = { actions, reducer, selectors, persistConfig }

export default App
