import { Howl, Howler } from 'howler'
import * as THREE from 'three'

export default class SoundEngine {
  audioLoader = new THREE.AudioLoader()

  constructor() {
    Howler.volume(1)
  }

  shieldSound?: AudioBuffer
  laserSound?: AudioBuffer
  explosionSound?: AudioBuffer

  async loadAll() {
    return Promise.all([
      (async () =>
        (this.shieldSound = await this.load(require('../assets/sounds/shield.mp3').default)))(),
      (async () =>
        (this.laserSound = await this.load(require('../assets/sounds/laser.mp3').default)))(),
      (async () =>
        (this.explosionSound = await this.load(
          require('../assets/sounds/explosion.mp3').default
        )))(),
    ])
  }

  load(source: string): Promise<AudioBuffer> {
    return new Promise((resolve) => {
      this.audioLoader.load(source, (buffer) => {
        resolve(buffer)
      })
    })
  }

  welcomeSound = new Howl({
    src: [require('../assets/sounds/welcome.mp3').default],
    autoplay: false,
    loop: false,
    volume: 0.5,
  })

  goSound = new Howl({
    src: [require('../assets/sounds/go.mp3').default],
    autoplay: false,
    loop: false,
    volume: 0.3,
  })

  gameoverSound = new Howl({
    src: [require('../assets/sounds/gameover.mp3').default],
    autoplay: false,
    loop: false,
    volume: 0.2,
  })
}
