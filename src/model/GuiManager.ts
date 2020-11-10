import * as dat from 'dat.gui'
import { GUI } from 'dat.gui'

import { Updatable } from './Entity'
import GameEngine from './GameEngine'
import { CameraSettings } from './MainCamera'

export default class GuiManager implements Updatable {
  gameEngine: GameEngine

  gui: dat.GUI

  constructor(domElement: HTMLDivElement, gameEngine: GameEngine) {
    this.gameEngine = gameEngine
    this.gui = new dat.GUI()

    const folderCamera = this.gui.addFolder('Camera')
    folderCamera.open()

    const folderPosition = folderCamera.addFolder('Position')
    folderPosition.open()

    const range = 1e4
    folderPosition.add(this.gameEngine.camera.position, 'x', -range, range)
    folderPosition.add(this.gameEngine.camera.position, 'y', -1000, 100000)
    folderPosition.add(this.gameEngine.camera.position, 'z', -range, range)

    const folderRotation = folderCamera.addFolder('Rotation')
    folderRotation.open()

    folderRotation.add(this.gameEngine.camera.rotation, 'x', -Math.PI, Math.PI)
    folderRotation.add(this.gameEngine.camera.rotation, 'y', -Math.PI, Math.PI)
    folderRotation.add(this.gameEngine.camera.rotation, 'z', -Math.PI, Math.PI)

    const folderSettings = folderCamera.addFolder('Settings')
    folderSettings.open()

    const cameraSettings = {
      [CameraSettings[CameraSettings.STANDARD]]: () => {
        this.gameEngine.camera.setCameraSetting(CameraSettings.STANDARD)
      },
      [CameraSettings[CameraSettings.SIDE]]: () => {
        this.gameEngine.camera.setCameraSetting(CameraSettings.SIDE)
      },
      [CameraSettings[CameraSettings.UPFRONT]]: () => {
        this.gameEngine.camera.setCameraSetting(CameraSettings.UPFRONT)
      },
    }

    folderSettings.add(cameraSettings, CameraSettings[CameraSettings.STANDARD])
    folderSettings.add(cameraSettings, CameraSettings[CameraSettings.SIDE])
    folderSettings.add(cameraSettings, CameraSettings[CameraSettings.UPFRONT])

    const shaderFolder = this.gui.addFolder('Shaders')

    this.addShader(shaderFolder, 'BadTV Pass', this.gameEngine.badTVPass.uniforms)
      .add('distortion', 0.1, 20, 0.1)
      .add('distortion2', 0.1, 20, 0.1)
      .add('speed', 0.0, 1.0, 0.01)
      .add('rollSpeed', 0.0, 1.0, 0.01)

    this.addShader(shaderFolder, 'RGB Pass', this.gameEngine.rgbPass.uniforms)
      .add('amount', 0.0, 0.1)
      .add('angle', 0.0, Math.PI * 2)

    this.addShader(shaderFolder, 'Static Pass', this.gameEngine.staticPass.uniforms)
      .add('amount', 0.0, 0.1, 0.01)
      .add('size', 1.0, 100.0, 1.0)

    this.addShader(shaderFolder, 'Film Pass', this.gameEngine.filmPass.uniforms)
      .add('sCount', 50, 1000)
      .add('sIntensity', 0.0, 1000, 0.1)
      .add('nIntensity', 0.0, 2.0, 0.1)

    this.addShader(shaderFolder, 'CRT Pass', this.gameEngine.crtPass.uniforms)
      .add('bulge', 0, 15, 0.05)
      .add('rgbAmount', 0, 0.5, 0.05)
      .add('rgbPower', 0, 15, 0.05)
      .add('vignetteScale', 0, 15, 0.05)
      .add('vignettePower', 0, 15, 0.05)

    this.addShader(shaderFolder, 'Vignette Pass', this.gameEngine.vignettePass.uniforms)
      .add('offset', 0, 10, 0.1)
      .add('darkness', 0.0, 10, 0.1)

    this.addShader(shaderFolder, 'Pixel Pass', this.gameEngine.pixelPass.uniforms).add(
      'pixelSize',
      0,
      30,
      1
    )

    const folderOutline = this.gui.addFolder('Outline')
    folderOutline.open()

    folderOutline.add(this.gameEngine.outlinePass, 'edgeStrength', 0, 50)
    folderOutline.add(this.gameEngine.outlinePass, 'edgeGlow', 0, 50)
    folderOutline.add(this.gameEngine.outlinePass, 'edgeThickness', 0, 50)
    folderOutline.add(this.gameEngine.outlinePass, 'pulsePeriod', 0, 50)
  }

  addShader(shaderFolder: GUI, folderName: string, uniforms: any) {
    const folder = shaderFolder.addFolder(folderName)
    folder.open()
    const fn = (propName: string, min: number, max: number, step?: number) => {
      const val = folder.add(uniforms[propName], 'value', min, max).name(propName)
      if (typeof step === 'number') val.step(step)
      return { add: fn }
    }
    return { add: fn }
  }

  update() {
    this.gui.updateDisplay()
    return true
  }

  kill() {
    this.gui.destroy()
  }
}
