import { applyMiddleware, combineReducers, createStore } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly'
import { persistReducer, persistStore } from 'redux-persist'
import immutableTransform from 'redux-persist-transform-immutable'
import storage from 'redux-persist/lib/storage'
import createSagaMiddleware from 'redux-saga'

import configuration from '../configuration'
import rootReducer from './reducers'
import rootSaga from './sagas'

const persistConfig = {
  transforms: [immutableTransform()],
  key: 'root',
  storage,
  blacklist: ['app'],
}

function configureStore() {
  const sagaMiddleware = createSagaMiddleware()
  const enhancer = composeWithDevTools(applyMiddleware(sagaMiddleware))
  const combinedReducer = combineReducers(rootReducer)
  const persistedReducer = persistReducer(persistConfig, combinedReducer)
  const store = createStore(persistedReducer, enhancer)
  const persistor = persistStore(store)

  if (!configuration.persistence.enabled) {
    persistor.purge().catch((error) => {
      throw error
    })
  }

  const sagaTask = sagaMiddleware.run(rootSaga)

  return { store, persistor, sagaMiddleware, sagaTask }
}

export default configureStore
