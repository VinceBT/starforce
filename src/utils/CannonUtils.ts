import CANNON from 'cannon'
import * as THREE from 'three'

export function copyTHREEToCANNON(mesh: THREE.Object3D, body: CANNON.Body) {
  body.position.copy(new CANNON.Vec3(...mesh.position.toArray()))
  body.quaternion.copy(new CANNON.Quaternion(...mesh.quaternion.toArray()))
}
