import { CONFIG } from "../core/config.js"
import { clamp } from "../utils/math.js"

// Класс игрока
export class Player {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.radius = CONFIG.PLAYER.radius
    this.maxHp = CONFIG.PLAYER.maxHp
    this.hp = CONFIG.PLAYER.maxHp
    this.baseSpeed = CONFIG.PLAYER.baseSpeed
    this.baseDmg = CONFIG.PLAYER.baseDmg
    this.bulletSpeed = CONFIG.PLAYER.bulletSpeed
    this.fireCooldownBase = CONFIG.PLAYER.fireCooldownBase
    this.fireTimer = 0
    this.lives = 0
    this.maxExtraLives = CONFIG.PLAYER.maxExtraLives
    this.buffs = {}
  }

  // Обновление игрока
  update(dt, movementVector) {
    this.updateMovement(dt, movementVector)
    this.updateBuffs(dt)
    this.updateCooldowns(dt)
  }

  // Обновление движения
  updateMovement(dt, movementVector) {
    const mag = Math.hypot(movementVector.x, movementVector.y)
    if (mag === 0) return

    const speedBuff = this.buffs.Speed ? 1 + 0.7 * (this.buffs.Speed.stacks || 0) : 1
    const speed = this.baseSpeed * Math.min(3, speedBuff)

    const vx = (movementVector.x / mag) * speed
    const vy = (movementVector.y / mag) * speed

    this.x = clamp(this.x + vx * dt, this.radius, CONFIG.CSS_WIDTH - this.radius)
    this.y = clamp(this.y + vy * dt, this.radius, CONFIG.CSS_HEIGHT - this.radius)
  }

  // Обновление бафов
  updateBuffs(dt) {
    for (const buffName of Object.keys(this.buffs)) {
      const buff = this.buffs[buffName]
      if (buff.timeLeft !== undefined) {
        buff.timeLeft -= dt
        if (buff.timeLeft <= 0) {
          delete this.buffs[buffName]
        }
      }
    }
  }

  // Обновление кулдаунов
  updateCooldowns(dt) {
    this.fireTimer = Math.max(0, this.fireTimer - dt)
  }

  // Попытка выстрела
  tryShoot(targetX, targetY) {
    if (this.fireTimer > 0) return null

    const dx = targetX - this.x
    const dy = targetY - this.y
    const m = Math.hypot(dx, dy) || 1
    const dmg = this.baseDmg * (this.buffs.Power ? this.buffs.Power.value : 1)

    const ds = this.buffs.DoubleShot ? this.buffs.DoubleShot.stacks : 0
    const counts = [1, 2, 4, 8]
    const bulletCount = counts[clamp(ds, 0, 3)]

    const bullets = []
    const spread = 0.18

    for (let i = 0; i < bulletCount; i++) {
      const t = bulletCount === 1 ? 0 : i / (bulletCount - 1) - 0.5
      const angle = Math.atan2(dy, dx) + t * spread
      const vx = Math.cos(angle) * this.bulletSpeed
      const vy = Math.sin(angle) * this.bulletSpeed

      bullets.push({
        x: this.x,
        y: this.y,
        vx,
        vy,
        radius: CONFIG.BULLETS.radius,
        dmg,
      })
    }

    const rapid = this.buffs.Rapid ? this.buffs.Rapid.value : 1
    this.fireTimer = this.fireCooldownBase / rapid

    return bullets
  }

  // Получение урона
  takeDamage(damage) {
    if (this.buffs.Invuln && this.buffs.Invuln.timeLeft > 0) {
      return false // Не получил урон
    }
    this.hp -= damage
    return true // Получил урон
  }

  // Применение бафа
  applyBuff(pickup) {
    const type = pickup.type
    const config = CONFIG.PICKUPS.types[type]

    const mapping = {
      Speed: () => {
        const current = this.buffs[type] || { stacks: 0, timeLeft: 0 }
        current.stacks = Math.min(config.maxStacks, (current.stacks || 0) + 1)
        current.timeLeft = Math.max(current.timeLeft || 0, pickup.duration)
        this.buffs[type] = current
      },
      DoubleShot: () => {
        const current = this.buffs[type] || { stacks: 0, timeLeft: 0 }
        current.stacks = Math.min(config.maxStacks, (current.stacks || 0) + 1)
        current.timeLeft = Math.max(current.timeLeft || 0, pickup.duration)
        this.buffs[type] = current
      },
      ExtraLife: () => {
        if (this.lives < this.maxExtraLives) {
          this.lives++
          return true // Применился
        }
        return false // Не применился
      },
      Invuln: () => {
        this.buffs.Invuln = { timeLeft: config.duration }
      },
      Rapid: () => {
        this.buffs[type] = { timeLeft: pickup.duration, value: config.value }
      },
      Power: () => {
        this.buffs[type] = { timeLeft: pickup.duration, value: config.value }
      },
    }

    if (type === "Rapid" || type === "Power") {
      this.buffs[type] = { timeLeft: pickup.duration, value: config.value }
    }

    mapping[type]()

    return true 
  }

  // Проверка смерти и респавн
  handleDeath() {
    if (this.hp <= 0) {
      if (this.lives > 0) {
        this.lives--
        this.hp = this.maxHp * 0.6
        this.buffs.Invuln = { timeLeft: 2.2 }
        return "respawn"
      } else {
        return "gameOver"
      }
    }
    return "alive"
  }

  // Сброс к начальному состоянию
  reset() {
    this.x = CONFIG.CSS_WIDTH / 2
    this.y = CONFIG.CSS_HEIGHT / 2
    this.hp = this.maxHp
    this.buffs = {}
    this.lives = 0
    this.fireTimer = 0
  }

  // Получение статистики для UI
  getStats() {
    return {
      hp: Math.floor(this.hp),
      maxHp: this.maxHp,
      lives: this.lives,
      speed: Math.floor(this.baseSpeed * (this.buffs.Speed ? Math.min(3, 1 + 0.7 * this.buffs.Speed.stacks) : 1)),
      damage: Math.floor(this.baseDmg * (this.buffs.Power ? this.buffs.Power.value : 1)),
      fireRate: (this.fireCooldownBase / (this.buffs.Rapid ? this.buffs.Rapid.value : 1)).toFixed(2),
    }
  }
}
