import CANNON from 'cannon'
import { clamp } from 'lodash'
import * as THREE from 'three'
import { Vector3 } from 'three'

import JSONLoader from '../additional/JSONLoader'
import { lerp } from '../utils/MathUtils'
import { randomBetween } from '../utils/NumberUtils'
import Bullet from './Bullet'
import { Collisionable, CollisionableEntity, CollisionBody } from './Collisionable'
import { PLANE_QUARTER } from './Constants'
import { MouseButtons } from './ControlsManager'
import { Damaging, Glowing, Living } from './Damaging'
import Entity, { Moving, UpdateOptions } from './Entity'
import { createPositionalAudioFactory, playPositionalAudioCopy } from './EntityUtils'
import GameEngine, { GameEngineEvents } from './GameEngine'
import Meteor from './Meteor'
import ReactorTrail from './ReactorTrail'
import Reloader from './Reloader'
import Scrap from './Scrap'

class Ship extends Entity implements Moving, Collisionable, Damaging, Living, Glowing {
  private fireReloader = new Reloader(100)
  private reactorReloader = new Reloader(80)
  private shipScale = 6
  private ship: THREE.Mesh<THREE.Geometry, THREE.MeshLambertMaterial>
  private barrier: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
  private barrierMaxOpacity = 0.1

  isUsingBarrier = false
  glowingReloader: Reloader = new Reloader(1000, 1000)
  invincibleDuringGlow: boolean = true
  collisionBody: CollisionBody
  damage = 10
  maxLife = 3
  life = this.maxLife
  velocity: Vector3 = new THREE.Vector3()
  laserPosAudio: THREE.PositionalAudio
  barrierPosAudio: THREE.PositionalAudio

  constructor(gameEngine: GameEngine) {
    super(gameEngine)

    const loader = new JSONLoader()
    // @ts-ignore
    const { geometry: shipGeometry } = loader.parse(require('../assets/objects/ship.json'))
    shipGeometry.computeBoundingSphere()
    shipGeometry.computeFlatVertexNormals()

    this.ship = new THREE.Mesh(
      shipGeometry,
      new THREE.MeshLambertMaterial({
        color: 0x0099ff,
        flatShading: true,
      })
    )

    this.gameEngine.outlinePass.selectedObjects = [this.ship]

    this.scale.set(this.shipScale, this.shipScale, this.shipScale)

    const positionalAudioFactory = createPositionalAudioFactory(
      this,
      this.gameEngine.camera.audioListener
    )

    this.laserPosAudio = positionalAudioFactory(400, this.gameEngine.soundEngine.laserSound)
    this.barrierPosAudio = positionalAudioFactory(250, this.gameEngine.soundEngine.shieldSound)

    this.barrier = new THREE.Mesh(
      new THREE.SphereGeometry(15, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xff22ff,
        opacity: 0,
        transparent: true,
      })
    )

    this.barrier.position.z = -3
    this.add(this.barrier)
    this.add(this.ship)

    this.collisionBody = new CollisionBody(this, { mass: 1 })
    this.collisionBody.addShape(
      new CANNON.Sphere((shipGeometry?.boundingSphere?.radius ?? 1) * this.scale.x)
    )
    this.collisionBody.computeAABB()
    this.collisionBody.collisionResponse = false
    this.collisionBody.update()
  }

  collideWith(
    collisionableEntity: CollisionableEntity,
    contactEquation: CANNON.ContactEquation
  ): void {
    if (collisionableEntity instanceof Meteor) {
      if (this.glowingReloader.canTrigger()) {
        const meteor = collisionableEntity as Meteor
        meteor.takeDamage(this.damage)
        this.takeDamage(meteor.damage)
      }
    }
  }

  takeDamage(damage: number) {
    if (this.isUsingBarrier) {
      console.log('damage tanked', damage)
    } else {
      this.life -= damage
      if (this.life <= 0) {
        this.kill()
        this.gameEngine.emit(GameEngineEvents.DEATH)
        setTimeout(() => {
          this.gameEngine.soundEngine.gameoverSound.play()
        }, 600)
        for (let i = 0; i < 4; i++) {
          new Scrap(this.gameEngine, {
            initialPosition: this.position,
            initialVelocity: new THREE.Vector3(
              Math.random() * 20 - 10,
              Math.random() * 20 - 10,
              Math.random() * 20 - 10
            ),
            initialRotation: new THREE.Euler(
              randomBetween(0, Math.PI * 2),
              randomBetween(0, Math.PI * 2),
              randomBetween(0, Math.PI * 2)
            ),
            initialRotationSpeed: new THREE.Euler(
              randomBetween(-1e-2, 1e-2),
              randomBetween(-1e-2, 1e-2),
              randomBetween(-1e-2, 1e-2)
            ),
          })
        }
      } else {
        this.glowingReloader.trigger()
      }
    }
  }

  private moveShip(updateOptions: UpdateOptions): void {
    const raycaster = new THREE.Raycaster()

    raycaster.setFromCamera(this.gameEngine.mouse, this.gameEngine.camera.perspectiveCamera)
    const intersects = raycaster.intersectObject(this.gameEngine.plane.invisiblePlane)
    if (intersects.length > 0) {
      const intersect = intersects[0]
      const scalar = this.position.distanceTo(intersect.point) * 0.2
      this.velocity = this.position.clone().sub(intersect.point).normalize().multiplyScalar(-scalar)

      this.rotation.z = -this.velocity.x * Math.PI * 0.006
      this.rotation.z = clamp(this.rotation.z, -Math.PI / 4, Math.PI / 4)

      this.position.x = clamp(this.position.x, -PLANE_QUARTER, PLANE_QUARTER)
      this.position.y = clamp(this.position.y, -PLANE_QUARTER, PLANE_QUARTER)
      this.position.z = clamp(this.position.z, -PLANE_QUARTER, PLANE_QUARTER)
    } else {
      this.velocity.multiplyScalar(0.2)
    }

    this.position.add(this.velocity.clone().multiplyScalar(updateOptions.speed))

    this.collisionBody.update()
  }

  private fireWeapons(updateOptions: UpdateOptions): Entity[] | null {
    this.fireReloader.tick(updateOptions.delta)
    if (this.gameEngine.controlsManager?.mouseControls.get(MouseButtons.MOUSE_LEFT)?.pressed) {
      if (this.fireReloader.canTrigger()) {
        this.fireReloader.trigger()

        playPositionalAudioCopy(this, this.laserPosAudio)

        return [-1, 1].map((i) => {
          return new Bullet(this.gameEngine, {
            damage: 2,
            initialVelocity: new THREE.Vector3(i * 2, 0, -30),
            initialPosition: this.position
              .clone()
              .add(new THREE.Vector3(i * 5, 0, -13).multiplyScalar(this.shipScale)),
          })
        })
      }
    } else this.fireReloader.reset()
    return null
  }

  private emitMotorRadiation(updateOptions: UpdateOptions): Entity | null {
    this.reactorReloader.tick(updateOptions.delta)
    if (this.reactorReloader.canTrigger()) {
      this.reactorReloader.trigger()
      return new ReactorTrail(this.gameEngine, {
        initialVelocity: new THREE.Vector3(0, 0, 5).multiplyScalar(this.gameEngine.speed * 0.8),
        initialPosition: this.position
          .clone()
          .add(new THREE.Vector3(0, 0, 8).multiplyScalar(this.shipScale)),
      })
    } else {
      this.reactorReloader.reset()
    }
    return null
  }

  update(updateOptions: UpdateOptions) {
    this.moveShip(updateOptions)

    // Glowing update
    this.glowingReloader.tick(updateOptions.delta)
    this.ship.material.emissive.setRGB(lerp(1, 0, this.glowingReloader.getPercent()), 0, 0)

    // Barrier update
    this.isUsingBarrier =
      this.gameEngine.controlsManager?.mouseControls.get(MouseButtons.MOUSE_RIGHT)?.pressed ?? false
    if (this.isUsingBarrier) {
      if (!this.barrierPosAudio.isPlaying) {
        this.barrierPosAudio.play()
      }
      this.barrier.material.opacity = Math.min(
        this.barrierMaxOpacity,
        this.barrier.material.opacity + 0.03
      )
    } else {
      if (this.barrierPosAudio.isPlaying) {
        this.barrierPosAudio.stop()
      }
      this.barrier.material.opacity *= 0.55
    }

    this.gameEngine.additionalEntities.push(this.fireWeapons(updateOptions))
    this.gameEngine.additionalEntities.push(this.emitMotorRadiation(updateOptions))

    return super.update(updateOptions)
  }

  kill() {
    super.kill()
    this.collisionBody.removeBody()
  }
}

export default Ship
