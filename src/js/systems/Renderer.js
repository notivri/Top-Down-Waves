import { CONFIG } from "../core/config.js"
import { clamp } from "../utils/math.js"

export class Renderer {
  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx
    this.images = new Map()
    this.imagesLoaded = false
    this.setupCanvas()
    this.loadImages()
    window.addEventListener("resize", () => this.setupCanvas())
  }

  createDefaultImage(width = 32, height = 32, color = '#ffffff') {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    
    ctx.fillStyle = color
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = '#000000'
    ctx.strokeRect(0, 0, width, height)
    
    return canvas
  }

  async loadImages() {
    const imageFiles = {
      player: "assets/mainCharacter.png",
      bulletIcon: "assets/bulletIcon.png",
      cyanZombie: "assets/cyanZombie.png",
      greenZombie: "assets/greenZombie.png",
      purpleZombie: "assets/purpleZombie.png",
      healthPowerup: "assets/healthPowerup.png",
      invulPowerup: "assets/invulPowerup.png",
      speedPowerup: "assets/speedPowerup.png"
    }

    const loadPromises = Object.entries(imageFiles).map(([key, path]) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          this.images.set(key, img)
          resolve()
        }
        img.onerror = () => {
          console.warn(`Failed to load image: ${path}, using default`)
          const defaultColors = {
            player: '#6ea8ff',
            bulletIcon: '#ffd166',
            greenZombie: '#ff6b6b',
            cyanZombie: '#ff9b6b',
            purpleZombie: '#ffd166',
            healthPowerup: '#9ad6ff',
            invulPowerup: '#b39dfc',
            speedPowerup: '#7cf59a'
          }
          this.images.set(key, this.createDefaultImage(32, 32, defaultColors[key] || '#ffffff'))
          resolve()
        }
        img.src = path
      })
    })

    await Promise.all(loadPromises)
    this.imagesLoaded = true
    console.log(`All images loaded successfully: ${this.images.size} images`)
  }

  getImagesLoadedStatus() {
    return {
      loaded: this.imagesLoaded,
      count: this.images.size
    }
  }

  setupCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.style.width = CONFIG.CSS_WIDTH + "px"
    this.canvas.style.height = CONFIG.CSS_HEIGHT + "px"
    this.canvas.width = Math.floor(CONFIG.CSS_WIDTH * dpr)
    this.canvas.height = Math.floor(CONFIG.CSS_HEIGHT * dpr)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  render(gameData) {
    this.clearCanvas()
    this.renderPickups(gameData.pickups)
    this.renderEnemies(gameData.enemies)
    this.renderBullets(gameData.bullets)
    this.renderPlayer(gameData.player, gameData.mousePos)
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, CONFIG.CSS_WIDTH, CONFIG.CSS_HEIGHT)
  }

  renderPickups(pickups) {
    for (const pickup of pickups) {
      this.ctx.save()
 
      const time = Date.now() / 1000
      const pulseFactor = 0.9 + 0.1 * Math.sin(time * 3)
      const size = CONFIG.PICKUPS.radius * 2 * pulseFactor

      const pickupConfig = CONFIG.PICKUPS.types[pickup.type]
      const imageKey = pickupConfig?.imageKey || 'speedPowerup'
      const img = this.images.get(imageKey)
      
      this.ctx.drawImage(
        img,
        pickup.x - size / 2,
        pickup.y - size / 2,
        size,
        size
      )

      this.ctx.restore()
    }
  }

  renderEnemies(enemies) {
    for (const enemy of enemies) {
      this.ctx.save()

      this.ctx.beginPath()
      this.ctx.fillStyle = "rgba(0,0,0,0.18)"
      this.ctx.arc(enemy.x + 2, enemy.y + 2, enemy.radius + 3, 0, Math.PI * 2)
      this.ctx.fill()

      const size = enemy.radius * 2

      const enemyConfig = CONFIG.ENEMIES.types[enemy.type]
      const imageKey = enemyConfig?.imageKey || 'greenZombie'
      const img = this.images.get(imageKey)

      const dx = enemy.targetX - enemy.x
      const dy = enemy.targetY - enemy.y
      const angle = Math.atan2(dy, dx)

      const time = Date.now() / 1000
      const wobble = Math.sin(time * 4 + enemy.x * 0.01) * 0.1

      this.ctx.save()
      this.ctx.translate(enemy.x, enemy.y)
      this.ctx.rotate(angle + wobble + Math.PI / 2)
      this.ctx.drawImage(
        img,
        -size / 2,
        -size / 2,
        size,
        size
      )
      this.ctx.restore()

      this.renderEnemyHealthBar(enemy)

      this.ctx.restore()
    }
  }

  renderEnemyHealthBar(enemy) {
    const barWidth = enemy.radius * 2
    const barHeight = 5
    const barY = enemy.y - enemy.radius - 8

    this.ctx.fillStyle = "#222"
    this.ctx.fillRect(enemy.x - enemy.radius, barY, barWidth, barHeight)

    this.ctx.fillStyle = "#7cf59a"
    const healthPercent = clamp(enemy.hp / enemy.maxHp, 0, 1)
    this.ctx.fillRect(enemy.x - enemy.radius, barY, barWidth * healthPercent, barHeight)
  }

  renderBullets(bullets) {
    for (const bullet of bullets) {
      this.ctx.save()

      const size = bullet.radius * 2

      const img = this.images.get('bulletIcon')

      this.ctx.translate(bullet.x, bullet.y)
      this.ctx.rotate(bullet.angle + Math.PI / 2)
      this.ctx.drawImage(
        img,
        -size / 2,
        -size / 2,
        size,
        size
      )

      this.ctx.restore()
    }
  }

  renderPlayer(player, mousePos) {
    this.ctx.save()

    const dx = mousePos.x - player.x
    const dy = mousePos.y - player.y
    const m = Math.hypot(dx, dy) || 1
    const nx = dx / m
    const ny = dy / m

    const size = player.radius * 2
    const img = this.images.get('player')

    this.ctx.save()
    this.ctx.translate(player.x, player.y)
    this.ctx.rotate(Math.atan2(dy, dx))
    this.ctx.drawImage(
      img,
      -size / 2,
      -size / 2,
      size,
      size
    )
    this.ctx.restore()

    this.ctx.beginPath()
    this.ctx.fillStyle = "#022"
    this.ctx.arc(player.x + nx * 6, player.y + ny * 6, 4, 0, Math.PI * 2)
    this.ctx.fill()

    if (player.buffs.Invuln && player.buffs.Invuln.timeLeft > 0) {
      this.ctx.beginPath()
      this.ctx.strokeStyle = "#b39dfc"
      this.ctx.lineWidth = 3
      this.ctx.arc(player.x, player.y, player.radius + 6, 0, Math.PI * 2)
      this.ctx.stroke()
    }

    this.ctx.restore()
  }

  renderDebugInfo(gameData) {
    this.ctx.save()
    this.ctx.fillStyle = "#fff"
    this.ctx.font = "12px monospace"

    let y = 20
    const info = [
      `Enemies: ${gameData.enemies.length}`,
      `Bullets: ${gameData.bullets.length}`,
      `Pickups: ${gameData.pickups.length}`,
      `Player HP: ${Math.floor(gameData.player.hp)}`,
      `Wave: ${gameData.wave}`,
      `Score: ${gameData.score}`,
    ]

    for (const line of info) {
      this.ctx.fillText(line, 10, y)
      y += 15
    }

    this.ctx.restore()
  }
}
