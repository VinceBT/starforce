import './index.scss'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import Root from './containers/Root/Root'
import TranslationGate from './containers/TranslationGate/TranslationGate'
import configureStore from './redux/configureStore'
import reportWebVitals from './reportWebVitals'

const storeConfig = configureStore()
const { store, persistor } = storeConfig

export const StoreConfig = React.createContext(storeConfig)

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <TranslationGate>
          <StoreConfig.Provider value={storeConfig}>
            <Root />
          </StoreConfig.Provider>
        </TranslationGate>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
