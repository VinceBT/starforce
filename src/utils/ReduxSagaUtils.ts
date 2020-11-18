import { useCallback, useEffect } from 'react'
import { SagaMiddleware } from 'redux-saga'
import { takeEvery, takeLatest } from 'redux-saga/effects'

export const useSaga = (generator: Function, sagaMiddleware: SagaMiddleware<object>) => {
  useEffect(() => {
    const task = sagaMiddleware.run(function* fn() {
      yield generator()
    })
    return () => {
      task.cancel()
    }
  }, [generator, sagaMiddleware])
}

export const useSagaEffect = (
  effect: Function,
  action: string,
  callback: Function,
  sagaMiddleware: SagaMiddleware<object>
) => {
  const callbackFn = useCallback(
    function* fn() {
      yield effect(action, callback)
    },
    [effect, action, callback]
  )
  useSaga(callbackFn, sagaMiddleware)
}

export const useTakeEvery = (
  action: string,
  callback: Function,
  sagaMiddleware: SagaMiddleware<object>
) => {
  useSagaEffect(takeEvery, action, callback, sagaMiddleware)
}

export const useTakeLatest = (
  action: string,
  callback: Function,
  sagaMiddleware: SagaMiddleware<object>
) => {
  useSagaEffect(takeLatest, action, callback, sagaMiddleware)
}
