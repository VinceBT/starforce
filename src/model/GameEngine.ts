import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader'
import { FilmShader } from 'three/examples/jsm/shaders/FilmShader'
import { PixelShader } from 'three/examples/jsm/shaders/PixelShader'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader'

import BadTVShader from '../additional/BadTVShader'
import CRTShader from '../additional/CRTDistortion'
import StaticShader from '../additional/StaticShader'
import VignetteShader from '../additional/VignetteShader'
import { filterNullish, flattenArray } from '../utils/ArrayUtils'
import { SIXTY_FPS_MS } from './Constants'
import ControlsManager, {
  KeyboardKeycodes,
  MouseButtons,
} from './ControlsManager'
import { Dimensions } from './Dimensions'
import Entity, { UpdateOptions } from './Entity'
import GuiManager from './GuiManager'
import MainCamera from './MainCamera'
import Plane from './Plane'
import Ship from './Ship'

const DEBUG_SHADERS = true

class GameEngine {
  public domElement: HTMLDivElement

  private animationFrameReference: number

  public scene: THREE.Scene

  public camera: MainCamera

  public renderer: THREE.WebGLRenderer

  public renderPass: RenderPass

  public badTVPass: ShaderPass

  public rgbPass: ShaderPass

  public filmPass: ShaderPass

  public staticPass: ShaderPass

  public vignettePass: ShaderPass

  public pixelPass: ShaderPass

  public crtPass: ShaderPass

  public outlinePass: OutlinePass

  public copyPass: ShaderPass

  public composer: EffectComposer

  public stats: Stats

  public guiManager: GuiManager

  public clock: THREE.Clock

  public mouse: THREE.Vector2

  public ambientLight: THREE.AmbientLight

  public directionalLight: THREE.DirectionalLight

  public controlsManager: ControlsManager

  public plane: Plane

  public ship: Ship

  public entities: Entity[] = []

  public additionalEntities: (Entity | Entity[] | null)[] = []

  public speed = 1

  constructor(domElement: HTMLDivElement) {
    this.domElement = domElement

    this.scene = new THREE.Scene()

    // Camera
    this.camera = new MainCamera(this)

    // Lights
    this.ambientLight = new THREE.AmbientLight(0x606060)
    this.scene.add(this.ambientLight)

    this.directionalLight = new THREE.DirectionalLight(0xffffff)
    this.directionalLight.position.set(1, 0.75, 0.5).normalize()
    this.scene.add(this.directionalLight)

    const dimensions = Dimensions.fromDOMElement(this.domElement)

    this.scene.fog = new THREE.FogExp2(0x0d0d35, 0)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    this.renderer.setSize(...dimensions.toArray())
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.renderer.autoClear = false
    this.renderer.setClearColor(this.scene.fog.color)

    this.composer = new EffectComposer(this.renderer)

    this.renderPass = new RenderPass(this.scene, this.camera.perspectiveCamera)

    this.rgbPass = new ShaderPass(RGBShiftShader)
    this.rgbPass.uniforms['angle'].value = Math.PI
    this.rgbPass.uniforms['amount'].value = 0.002

    this.outlinePass = new OutlinePass(
      new THREE.Vector2(...dimensions.toArray()),
      this.scene,
      this.camera.perspectiveCamera
    )

    this.outlinePass.edgeStrength = 5
    this.outlinePass.edgeGlow = 0.1
    this.outlinePass.edgeThickness = 0.5
    this.outlinePass.pulsePeriod = 0
    const color = 0xff2250
    this.outlinePass.visibleEdgeColor.set(color)
    this.outlinePass.hiddenEdgeColor.set(color)

    this.filmPass = new ShaderPass(FilmShader)
    this.filmPass.uniforms.grayscale.value = 0
    this.filmPass.uniforms.sCount.value = 800
    this.filmPass.uniforms.sIntensity.value = 0.5
    this.filmPass.uniforms.nIntensity.value = 0.4

    this.badTVPass = new ShaderPass(BadTVShader)
    this.badTVPass.uniforms['distortion'].value = 0.1
    this.badTVPass.uniforms['distortion2'].value = 0.5
    this.badTVPass.uniforms['speed'].value = 0.5
    this.badTVPass.uniforms['rollSpeed'].value = 0

    this.staticPass = new ShaderPass(StaticShader)
    this.staticPass.uniforms.amount.value = 0.04
    this.staticPass.uniforms.size.value = 2

    this.pixelPass = new ShaderPass(PixelShader)
    this.pixelPass.uniforms['resolution'].value = new THREE.Vector2(
      ...dimensions.toArray()
    ).multiplyScalar(window.devicePixelRatio)
    this.pixelPass.uniforms['pixelSize'].value = 2

    this.crtPass = new ShaderPass(CRTShader)
    this.crtPass.uniforms['bulge'].value = 0.1
    this.crtPass.uniforms['rgbAmount'].value = 0.01
    this.crtPass.uniforms['rgbPower'].value = 0.1

    this.vignettePass = new ShaderPass(VignetteShader)
    this.vignettePass.uniforms['offset'].value = 0.5
    this.vignettePass.uniforms['darkness'].value = 0.5

    this.copyPass = new ShaderPass(CopyShader)

    this.composer.addPass(this.renderPass)
    this.composer.addPass(this.outlinePass)
    if (DEBUG_SHADERS) {
      // this.composer.addPass(this.pixelPass)
      // this.composer.addPass(this.vignettePass)
      // this.composer.addPass(this.rgbPass)
      this.composer.addPass(this.badTVPass)
      this.composer.addPass(this.filmPass)
      this.composer.addPass(this.crtPass)
      this.composer.addPass(this.staticPass)
    }
    this.composer.addPass(this.copyPass)

    this.composer.passes[this.composer.passes.length - 1].renderToScreen = true

    this.domElement.appendChild(this.renderer.domElement)

    this.domElement.setAttribute('tabindex', '1') // to be focusable
    this.domElement.focus() // To force focus

    // Debug elements
    this.guiManager = new GuiManager(this.domElement, this)
    this.stats = Stats()
    document.body.appendChild(this.stats.dom)

    // Controls
    this.controlsManager = new ControlsManager(this.domElement)
    this.controlsManager.controlKeycode(KeyboardKeycodes.KEY_UP)
    this.controlsManager.controlKeycode(KeyboardKeycodes.KEY_LEFT)
    this.controlsManager.controlKeycode(KeyboardKeycodes.KEY_RIGHT)
    this.controlsManager.controlKeycode(KeyboardKeycodes.KEY_DOWN)
    this.controlsManager.controlMouseButton(MouseButtons.MOUSE_LEFT)
    this.controlsManager.controlMouseButton(MouseButtons.MOUSE_WHEEL)
    this.controlsManager.controlMouseButton(MouseButtons.MOUSE_RIGHT)
    this.controlsManager.on(MouseButtons[MouseButtons.MOUSE_WHEEL], () => {
      console.log('yo')
    })

    // Entities
    this.plane = new Plane(this)
    this.ship = new Ship(this)

    this.clock = new THREE.Clock()

    const updateViewport = () => {
      const nextDimensions = Dimensions.fromDOMElement(this.domElement)
      this.camera.perspectiveCamera.aspect = nextDimensions.toAspectRatio()
      this.camera.perspectiveCamera.updateProjectionMatrix()
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setViewport(0, 0, ...nextDimensions.toArray())
      this.renderer.setSize(...nextDimensions.toArray())
      this.composer.setPixelRatio(window.devicePixelRatio)
      this.composer.setSize(...nextDimensions.toArray())

      // Update shaders
      this.pixelPass.uniforms['resolution'].value = new THREE.Vector2(
        ...nextDimensions.toArray()
      ).multiplyScalar(window.devicePixelRatio)
    }

    const animate = () => {
      this.stats.begin()
      this.guiManager.update()

      const deltaMs = this.clock.getDelta() * 1000
      this.update({
        delta: deltaMs,
        speed: (deltaMs > 0 ? deltaMs : SIXTY_FPS_MS) / SIXTY_FPS_MS,
        elapsed: this.clock.elapsedTime,
      })

      this.badTVPass.uniforms['time'].value = this.clock.elapsedTime
      this.filmPass.uniforms['time'].value = this.clock.elapsedTime
      this.staticPass.uniforms['time'].value = this.clock.elapsedTime
      this.crtPass.uniforms['time'].value = this.clock.elapsedTime

      updateViewport()
      this.composer.render(deltaMs)

      this.stats.end()
      this.animationFrameReference = requestAnimationFrame(animate)
    }

    this.animationFrameReference = requestAnimationFrame(animate)

    const onWindowResize = () => {
      updateViewport()
    }

    window.addEventListener('resize', onWindowResize, false)

    const states = {
      tabActive: true,
      isPlaying: false,
      mouseOnScreen: true,
      gamePaused: false,
      isScrolling: false,
      hoversCanvas: false,
    }

    this.mouse = new THREE.Vector2()

    const onMouseMove = (event: MouseEvent) => {
      event.preventDefault()
      const nextDimensions = Dimensions.fromDOMElement(this.domElement)
      this.mouse.set(
        (event.clientX / nextDimensions.width) * 2 - 1,
        -(event.clientY / nextDimensions.height) * 2 + 1
      )
      if (
        event.clientX < 0 ||
        event.clientX > nextDimensions.width ||
        event.clientY < 0 ||
        event.clientY > nextDimensions.height
      ) {
        states.mouseOnScreen = false
      }
      states.hoversCanvas = false // $(event.target).is('canvas')
    }

    this.domElement.addEventListener('mousemove', onMouseMove, false)
  }

  public update(options: UpdateOptions) {
    if (Math.abs(1 - options.speed) >= 1) {
      console.warn(
        'Speed variation is too big:',
        (1 - options.speed).toFixed(3)
      )
    }
    this.entities = filterNullish([
      ...this.entities.map((entity) => {
        const keepAlive = entity?.update(options)
        if (keepAlive) {
          return entity
        }
        entity?.kill()
        return null
      }),
      ...flattenArray(this.additionalEntities),
    ])
    this.additionalEntities = []
  }

  public kill() {
    this.guiManager.kill()
    cancelAnimationFrame(this.animationFrameReference)
    this.domElement.removeChild(this.renderer.domElement)
    document.body.removeChild(this.stats.dom)
  }
}

export default GameEngine
