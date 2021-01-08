import { Howl, Howler } from 'howler'

export default class SoundEngine {
  constructor() {
    Howler.volume(1)
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

  explosionSound = new Howl({
    src: [require('../assets/sounds/explosion.mp3').default],
    autoplay: false,
    loop: false,
    volume: 0.1,
  })

  gameoverSound = new Howl({
    src: [require('../assets/sounds/gameover.mp3').default],
    autoplay: false,
    loop: false,
    volume: 0.2,
  })
}
