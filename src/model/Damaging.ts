import Reloader from './Reloader'

export interface Damaging {
  damage: number
}

export interface Living {
  life: number

  maxLife: number

  takeDamage(damage: number): void
}

export interface Glowing {
  invincibleDuringGlow: boolean

  glowingReloader: Reloader
}
