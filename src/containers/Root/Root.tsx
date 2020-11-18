import './Root.scss'

import keyboardFocus from 'keyboard-focus'
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import Home from '../../screens/Home/Home'

function Root() {
  useEffect(() => {
    keyboardFocus(document)
  }, [])

  return (
    <div className="Root">
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    </div>
  )
}

export default Root
