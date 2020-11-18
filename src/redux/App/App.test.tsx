import configureStore from '../configureStore'
import App from './App.reducers'

let { store } = configureStore()

beforeEach(() => {
  store = configureStore().store
})

test('app is started', () => {
  const state = store.getState()
  expect(App.selectors.getStarted(state)).toEqual(true)
})
