import * as ReduxPersistConstants from 'redux-persist/lib/constants'
import { all, call, put, take } from 'redux-saga/effects'

import App from './App.reducers'

export default class AppSagas {
  static *initialize() {
    yield call(AppSagas.waitForRehydrate)

    yield put(App.actions.setStarted({ started: true }))
  }

  static *waitForRehydrate() {
    yield take(ReduxPersistConstants.REHYDRATE)
  }

  static *getEffects() {
    yield all([
      //
    ])
  }
}
