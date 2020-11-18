export function simulateInputTextChange(input: HTMLInputElement, text: string) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  )?.set
  nativeInputValueSetter?.call(input, text)
  const e = new Event('input', { bubbles: true })
  input.dispatchEvent(e)
}
