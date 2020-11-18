import CANNON from 'cannon'
import { EventEmitter } from 'events'
import $ from 'jquery'
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
import Bullet from './Bullet'
import { CollisionBody } from './Collisionable'
import { SIXTY_FPS_MS } from './Constants'
import ControlsManager, { KeyboardKeycodes, MouseButtons } from './ControlsManager'
import { Dimensions } from './Dimensions'
import Entity, { UpdateOptions } from './Entity'
import GuiManager from './GuiManager'
import MainCamera from './MainCamera'
import Meteor from './Meteor'
import Plane from './Plane'
import ReactorTrail from './ReactorTrail'
import Ship from './Ship'
import SoundEngine from './SoundEngine'

export enum GameEngineEvents {
  DEATH = 'death',
  PAUSE = 'pause',
  RESUME = 'resume',
}

const DEBUG_SHADERS = true

class GameEngine extends EventEmitter {
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
  public mouse: THREE.Vector2 = new THREE.Vector2()
  public ambientLight: THREE.AmbientLight
  public directionalLight: THREE.DirectionalLight
  public controlsManager: ControlsManager
  public plane: Plane
  public ship: Ship
  public entities: Entity[] = []
  public additionalEntities: (Entity | Entity[] | null)[] = []
  public removalEntities: Entity[] = []
  public speed = 1
  public hasGameStarted = false
  public world: CANNON.World
  public soundEngine: SoundEngine
  public states = {
    tabActive: document.hasFocus(),
    isPlaying: false,
    mouseOnScreen: true,
    gamePaused: false,
    pauseRender: false,
    isScrolling: false,
    hoversCanvas: false,
  }

  constructor(domElement: HTMLDivElement) {
    super()

    this.domElement = domElement
    this.soundEngine = new SoundEngine()
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
    this.stats.dom.style.removeProperty('left')
    this.stats.dom.style.removeProperty('top')
    this.stats.dom.style.right = '0px'
    this.stats.dom.style.bottom = '0px'
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

    this.world = new CANNON.World()
    this.clock = new THREE.Clock()

    // Entities
    this.plane = new Plane(this)
    this.ship = new Ship(this)

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

    $(window).on('mouseleave', () => {
      this.states.mouseOnScreen = false
    })

    $(window).on('mouseenter', () => {
      this.states.mouseOnScreen = true
    })

    $(window).on('blur', () => {
      this.states.tabActive = false
    })

    $(window).on('focus', () => {
      this.states.tabActive = true
    })

    $(document).on('mousemove', (event) => {
      event.preventDefault()
      const nextDimensions = Dimensions.fromDOMElement(this.domElement)
      this.states.hoversCanvas = event.target ? $(event.target).is('.Canvas-container') : false
      if (this.states.hoversCanvas) {
        this.mouse.set(
          (event.clientX / nextDimensions.width) * 2 - 1,
          -(event.clientY / nextDimensions.height) * 2 + 1
        )
      }
    })
  }

  public restart() {
    this.ship = new Ship(this)
    this.mouse = new THREE.Vector2()
    this.removalEntities.push(
      ...this.entities.filter((entity) => {
        const shouldKill =
          entity instanceof Meteor || entity instanceof Bullet || entity instanceof ReactorTrail
        if (shouldKill) entity.kill()
        return shouldKill
      })
    )
  }

  public update(updateOptions: UpdateOptions) {
    const pauseRender = !(
      this.states.mouseOnScreen &&
      this.states.tabActive &&
      !this.states.gamePaused
    )

    if (pauseRender !== this.states.pauseRender) {
      if (pauseRender) {
        this.emit(GameEngineEvents.PAUSE)
      } else if (!pauseRender) {
        this.emit(GameEngineEvents.RESUME)
      }
      this.states.pauseRender = pauseRender
    }

    if (this.states.pauseRender) return

    this.badTVPass.uniforms['time'].value = updateOptions.elapsed
    this.filmPass.uniforms['time'].value = updateOptions.elapsed
    this.staticPass.uniforms['time'].value = updateOptions.elapsed
    this.crtPass.uniforms['time'].value = updateOptions.elapsed

    this.world.step(updateOptions.delta)
    this.world.contacts.forEach((contact) => {
      if (contact.bi instanceof CollisionBody && contact.bj instanceof CollisionBody) {
        const pe1 = contact.bi as CollisionBody
        const pe2 = contact.bj as CollisionBody
        pe1.collisionableEntity.collideWith?.(pe2.collisionableEntity, contact)
        pe2.collisionableEntity.collideWith?.(pe1.collisionableEntity, contact)
      }
    })

    if (Math.abs(1 - updateOptions.speed) >= 1) {
      console.warn('Speed variation is too big:', (1 - updateOptions.speed).toFixed(3))
    }

    this.entities = filterNullish([
      ...this.entities.map((entity) => {
        const keepAlive = entity?.update(updateOptions)
        if (keepAlive) {
          return entity
        }
        entity?.kill()
        return null
      }),
      ...flattenArray(this.additionalEntities),
    ]).filter((entity) => !this.removalEntities.includes(entity))
    this.additionalEntities = []
    this.removalEntities = []
  }

  public kill() {
    this.guiManager.kill()
    cancelAnimationFrame(this.animationFrameReference)
    this.domElement.removeChild(this.renderer.domElement)
    document.body.removeChild(this.stats.dom)
  }
}

export default GameEngine
