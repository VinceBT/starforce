import * as THREE from 'three'

export function vector3ToObject(vector: THREE.Vector3 | THREE.Euler) {
  return { x: vector.x, y: vector.y, z: vector.z }
}

export function addEuler(euler1: THREE.Euler, euler2: THREE.Euler): THREE.Euler {
  const clone = euler1.clone()
  clone.x += euler2.x
  clone.y += euler2.y
  clone.z += euler2.z
  return clone
}
