import * as THREE from 'three'

import { EntityOptions } from './Constants'
import Entity, { UpdateOptions } from './Entity'
import GameEngine from './GameEngine'

export type ReactorTrailOptions = {
  //
} & EntityOptions

class ReactorTrail extends Entity {
  private static maxLife = 8

  private life = ReactorTrail.maxLife

  private readonly options: ReactorTrailOptions

  private velocity = new THREE.Vector3()

  constructor(gameEngine: GameEngine, options: ReactorTrailOptions) {
    super(gameEngine)

    this.options = options

    const reactorTrail = new THREE.Mesh(
      new THREE.BoxGeometry(10, 10, 10),
      new THREE.MeshLambertMaterial({
        color: 0x0099ff,
      })
    )

    this.add(reactorTrail)

    if (options.initialPosition) this.position.copy(options.initialPosition)
    if (options.initialRotation) this.rotation.copy(options.initialRotation)
    if (options.initialVelocity) this.velocity.copy(options.initialVelocity)

    gameEngine.additionalEntities.push(this)
    gameEngine.scene?.add(this)
  }

  update(options: UpdateOptions) {
    this.position.add(this.velocity.clone().multiplyScalar(options.speed))

    this.life--

    const nextScale = this.life / ReactorTrail.maxLife
    this.scale.set(nextScale, nextScale, nextScale)

    return this.life > 0
  }
}

export default ReactorTrail
