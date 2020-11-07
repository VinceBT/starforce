import * as THREE from 'three'

import GameEngine from './GameEngine'

export type UpdateOptions = {
  elapsed: number
  delta: number
  speed: number
}

export interface Updatable {
  gameEngine: GameEngine

  shouldUpdate?: boolean

  updateOnlyOnce?: boolean

  update(options: UpdateOptions): boolean

  kill?(): void
}

export default class Entity extends THREE.Group implements Updatable {
  gameEngine: GameEngine

  shouldUpdate = true

  updateOnlyOnce = false

  constructor(gameEngine: GameEngine) {
    super()
    this.gameEngine = gameEngine
  }

  update(options: UpdateOptions): boolean {
    return true
  }

  kill() {
    this.gameEngine.scene?.remove(this)
  }
}
