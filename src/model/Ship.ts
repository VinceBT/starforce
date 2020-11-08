import { clamp } from 'lodash'
import * as THREE from 'three'

import JSONLoader from '../additional/JSONLoader'
import THREEx from '../additional/THREEx'
import Bullet from './Bullet'
import { PLANE_QUARTER } from './Constants'
import { MouseButtons } from './ControlsManager'
import Entity, { UpdateOptions } from './Entity'
import GameEngine from './GameEngine'
import ReactorTrail from './ReactorTrail'
import Reloader from './Reloader'

class Ship extends Entity {
  private fireReloader = new Reloader(150)

  private reactorReloader = new Reloader(80)

  private shipScale = 6

  private ship: THREE.Mesh

  constructor(gameEngine: GameEngine) {
    super(gameEngine)

    const loader = new JSONLoader()
    // @ts-ignore
    const { geometry: shipGeometry } = loader.parse(
      require('../assets/objects/ship.json')
    )
    this.ship = new THREE.Mesh(
      shipGeometry,
      new THREE.MeshLambertMaterial({
        color: 0x0099ff,
        flatShading: true,
      })
    )

    this.gameEngine.outlinePass.selectedObjects = [this.ship]

    this.scale.set(this.shipScale, this.shipScale, this.shipScale)

    const barrier = new THREE.Mesh(
      new THREE.SphereGeometry(15, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xff22ff,
        opacity: 0.1,
        transparent: true,
      })
    )

    barrier.position.z = -3
    this.add(barrier)

    // Keep at the end
    shipGeometry.computeBoundingSphere()
    shipGeometry.computeFlatVertexNormals()

    this.add(this.ship)

    gameEngine.additionalEntities.push(this)
    gameEngine.scene?.add(this)
  }

  private moveShip(options: UpdateOptions): void {
    const raycaster = new THREE.Raycaster()

    raycaster.setFromCamera(
      this.gameEngine.mouse,
      this.gameEngine.camera.perspectiveCamera
    )
    const intersects = raycaster.intersectObject(
      this.gameEngine.plane.invisiblePlane
    )
    if (intersects.length > 0) {
      const intersect = intersects[0]
      const scalar =
        this.position.distanceTo(intersect.point) * 0.2 * options.speed
      const velocity = this.position
        .clone()
        .sub(intersect.point)
        .normalize()
        .multiplyScalar(-scalar)

      this.rotation.z = -velocity.x * Math.PI * 0.006
      this.rotation.z = clamp(this.rotation.z, -Math.PI / 4, Math.PI / 4)
      this.position.add(velocity)

      this.position.x = clamp(this.position.x, -PLANE_QUARTER, PLANE_QUARTER)
      this.position.y = clamp(this.position.y, -PLANE_QUARTER, PLANE_QUARTER)
      this.position.z = clamp(this.position.z, -PLANE_QUARTER, PLANE_QUARTER)
    }
  }

  private fireWeapons(options: UpdateOptions): Entity[] | null {
    if (
      this.gameEngine.controlsManager?.mouseControls.get(
        MouseButtons.MOUSE_LEFT
      )?.pressed &&
      this.fireReloader.tick(options.delta)
    ) {
      return [-1, 1].map((i) => {
        const offset = 2
        return new Bullet(this.gameEngine, {
          damage: 2,
          initialVelocity: new THREE.Vector3(i * offset, 0, -50),
          // TODO put rotation in Bullet update method
          initialPosition: this.position
            .clone()
            .add(
              new THREE.Vector3(i * 5, 0, -13).multiplyScalar(this.shipScale)
            ),
          initialRotation: new THREE.Euler(0, Math.tan(i * -offset * 0.02), 0),
        })
      })
    }
    return null
  }

  private emitMotorRadiation(options: UpdateOptions): Entity | null {
    if (this.reactorReloader.tick(options.delta)) {
      return new ReactorTrail(this.gameEngine, {
        initialVelocity: new THREE.Vector3(0, 0, 5).multiplyScalar(
          this.gameEngine.speed * 0.15 + 1
        ),
        initialPosition: this.position
          .clone()
          .add(new THREE.Vector3(0, 0, 8).multiplyScalar(this.shipScale)),
      })
    }
    return null
  }

  update(options: UpdateOptions) {
    this.moveShip(options)

    this.gameEngine.additionalEntities.push(this.fireWeapons(options))
    this.gameEngine.additionalEntities.push(this.emitMotorRadiation(options))

    return true
  }
}

export default Ship
