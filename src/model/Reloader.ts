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

  canTrigger() {
    return this.elapsedAfterTick >= this.reloadTime
  }

  trigger() {
    this.elapsedAfterTick = 0
  }

  getPercent(capped: boolean = true): number {
    const percent = this.elapsedAfterTick / this.reloadTime
    return capped ? Math.min(100, percent) : percent
  }

  reset() {
    if (this.elapsedAfterTick < this.reloadTime) {
      // Nothing, let the tick continue
    } else {
      this.elapsedAfterTick = this.reloadTime
    }
  }
}
