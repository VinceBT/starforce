export function flattenArray(array: Array<any>) {
  return array.reduce(
    (accumulator: Array<any>, value: any) => accumulator.concat(value),
    []
  )
}

export function filterNullish(array: Array<any>) {
  return array.filter(
    (value: any) => !(typeof value === 'undefined' || value === null)
  )
}
