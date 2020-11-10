export function randomBetween(min: number, max: number) {
  const span = max - min
  return Math.random() * span + min
}
