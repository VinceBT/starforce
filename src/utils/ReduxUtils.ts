import _ from 'lodash'
import { createAction } from 'redux-act'

export function createActions<T extends { [key: string]: Function | null }>(
  prefix: string,
  reducers: T
) {
  return _.mapValues(reducers, (current, key) => {
    const name = `${prefix}: ${key}`
    const reducer = _.isFunction(current) ? current : _.identity
    return createAction(name, reducer)
  }) as Record<keyof T, any>
}
