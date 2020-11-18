import './Home.scss'

import React, { useContext } from 'react'

import Game from '../../components/Game/Game'
import { StoreConfig } from '../../index'
import App from '../../redux/App/App.reducers'
import { useTakeEvery } from '../../utils/ReduxSagaUtils'

function Home() {
  const { sagaMiddleware } = useContext(StoreConfig)

  useTakeEvery(
    App.actions.setStarted.getType(),
    () => {
      console.log('APP IS STARTED')
    },
    sagaMiddleware
  )

  return (
    <div className="Home">
      <Game />
    </div>
  )
}

export default Home
