import CANNON, { ContactEquation, IBodyOptions } from 'cannon'

import { copyTHREEToCANNON } from '../utils/CannonUtils'
import Entity from './Entity'

export type CollisionableEntity = Entity & Collisionable

export class CollisionBody extends CANNON.Body {
  collisionableEntity: CollisionableEntity

  constructor(collisionableEntity: CollisionableEntity, options?: IBodyOptions) {
    super(options)
    this.collisionableEntity = collisionableEntity
    this.collisionableEntity.gameEngine.world.addBody(this)
  }

  removeBody() {
    this.collisionableEntity.gameEngine.world.remove(this)
  }

  update() {
    copyTHREEToCANNON(this.collisionableEntity, this)
  }

  kill() {
    this.collisionableEntity.kill()
  }
}

export interface Collisionable {
  collisionBody: CollisionBody

  collideWith(collisionableEntity: CollisionableEntity, contactEquation: ContactEquation): void
}
