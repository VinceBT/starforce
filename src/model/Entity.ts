import * as THREE from 'three'

import GameEngine from './GameEngine'

export type EntityOptions = {
  initialVelocity?: THREE.Vector3
  initialPosition?: THREE.Vector3
  initialRotation?: THREE.Euler
  initialRotationSpeed?: THREE.Euler
}

export type UpdateOptions = {
  elapsed: number
  delta: number
  speed: number
}

export interface Updatable {
  gameEngine: GameEngine

  update(updateOptions: UpdateOptions): boolean

  kill?(): void
}

export default class Entity extends THREE.Group implements Updatable {
  gameEngine: GameEngine

  constructor(gameEngine: GameEngine) {
    super()
    this.gameEngine = gameEngine
    this.gameEngine.scene?.add(this)
    this.gameEngine.additionalEntities.push(this)
  }

  update(_options: UpdateOptions): boolean {
    return true
  }

  kill() {
    this.gameEngine.scene?.remove(this)
    this.gameEngine.removalEntities.push(this)
  }
}

export interface Moving {
  velocity: THREE.Vector3
}

export interface Rotating {
  rotationSpeed: THREE.Euler
}

export interface RotatingSprite {
  rotationSpeed: number
}
