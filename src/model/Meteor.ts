import CANNON, { ContactEquation } from 'cannon'
import * as THREE from 'three'

import JSONLoader from '../additional/JSONLoader'
import { lerp } from '../utils/MathUtils'
import { randomBetween } from '../utils/NumberUtils'
import { addEuler } from '../utils/ThreeUtils'
import { Collisionable, CollisionableEntity, CollisionBody } from './Collisionable'
import { PLANE_HALF } from './Constants'
import { Glowing, Living } from './Damaging'
import Entity, { EntityOptions, UpdateOptions } from './Entity'
import { createPositionalAudioFactory, playPositionalAudioCopy } from './EntityUtils'
import GameEngine from './GameEngine'
import Reloader from './Reloader'
import Scrap from './Scrap'

export type MeteorOptions = {
  size: number
  rotationSpeed: THREE.Euler
} & EntityOptions

class Meteor extends Entity implements Collisionable, Living, Glowing {
  static meteorGeometry: THREE.Geometry

  private readonly meteorOptions
  private meteorMaterial: THREE.MeshLambertMaterial
  private velocity = new THREE.Vector3()
  private rotationSpeed = new THREE.Euler()
  public life: number
  public maxLife: number
  public damage: number = 1

  collisionBody: CollisionBody
  glowingReloader: Reloader = new Reloader(200, 200)
  invincibleDuringGlow: boolean = false
  explosionPosAudio: THREE.PositionalAudio

  constructor(gameEngine: GameEngine, meteorOptions: MeteorOptions) {
    super(gameEngine)

    this.meteorOptions = meteorOptions

    if (!Meteor.meteorGeometry) {
      // @ts-ignore
      Meteor.meteorGeometry = new JSONLoader().parse(
        require('../assets/objects/meteor.json')
      ).geometry
      Meteor.meteorGeometry.computeBoundingSphere()
      Meteor.meteorGeometry.computeFlatVertexNormals()
    }

    this.meteorMaterial = new THREE.MeshLambertMaterial({
      color: 0x0099ff,
      flatShading: true,
    })

    const meteor = new THREE.Mesh(Meteor.meteorGeometry, this.meteorMaterial)

    this.add(meteor)

    this.maxLife = Math.ceil(meteorOptions.size / 2)
    this.life = this.maxLife
    this.scale.set(meteorOptions.size, meteorOptions.size, meteorOptions.size)

    if (meteorOptions.initialPosition) this.position.copy(meteorOptions.initialPosition)
    if (meteorOptions.initialRotation) this.rotation.copy(meteorOptions.initialRotation)
    if (meteorOptions.initialVelocity) this.velocity.copy(meteorOptions.initialVelocity)
    if (meteorOptions.rotationSpeed) this.rotationSpeed.copy(meteorOptions.rotationSpeed)

    const positionalAudioFactory = createPositionalAudioFactory(
      this,
      this.gameEngine.camera.audioListener
    )

    this.explosionPosAudio = positionalAudioFactory(200, this.gameEngine.soundEngine.explosionSound)

    this.collisionBody = new CollisionBody(this, { mass: 1 })
    this.collisionBody.addShape(
      new CANNON.Sphere((Meteor.meteorGeometry?.boundingSphere?.radius ?? 1) * this.scale.x)
    )
    this.collisionBody.computeAABB()
    this.collisionBody.collisionResponse = false
    this.collisionBody.update()
  }

  collideWith(collisionableEntity: CollisionableEntity, contactEquation: ContactEquation) {
    // Nothing
  }

  takeDamage(damage: number) {
    this.life -= damage
    if (this.life <= 0) {
      this.kill()
      playPositionalAudioCopy(this, this.explosionPosAudio)
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

  update(updateOptions: UpdateOptions) {
    this.position.add(this.velocity.clone().multiplyScalar(updateOptions.speed))
    this.rotation.copy(addEuler(this.rotation, this.rotationSpeed))

    this.collisionBody.update()

    this.glowingReloader.tick(updateOptions.delta)
    this.meteorMaterial.emissive.setRGB(lerp(1, 0, this.glowingReloader.getPercent()), 0, 0)

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
    this.collisionBody.removeBody()
  }
}

export default Meteor
