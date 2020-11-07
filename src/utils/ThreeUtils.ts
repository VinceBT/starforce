import * as THREE from 'three'

export const vector3ToObject = (vector: THREE.Vector3 | THREE.Euler) => {
  return { x: vector.x, y: vector.y, z: vector.z }
}
