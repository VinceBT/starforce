/**
 lerp(20, 80, 0)   // 20
 lerp(20, 80, 1)   // 80
 lerp(20, 80, 0.5) // 40
 */
export const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a

/**
 invlerp(50, 100, 75)  // 0.5
 invlerp(50, 100, 25)  // 0
 invlerp(50, 100, 125) // 1
 */
export const invlerp = (x: number, y: number, a: number) => clamp((a - x) / (y - x))

/**
 clamp(24, 20, 30) // 24
 clamp(12, 20, 30) // 20
 clamp(32, 20, 30) // 30
 */
export const clamp = (a: number, min = 0, max = 1) => Math.min(max, Math.max(min, a))

/**
 range(10, 100, 2000, 20000, 50) // 10000
 */
export const range = (x1: number, y1: number, x2: number, y2: number, a: number) =>
  lerp(x2, y2, invlerp(x1, y1, a))
