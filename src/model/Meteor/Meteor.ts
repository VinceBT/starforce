import * as THREE from 'three'

import JSONLoader from '../../additional/JSONLoader'
import { addEuler } from '../../utils/ThreeUtils'
import { EntityOptions, PLANE_HALF } from '../Constants'
import Entity, { UpdateOptions } from '../Entity'
import GameEngine from '../GameEngine'

export type MeteorOptions = {
  size: number
  rotationSpeed: THREE.Euler
} & EntityOptions

class Meteor extends Entity {
  private readonly options

  private velocity = new THREE.Vector3()

  private rotationSpeed = new THREE.Euler()

  private hitpoints: number

  private damage: number

  static meteorGeometry: THREE.Geometry

  static meteorMaterial: THREE.Material

  constructor(gameEngine: GameEngine, options: MeteorOptions) {
    super(gameEngine)

    this.options = options

    if (!Meteor.meteorGeometry) {
      // @ts-ignore
      Meteor.meteorGeometry = new JSONLoader().parse(require('./meteor.json')).geometry
      Meteor.meteorGeometry.computeBoundingSphere()
      Meteor.meteorGeometry.computeFlatVertexNormals()
    }

    if (!Meteor.meteorMaterial) {
      Meteor.meteorMaterial = new THREE.MeshLambertMaterial({
        color: 0x0099ff,
        flatShading: true,
      })
    }

    const meteor = new THREE.Mesh(Meteor.meteorGeometry, Meteor.meteorMaterial)

    this.add(meteor)

    this.hitpoints = Math.ceil(options.size / 2)
    this.damage = Math.ceil(options.size / 5)
    this.scale.set(options.size, options.size, options.size)

    if (options.initialPosition) this.position.copy(options.initialPosition)
    if (options.initialRotation) this.rotation.copy(options.initialRotation)
    if (options.initialVelocity) this.velocity.copy(options.initialVelocity)
    if (options.rotationSpeed) this.rotationSpeed.copy(options.rotationSpeed)

    gameEngine.additionalEntities.push(this)
    gameEngine.scene?.add(this)
  }

  update(updateOptions: UpdateOptions) {
    this.position.add(this.velocity.clone().multiplyScalar(updateOptions.speed))

    if (this.rotationSpeed) this.rotation.copy(addEuler(this.rotation, this.rotationSpeed))

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

export default Meteor
