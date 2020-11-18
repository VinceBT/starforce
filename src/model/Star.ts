import * as THREE from 'three'

import starImage from '../assets/sprites/star.png'
import { range } from '../utils/MathUtils'
import { randomBetween } from '../utils/NumberUtils'
import { addEuler } from '../utils/ThreeUtils'
import { PLANE_HALF, PLANE_SIZE } from './Constants'
import Entity, { EntityOptions, UpdateOptions } from './Entity'
import GameEngine from './GameEngine'

export type StarOptions = {
  initial: boolean
} & EntityOptions

class Star extends Entity {
  private readonly starOptions

  private velocity = new THREE.Vector3()

  private rotationSpeed = new THREE.Euler()

  private static maxScale = 30

  private rotationPhase = Math.random() * Math.PI * 2

  private sprite: THREE.Sprite

  constructor(gameEngine: GameEngine, starOptions: StarOptions) {
    super(gameEngine)

    this.starOptions = starOptions

    const map = new THREE.TextureLoader().load(starImage)
    const material = new THREE.SpriteMaterial({ map: map })
    this.sprite = new THREE.Sprite(material)

    this.add(this.sprite)

    this.scale.set(0, 0, 0)

    const yOffset = PLANE_HALF / 5
    this.position.x = Math.random() * PLANE_SIZE - PLANE_HALF
    this.position.y = -Math.random() * (PLANE_HALF - yOffset) - yOffset
    this.position.z = starOptions.initial
      ? Math.random() * PLANE_SIZE - PLANE_HALF
      : -(PLANE_HALF + Math.random() * PLANE_SIZE - PLANE_HALF)

    this.rotation.x = -Math.PI / 2

    this.velocity = new THREE.Vector3(0, 0, 1 / (Math.abs(this.position.y) / 10000))

    this.rotation.copy(
      new THREE.Euler(
        randomBetween(0, Math.PI * 2),
        randomBetween(0, Math.PI * 2),
        randomBetween(0, Math.PI * 2)
      )
    )

    this.rotationSpeed = new THREE.Euler(
      randomBetween(-5e-2, 5e-2),
      randomBetween(-5e-2, 5e-2),
      randomBetween(-5e-2, 5e-2)
    )

    if (starOptions.initialPosition) this.position.copy(starOptions.initialPosition)
    if (starOptions.initialVelocity) this.velocity.copy(starOptions.initialVelocity)
    if (starOptions.initialRotation) this.rotation.copy(starOptions.initialRotation)
    if (starOptions.initialRotationSpeed) this.rotationSpeed.copy(starOptions.initialRotationSpeed)
  }

  update(updateOptions: UpdateOptions) {
    this.position.add(this.velocity.clone().multiplyScalar(updateOptions.speed))
    this.rotation.copy(addEuler(this.rotation, this.rotationSpeed))

    this.sprite.material.rotation = this.rotation.z

    const nextScale = range(
      -1,
      1,
      5,
      Star.maxScale,
      Math.sin(updateOptions.elapsed + this.rotationPhase)
    )
    this.scale.set(nextScale, nextScale, nextScale)

    if (
      Math.abs(this.position.x) >= PLANE_HALF ||
      Math.abs(this.position.y) >= PLANE_HALF ||
      this.position.z >= 5000
    ) {
      return false
    }
    return super.update(updateOptions)
  }

  kill() {
    super.kill()
  }
}

export default Star
