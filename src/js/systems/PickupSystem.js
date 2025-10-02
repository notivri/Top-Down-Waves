import { CONFIG } from "../core/config.js"
import { rand, randInt } from "../utils/math.js"

export class PickupSystem {
  constructor() {
    this.pickups = []
  }

  spawnPickup(x, y) {
    if (Math.random() > CONFIG.PICKUPS.dropChance) return null

    const types = Object.keys(CONFIG.PICKUPS.types)
    const type = types[randInt(0, types.length - 1)]
    const config = CONFIG.PICKUPS.types[type]

    function getDuration(config) {
      if (config.instant) return 0
      if (Array.isArray(config.duration)) return rand(...config.duration)
      return config.duration
    }

    const duration = getDuration(config)

    const pickup = {
      x,
      y,
      type,
      duration,
      ttl: CONFIG.PICKUPS.ttl,
      color: config.color,
    }

    this.pickups.push(pickup)
    return pickup
  }

  update(dt, player) {
    const results = []

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pickup = this.pickups[i]

      pickup.ttl -= dt

      if (pickup.ttl <= 0) {
        this.pickups.splice(i, 1)
        continue
      }

      // Проверяем подбор игроком
      const distance = Math.hypot(pickup.x - player.x, pickup.y - player.y)
      if (distance < player.radius + CONFIG.PICKUPS.radius + 2) {
        const applied = player.applyBuff(pickup)
        this.pickups.splice(i, 1)

        if (applied) {
          results.push({
            type: "pickupCollected",
            pickupType: pickup.type,
          })
        }
      }
    }

    return results
  }

  getPickups() {
    return this.pickups
  }

  clear() {
    this.pickups = []
  }

  getCount() {
    return this.pickups.length
  }

  removePickup(index) {
    if (index >= 0 && index < this.pickups.length) {
      this.pickups.splice(index, 1)
    }
  }

  forceSpawnPickup(x, y, type) {
    const config = CONFIG.PICKUPS.types[type]
    if (!config) return null

    let duration
    if (config.instant) {
      duration = 0
    } else if (Array.isArray(config.duration)) {
      duration = rand(...config.duration)
    } else {
      duration = config.duration
    }

    const pickup = {
      x,
      y,
      type,
      duration,
      ttl: CONFIG.PICKUPS.ttl,
      color: config.color,
    }

    this.pickups.push(pickup)
    return pickup
  }
}
