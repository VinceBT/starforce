import gsap from 'gsap'
import * as THREE from 'three'

import { vector3ToObject } from '../utils/ThreeUtils'
import { Dimensions } from './Dimensions'
import Entity, { UpdateOptions } from './Entity'
import GameEngine from './GameEngine'

type CameraSet = {
  position: THREE.Vector3
  rotation: THREE.Euler
}

export enum CameraSettings {
  STANDARD,
  SIDE,
  UPFRONT,
}

const CameraSettingsLookup: { [key in CameraSettings]: CameraSet } = {
  [CameraSettings.STANDARD]: {
    position: new THREE.Vector3(0, 1100, 0),
    rotation: new THREE.Euler(-Math.PI / 3, 0, 0),
  },
  [CameraSettings.SIDE]: {
    position: new THREE.Vector3(0, 1500, 0),
    rotation: new THREE.Euler(-Math.PI / 2, 0, Math.PI / 2),
  },
  [CameraSettings.UPFRONT]: {
    position: new THREE.Vector3(0, 500, 1500),
    rotation: new THREE.Euler(-Math.PI / 8, 0, 0),
  },
}

class MainCamera extends Entity {
  public perspectiveCamera: THREE.PerspectiveCamera

  public cameraSetting: CameraSettings = CameraSettings.STANDARD

  constructor(gameEngine: GameEngine) {
    super(gameEngine)

    this.perspectiveCamera = new THREE.PerspectiveCamera(
      45,
      Dimensions.fromDOMElement(gameEngine.domElement).toAspectRatio(),
      0.1,
      100000
    )

    const cameraSet = this.getCameraSet()
    this.position.copy(cameraSet.position)
    this.rotation.copy(cameraSet.rotation)

    this.add(this.perspectiveCamera)

    gameEngine.entities.push(this)
    gameEngine.scene?.add(this)
  }

  getCameraSet() {
    return CameraSettingsLookup[this.cameraSetting]
  }

  setCameraSetting(cameraSetting: CameraSettings) {
    this.cameraSetting = cameraSetting
    const cameraSet = this.getCameraSet()
    gsap.to(this.position, {
      ...vector3ToObject(cameraSet.position),
      duration: 1,
    })
    gsap.to(this.rotation, {
      ...vector3ToObject(cameraSet.rotation),
      duration: 1,
    })
  }

  update(options: UpdateOptions) {
    return true
  }
}

export default MainCamera
