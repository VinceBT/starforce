import * as THREE from 'three'

export function clonePositionalAudio(
  positionalAudio: THREE.PositionalAudio
): THREE.PositionalAudio {
  const positionalAudioCopy = new THREE.PositionalAudio(positionalAudio.listener)
  positionalAudioCopy.buffer = positionalAudio.buffer
  positionalAudioCopy.setRefDistance(positionalAudio.getRefDistance())
  positionalAudioCopy.panner = positionalAudio.panner
  return positionalAudioCopy
}

export function setPositionalAudioOnEnded(
  positionalAudio: THREE.PositionalAudio,
  onEndedCallback: Function
): void {
  positionalAudio.onEnded = () => {
    positionalAudio.isPlaying = false
    onEndedCallback()
  }
}

export function playPositionalAudioCopy(
  object: THREE.Object3D,
  positionalAudio: THREE.PositionalAudio
): void {
  const clone = clonePositionalAudio(positionalAudio)
  object.add(clone)
  setPositionalAudioOnEnded(clone, () => {
    object.remove(clone)
  })
  clone.play()
}

export function createPositionalAudioFactory(
  object: THREE.Object3D,
  audioListener: THREE.AudioListener
) {
  return function (refDistance: number, audioBuffer?: AudioBuffer) {
    const copy = new THREE.PositionalAudio(audioListener)
    copy.setRefDistance(refDistance)
    if (audioBuffer) {
      copy.setBuffer(audioBuffer)
    }
    object.add(copy)
    return copy
  }
}
