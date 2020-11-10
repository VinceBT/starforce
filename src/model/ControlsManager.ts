import { EventEmitter } from 'events'

export enum MouseButtons {
  MOUSE_LEFT = 0,
  MOUSE_WHEEL = 1,
  MOUSE_RIGHT = 2,
}

export enum KeyboardKeycodes {
  KEY_DOWN = 40,
  KEY_UP = 38,
  KEY_LEFT = 37,
  KEY_RIGHT = 39,
  KEY_END = 35,
  KEY_BEGIN = 36,
  KEY_BACK_TAB = 8,
  KEY_TAB = 9,
  KEY_SH_TAB = 16,
  KEY_ENTER = 13,
  KEY_ESC = 27,
  KEY_SPACE = 32,
  KEY_DEL = 46,
  KEY_A = 65,
  KEY_B = 66,
  KEY_C = 67,
  KEY_D = 68,
  KEY_E = 69,
  KEY_F = 70,
  KEY_G = 71,
  KEY_H = 72,
  KEY_I = 73,
  KEY_J = 74,
  KEY_K = 75,
  KEY_L = 76,
  KEY_M = 77,
  KEY_N = 78,
  KEY_O = 79,
  KEY_P = 80,
  KEY_Q = 81,
  KEY_R = 82,
  KEY_S = 83,
  KEY_T = 84,
  KEY_U = 85,
  KEY_V = 86,
  KEY_W = 87,
  KEY_X = 88,
  KEY_Y = 89,
  KEY_Z = 90,
  KEY_PF1 = 112,
  KEY_PF2 = 113,
  KEY_PF3 = 114,
  KEY_PF4 = 115,
  KEY_PF5 = 116,
  KEY_PF6 = 117,
  KEY_PF7 = 118,
  KEY_PF8 = 119,
}

class Control {
  public pressed: boolean = false

  public down(): void {
    this.pressed = true
  }

  public up(): boolean {
    if (this.pressed) {
      this.pressed = false
      return true
    }
    return false
  }
}

export default class ControlsManager extends EventEmitter {
  public readonly mouseControls = new Map<MouseButtons, Control>()

  public readonly keyControls = new Map<KeyboardKeycodes, Control>()

  public controlMouseButton(keyCode: MouseButtons) {
    this.mouseControls.set(keyCode, new Control())
  }

  public controlKeycode(keyCode: KeyboardKeycodes) {
    this.keyControls.set(keyCode, new Control())
  }

  constructor(domElement: HTMLElement) {
    super()

    domElement.addEventListener('contextmenu', (event) => void event.preventDefault(), false)

    domElement.addEventListener(
      'mousedown',
      (event) => {
        if (this.mouseControls.has(event.button)) {
          event.preventDefault()
          this.mouseControls.get(event.button)?.down()
        }
      },
      false
    )

    domElement.addEventListener(
      'mouseup',
      (event) => {
        if (this.mouseControls.has(event.button)) {
          event.preventDefault()
          if (this.mouseControls.get(event.button)?.up()) {
            this.emit(MouseButtons[event.button].toString())
          }
        }
      },
      false
    )

    domElement.addEventListener(
      'keydown',
      (event) => {
        if (this.keyControls.has(event.keyCode)) {
          event.preventDefault()
          this.keyControls.get(event.keyCode)?.down()
        }
      },
      false
    )

    domElement.addEventListener(
      'keyup',
      (event) => {
        if (this.keyControls.has(event.keyCode)) {
          event.preventDefault()
          if (this.keyControls.get(event.keyCode)?.up()) {
            this.emit(KeyboardKeycodes[event.keyCode].toString())
          }
        }
      },
      false
    )

    domElement.addEventListener('wheel', (event) => {
      if (event.deltaY >= 0) {
        console.log('scroll --')
      } else {
        console.log('scroll +++')
      }
    })
  }
}
