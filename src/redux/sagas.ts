import { all, call } from 'redux-saga/effects'

import AppSagas from './App/App.sagas'

const sagas = [
  // List all sagas here
  AppSagas,
]

export default function* rootSaga() {
  yield all(sagas.map((entity) => entity.getEffects()))
  yield call(AppSagas.initialize)
}
