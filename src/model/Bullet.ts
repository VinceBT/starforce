import CANNON, { ContactEquation } from 'cannon'
import * as THREE from 'three'

import { Collisionable, CollisionableEntity, CollisionBody } from './Collisionable'
import { PLANE_HALF } from './Constants'
import { Damaging } from './Damaging'
import Entity, { EntityOptions, Moving, UpdateOptions } from './Entity'
import GameEngine from './GameEngine'
import Meteor from './Meteor'

export type BulletOptions = {
  damage: number
} & EntityOptions

class Bullet extends Entity implements Moving, Collisionable, Damaging {
  static bulletGeometry: THREE.Geometry

  static bulletMaterial: THREE.Material

  public velocity = new THREE.Vector3()

  public collisionBody: CollisionBody

  public damage: number

  constructor(gameEngine: GameEngine, bulletOptions: BulletOptions) {
    super(gameEngine)

    this.damage = bulletOptions.damage

    if (!Bullet.bulletGeometry) {
      Bullet.bulletGeometry = new THREE.BoxGeometry(8, 8, 30)
      Bullet.bulletGeometry.computeBoundingSphere()
      Bullet.bulletGeometry.computeFlatVertexNormals()
    }

    if (!Bullet.bulletMaterial) {
      Bullet.bulletMaterial = new THREE.MeshLambertMaterial({
        color: 0x88ff88,
        flatShading: true,
      })
    }

    const bulletGeometry = new THREE.BoxGeometry(8, 8, 30)
    bulletGeometry.computeBoundingSphere()
    bulletGeometry.computeFlatVertexNormals()

    const bullet = new THREE.Mesh(Bullet.bulletGeometry, Bullet.bulletMaterial)

    this.add(bullet)

    if (bulletOptions.initialPosition) this.position.copy(bulletOptions.initialPosition)
    if (bulletOptions.initialRotation) this.rotation.copy(bulletOptions.initialRotation)
    if (bulletOptions.initialVelocity) this.velocity.copy(bulletOptions.initialVelocity)

    this.collisionBody = new CollisionBody(this, { mass: 1 })
    this.collisionBody.addShape(
      new CANNON.Sphere((bulletGeometry?.boundingSphere?.radius ?? 1) * this.scale.x)
    )
    this.collisionBody.computeAABB()
    this.collisionBody.collisionResponse = false
    this.collisionBody.update()
  }

  collideWith(collisionableEntity: CollisionableEntity, contactEquation: ContactEquation) {
    if (collisionableEntity instanceof Meteor) {
      const meteor = collisionableEntity as Meteor
      this.kill()
      meteor.takeDamage(this.damage)
    }
  }

  update(updateOptions: UpdateOptions) {
    this.position.add(this.velocity.clone().multiplyScalar(updateOptions.speed))
    this.collisionBody.update()

    if (
      Math.abs(this.position.x) >= PLANE_HALF ||
      Math.abs(this.position.y) >= PLANE_HALF ||
      Math.abs(this.position.z) >= PLANE_HALF
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

export default Bullet
