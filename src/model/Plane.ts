import * as THREE from 'three'

import { randomBetween } from '../utils/NumberUtils'
import { PLANE_HALF, PLANE_SIZE, PLANE_STEP } from './Constants'
import Entity, { UpdateOptions } from './Entity'
import GameEngine from './GameEngine'
import Meteor from './Meteor/Meteor'
import Reloader from './Reloader'
import Star from './Star/Star'

export enum Cardinals {
  NORTH,
  WEST,
  EAST,
  SOUTH,
}

const CornersMap = new Map<Cardinals, THREE.Vector2>([
  [Cardinals.NORTH, new THREE.Vector2(0, 1)],
  [Cardinals.WEST, new THREE.Vector2(-1, 0)],
  [Cardinals.EAST, new THREE.Vector2(1, 0)],
  [Cardinals.SOUTH, new THREE.Vector2(0, -1)],
])

class Plane extends Entity {
  public invisiblePlane: THREE.Mesh

  public grid: THREE.LineSegments<THREE.Geometry>

  private starReloader = new Reloader(200)

  private meteorReloader = new Reloader(1500)

  boundsMap = new Map<Cardinals, THREE.Vector3 | null>([
    [Cardinals.NORTH, null],
    [Cardinals.WEST, null],
    [Cardinals.EAST, null],
    [Cardinals.SOUTH, null],
  ])

  constructor(gameEngine: GameEngine) {
    super(gameEngine)

    const invisiblePlaneGeometry = new THREE.PlaneBufferGeometry(PLANE_SIZE, PLANE_SIZE)
    invisiblePlaneGeometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2))
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

    for (let i = 0; i <= 300; i++) {
      new Star(this.gameEngine, { initial: true })
    }

    gameEngine.additionalEntities.push(this)
    gameEngine.scene?.add(this)
  }

  update(options: UpdateOptions) {
    const velocity = new THREE.Vector3(0, 0, 5).multiplyScalar(
      options.speed * this.gameEngine.speed
    )

    this.position.add(velocity)
    this.position.z = this.position.z % PLANE_STEP

    this.starReloader.tick(options.delta)
    if (this.starReloader.canShoot()) {
      this.starReloader.shoot()
      new Star(this.gameEngine, { initial: false })
    }

    this.meteorReloader.tick(options.delta)
    if (this.meteorReloader.canShoot()) {
      this.meteorReloader.shoot()

      const west = this.boundsMap.get(Cardinals.WEST)
      const north = this.boundsMap.get(Cardinals.NORTH)
      const east = this.boundsMap.get(Cardinals.EAST)
      if (west && north && east) {
        new Meteor(this.gameEngine, {
          size: Math.floor(randomBetween(3, 10)),
          initialVelocity: new THREE.Vector3(randomBetween(-0.5, 0.5), 0, randomBetween(1, 5)),
          initialPosition: this.position
            .clone()
            .add(new THREE.Vector3(randomBetween(west.x, east.x), 0, north.z - 200)),
          initialRotation: new THREE.Euler(
            randomBetween(0, Math.PI * 2),
            randomBetween(0, Math.PI * 2),
            randomBetween(0, Math.PI * 2)
          ),
          rotationSpeed: new THREE.Euler(
            randomBetween(-1e-2, 1e-2),
            randomBetween(-1e-2, 1e-2),
            randomBetween(-1e-2, 1e-2)
          ),
        })
      }
    }

    const raycaster = new THREE.Raycaster()

    for (const cornerKey of CornersMap.keys()) {
      const corner = CornersMap.get(cornerKey)
      if (!corner) continue
      raycaster.setFromCamera(
        corner.clone().rotateAround(new THREE.Vector2(), -this.gameEngine.camera.rotation.z),
        this.gameEngine.camera.perspectiveCamera
      )
      const intersects = raycaster.intersectObject(this.invisiblePlane)
      if (intersects.length > 0) {
        const intersect = intersects[0]
        this.boundsMap.set(cornerKey, intersect.point)
      } else {
        this.boundsMap.set(cornerKey, null)
      }
    }

    return true
  }
}

export default Plane
