import * as THREE from 'three'

export const SIXTY_FPS_MS = 1000 / 60

const multiplier = 2.5
export const PLANE_SIZE = multiplier * 10000
export const PLANE_HALF = PLANE_SIZE / 2
export const PLANE_QUARTER = PLANE_HALF / 2
export const PLANE_GRID_NB = multiplier * 100
export const PLANE_STEP = PLANE_SIZE / PLANE_GRID_NB

export type EntityOptions = {
  initialVelocity?: THREE.Vector3
  initialPosition?: THREE.Vector3
  initialRotation?: THREE.Euler
}
