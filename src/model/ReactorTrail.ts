import * as THREE from 'three'

import { Living } from './Damaging'
import Entity, { EntityOptions, UpdateOptions } from './Entity'
import GameEngine from './GameEngine'

export type ReactorTrailOptions = {
  //
} & EntityOptions

class ReactorTrail extends Entity implements Living {
  static reactorTrailGeometry: THREE.Geometry

  static reactorTrailMaterial: THREE.Material

  maxLife = 15

  life = this.maxLife

  velocity = new THREE.Vector3()

  takeDamage(damage: number) {
    this.life -= damage
    if (this.life <= 0) {
      this.kill()
    }
  }

  constructor(gameEngine: GameEngine, reactorTrailOptions: ReactorTrailOptions) {
    super(gameEngine)

    if (!ReactorTrail.reactorTrailGeometry) {
      ReactorTrail.reactorTrailGeometry = new THREE.BoxGeometry(10, 10, 10)
      ReactorTrail.reactorTrailGeometry.computeBoundingSphere()
      ReactorTrail.reactorTrailGeometry.computeFlatVertexNormals()
    }

    if (!ReactorTrail.reactorTrailMaterial) {
      ReactorTrail.reactorTrailMaterial = new THREE.MeshLambertMaterial({
        color: 0x0099ff,
        flatShading: true,
      })
    }

    const reactorTrail = new THREE.Mesh(
      ReactorTrail.reactorTrailGeometry,
      ReactorTrail.reactorTrailMaterial
    )

    this.add(reactorTrail)

    if (reactorTrailOptions.initialPosition) this.position.copy(reactorTrailOptions.initialPosition)
    if (reactorTrailOptions.initialRotation) this.rotation.copy(reactorTrailOptions.initialRotation)
    if (reactorTrailOptions.initialVelocity) this.velocity.copy(reactorTrailOptions.initialVelocity)
  }

  update(updateOptions: UpdateOptions) {
    this.position.add(this.velocity.clone().multiplyScalar(updateOptions.speed))

    this.takeDamage(1)

    const nextScale = this.life / this.maxLife
    this.scale.set(nextScale, nextScale, nextScale)

    return super.update(updateOptions)
  }

  kill() {
    super.kill()
  }
}

export default ReactorTrail
