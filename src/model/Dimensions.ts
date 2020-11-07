export class Dimensions {
  width: number

  height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  static fromDOMElement(domElement: HTMLDivElement) {
    return new Dimensions(domElement.clientWidth, domElement.clientHeight)
  }

  toAspectRatio(): number {
    return this.width / this.height
  }

  toArray(): [number, number] {
    return [this.width, this.height]
  }
}
