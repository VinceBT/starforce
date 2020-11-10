import * as THREE from 'three'

import { EntityOptions, PLANE_HALF, PLANE_SIZE } from '../Constants'
import Entity, { UpdateOptions } from '../Entity'
import GameEngine from '../GameEngine'
import starImage from './star.png'

export type StarOptions = {
  initial: boolean
} & EntityOptions

class Star extends Entity {
  private readonly options

  private velocity = new THREE.Vector3()

  constructor(gameEngine: GameEngine, options: StarOptions) {
    super(gameEngine)

    this.options = options

    const map = new THREE.TextureLoader().load(starImage)
    const material = new THREE.SpriteMaterial({ map: map })
    const sprite = new THREE.Sprite(material)

    this.add(sprite)

    const scale = 20
    this.scale.set(scale, scale, scale)

    const yOffset = PLANE_HALF / 5
    this.position.x = Math.random() * PLANE_SIZE - PLANE_HALF
    this.position.y = -Math.random() * (PLANE_HALF - yOffset) - yOffset
    this.position.z = options.initial
      ? Math.random() * PLANE_SIZE - PLANE_HALF
      : -(PLANE_HALF + Math.random() * PLANE_SIZE - PLANE_HALF)

    this.rotation.x = -Math.PI / 2

    this.velocity = new THREE.Vector3(0, 0, 1 / (Math.abs(this.position.y) / 10000))

    // this.add(star)

    if (options.initialPosition) this.position.copy(options.initialPosition)
    if (options.initialRotation) this.rotation.copy(options.initialRotation)
    if (options.initialVelocity) this.velocity.copy(options.initialVelocity)

    gameEngine.additionalEntities.push(this)
    gameEngine.scene?.add(this)
  }

  update(options: UpdateOptions) {
    this.position.add(this.velocity.clone().multiplyScalar(options.speed))

    if (
      Math.abs(this.position.x) >= PLANE_HALF ||
      Math.abs(this.position.y) >= PLANE_HALF ||
      this.position.z >= 5000
    ) {
      return false
    }
    return true
  }
}

export default Star
