import React from 'react'

export const bindClickOnEnter = (e: React.KeyboardEvent<HTMLDivElement>) => {
  const event = e || window.event
  const charCode = event.which || event.keyCode

  if (charCode.toString() === '13') {
    event.preventDefault()
    // @ts-ignore
    event.target.click()
  }
}

export const bindCallbackOnEnter = (callback: Function) => (
  e: React.KeyboardEvent<HTMLDivElement>
) => {
  const event = e || window.event
  const charCode = event.which || event.keyCode

  if (charCode.toString() === '13') {
    event.preventDefault()
    callback()
    return false
  }
}
