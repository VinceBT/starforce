import * as THREE from 'three'

import { PLANE_HALF, PLANE_SIZE, PLANE_STEP } from './Constants'
import Entity, { UpdateOptions } from './Entity'
import GameEngine from './GameEngine'
import Reloader from './Reloader'
import Star from './Star'

class Plane extends Entity {
  public invisiblePlane: THREE.Mesh

  public grid: THREE.LineSegments<THREE.Geometry>

  private starReloader = new Reloader(200)

  constructor(gameEngine: GameEngine) {
    super(gameEngine)

    const invisiblePlaneGeometry = new THREE.PlaneBufferGeometry(
      PLANE_SIZE,
      PLANE_SIZE
    )
    invisiblePlaneGeometry.applyMatrix4(
      new THREE.Matrix4().makeRotationX(-Math.PI / 2)
    )
    this.invisiblePlane = new THREE.Mesh(
      invisiblePlaneGeometry,
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
      })
    )

    this.invisiblePlane.visible = false

    this.add(this.invisiblePlane)

    const gridGeometry = new THREE.Geometry()
    for (let i = -PLANE_HALF; i <= PLANE_HALF; i += PLANE_STEP) {
      gridGeometry.vertices.push(new THREE.Vector3(-PLANE_HALF, -PLANE_STEP, i))
      gridGeometry.vertices.push(new THREE.Vector3(PLANE_HALF, -PLANE_STEP, i))
      gridGeometry.vertices.push(new THREE.Vector3(i, -PLANE_STEP, -PLANE_HALF))
      gridGeometry.vertices.push(new THREE.Vector3(i, -PLANE_STEP, PLANE_HALF))
    }

    this.grid = new THREE.LineSegments(
      gridGeometry,
      new THREE.LineBasicMaterial({
        color: 0xff22ff,
        side: THREE.DoubleSide,
      })
    )

    this.add(this.grid)

    for (let i = 0; i <= 400; i++) {
      new Star(this.gameEngine, { initial: true })
    }

    gameEngine.additionalEntities.push(this)
    gameEngine.scene?.add(this)
  }

  update(options: UpdateOptions) {
    const velocity = new THREE.Vector3(0, 0, 5).multiplyScalar(
      options.speed * this.gameEngine.speed
    )

    this.grid.geometry.verticesNeedUpdate = true

    this.position.add(velocity)
    this.position.z = this.position.z % PLANE_STEP

    if (this.starReloader.tick(options.delta)) {
      new Star(this.gameEngine, { initial: false })
    }

    return true
  }
}

export default Plane
