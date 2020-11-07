export default class Reloader {
  public reloadTime: number

  public elapsedAfterTick: number

  constructor(reloadTime: number = 100, initialDelta: number = 0) {
    this.reloadTime = reloadTime
    this.elapsedAfterTick = initialDelta
  }

  tick(delta: number): boolean {
    this.elapsedAfterTick += delta
    if (this.elapsedAfterTick > this.reloadTime) {
      this.elapsedAfterTick = this.elapsedAfterTick - this.reloadTime
      return true
    }
    return false
  }
}
