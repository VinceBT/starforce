import * as THREE from 'three'

import { EntityOptions, PLANE_HALF } from './Constants'
import Entity, { UpdateOptions } from './Entity'
import GameEngine from './GameEngine'

export type BulletOptions = {
  damage: number
} & EntityOptions

class Bullet extends Entity {
  private readonly options

  private velocity = new THREE.Vector3()

  constructor(gameEngine: GameEngine, options: BulletOptions) {
    super(gameEngine)

    this.options = options

    const bulletGeometry = new THREE.BoxGeometry(8, 8, 30)
    bulletGeometry.computeBoundingSphere()
    bulletGeometry.computeFlatVertexNormals()

    const bullet = new THREE.Mesh(
      bulletGeometry,
      new THREE.MeshLambertMaterial({
        color: 0x88ff88,
        flatShading: true,
      })
    )

    this.add(bullet)

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
      Math.abs(this.position.z) >= PLANE_HALF
    ) {
      return false
    }
    return true
  }
}

export default Bullet
