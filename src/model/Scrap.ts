import * as THREE from 'three'

import scrapImage from '../assets/sprites/scrap.png'
import Entity, { EntityOptions, RotatingSprite, UpdateOptions } from './Entity'
import GameEngine from './GameEngine'

export type ScrapOptions = {
  //
} & EntityOptions

class Scrap extends Entity implements RotatingSprite {
  private readonly scrapOptions

  private velocity = new THREE.Vector3()

  rotationSpeed = 0

  private static maxLife = 15

  private life = Scrap.maxLife

  private static maxScale = 20

  private readonly sprite: THREE.Sprite

  constructor(gameEngine: GameEngine, scrapOptions: ScrapOptions) {
    super(gameEngine)

    this.scrapOptions = scrapOptions

    const map = new THREE.TextureLoader().load(scrapImage)
    const material = new THREE.SpriteMaterial({ map: map })
    this.sprite = new THREE.Sprite(material)

    this.add(this.sprite)

    const scale = Scrap.maxScale
    this.scale.set(scale, scale, scale)

    if (scrapOptions.initialPosition) this.position.copy(scrapOptions.initialPosition)
    if (scrapOptions.initialRotation) this.rotation.copy(scrapOptions.initialRotation)
    if (scrapOptions.initialVelocity) this.velocity.copy(scrapOptions.initialVelocity)

    if (scrapOptions.initialRotationSpeed) this.rotationSpeed = scrapOptions.initialRotationSpeed.z

    this.sprite.material.rotation = this.rotation.z
  }

  update(updateOptions: UpdateOptions) {
    this.position.add(this.velocity.clone().multiplyScalar(updateOptions.speed))

    this.sprite.material.rotation += this.rotationSpeed

    this.life--

    const nextScale = (this.life / Scrap.maxLife) * Scrap.maxScale
    this.scale.set(nextScale, nextScale, nextScale)

    return this.life > 0
  }
}

export default Scrap
