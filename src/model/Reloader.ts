export default class Reloader {
  public reloadTime: number

  public elapsedAfterTick: number

  constructor(reloadTime: number = 100, initialDelta: number = 0) {
    this.reloadTime = reloadTime
    this.elapsedAfterTick = initialDelta
  }

  tick(delta: number) {
    this.elapsedAfterTick += delta
  }

  canShoot() {
    return this.elapsedAfterTick >= this.reloadTime
  }

  shoot() {
    this.elapsedAfterTick = 0
  }

  reset() {
    if (this.elapsedAfterTick < this.reloadTime) {
      // Nothing, let the tick continue
    } else {
      this.elapsedAfterTick = this.reloadTime
    }
  }
}
