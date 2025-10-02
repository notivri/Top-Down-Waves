import { CONFIG } from '../core/config.js';
import { clamp } from '../utils/math.js';

// Система рендеринга
export class Renderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.setupCanvas();
    window.addEventListener('resize', () => this.setupCanvas());
  }

  // Настройка canvas для high-DPI дисплеев
  setupCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.style.width = CONFIG.CSS_WIDTH + 'px';
    this.canvas.style.height = CONFIG.CSS_HEIGHT + 'px';
    this.canvas.width = Math.floor(CONFIG.CSS_WIDTH * dpr);
    this.canvas.height = Math.floor(CONFIG.CSS_HEIGHT * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Основной метод рендеринга
  render(gameData) {
    this.clearCanvas();
    this.renderPickups(gameData.pickups);
    this.renderEnemies(gameData.enemies);
    this.renderBullets(gameData.bullets);
    this.renderPlayer(gameData.player, gameData.mousePos);
  }

  // Очистка canvas
  clearCanvas() {
    this.ctx.clearRect(0, 0, CONFIG.CSS_WIDTH, CONFIG.CSS_HEIGHT);
  }

  // Рендеринг подбираемых предметов
  renderPickups(pickups) {
    for (const pickup of pickups) {
      this.ctx.save();
      this.ctx.fillStyle = pickup.color;
      
      const size = CONFIG.PICKUPS.radius;
      
      // Рисуем ромб
      this.ctx.beginPath();
      this.ctx.moveTo(pickup.x, pickup.y - size);     // верх
      this.ctx.lineTo(pickup.x + size, pickup.y);     // право
      this.ctx.lineTo(pickup.x, pickup.y + size);     // низ
      this.ctx.lineTo(pickup.x - size, pickup.y);     // лево
      this.ctx.closePath();
      this.ctx.fill();
      
      this.ctx.restore();
    }
  }

  // Рендеринг врагов
  renderEnemies(enemies) {
    for (const enemy of enemies) {
      this.ctx.save();
      
      // Тень
      this.ctx.beginPath();
      this.ctx.fillStyle = 'rgba(0,0,0,0.18)';
      this.ctx.arc(enemy.x + 2, enemy.y + 2, enemy.radius + 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Основная форма
      this.ctx.beginPath();
      this.ctx.fillStyle = enemy.color;
      
      if (enemy.type === 'circle') {
        this.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (enemy.type === 'square') {
        this.ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius, enemy.radius * 2, enemy.radius * 2);
      } else if (enemy.type === 'triangle') {
        this.ctx.moveTo(enemy.x, enemy.y - enemy.radius);
        this.ctx.lineTo(enemy.x - enemy.radius, enemy.y + enemy.radius);
        this.ctx.lineTo(enemy.x + enemy.radius, enemy.y + enemy.radius);
        this.ctx.closePath();
        this.ctx.fill();
      }
      
      // Полоска здоровья
      this.renderEnemyHealthBar(enemy);
      
      this.ctx.restore();
    }
  }

  // Рендеринг полоски здоровья врага
  renderEnemyHealthBar(enemy) {
    const barWidth = enemy.radius * 2;
    const barHeight = 5;
    const barY = enemy.y - enemy.radius - 8;
    
    // Фон полоски
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(enemy.x - enemy.radius, barY, barWidth, barHeight);
    
    // Здоровье
    this.ctx.fillStyle = '#7cf59a';
    const healthPercent = clamp(enemy.hp / enemy.maxHp, 0, 1);
    this.ctx.fillRect(enemy.x - enemy.radius, barY, barWidth * healthPercent, barHeight);
  }

  // Рендеринг пуль
  renderBullets(bullets) {
    for (const bullet of bullets) {
      this.ctx.save();
      this.ctx.fillStyle = CONFIG.BULLETS.color;
      this.ctx.beginPath();
      this.ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  // Рендеринг игрока
  renderPlayer(player, mousePos) {
    this.ctx.save();
    
    // Фоновый круг
    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgba(110,168,255,0.06)';
    this.ctx.arc(player.x, player.y, player.radius + 10, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Направление взгляда к мыши
    const dx = mousePos.x - player.x;
    const dy = mousePos.y - player.y;
    const m = Math.hypot(dx, dy) || 1;
    const nx = dx / m;
    const ny = dy / m;
    
    const eyeOffset = player.radius * 0.5;
    
    // Основное тело игрока
    this.ctx.beginPath();
    this.ctx.fillStyle = '#6ea8ff';
    this.ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // "Глаз" (направление)
    this.ctx.beginPath();
    this.ctx.fillStyle = '#022';
    this.ctx.arc(player.x + nx * eyeOffset, player.y + ny * eyeOffset, player.radius * 0.4, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Прицел
    this.ctx.beginPath();
    this.ctx.fillStyle = '#022';
    this.ctx.arc(player.x + nx * 6, player.y + ny * 6, 4, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Рамка неуязвимости
    if (player.buffs.Invuln && player.buffs.Invuln.timeLeft > 0) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#b39dfc';
      this.ctx.lineWidth = 3;
      this.ctx.arc(player.x, player.y, player.radius + 6, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  // Рендеринг отладочной информации (опционально)
  renderDebugInfo(gameData) {
    this.ctx.save();
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '12px monospace';
    
    let y = 20;
    const info = [
      `Enemies: ${gameData.enemies.length}`,
      `Bullets: ${gameData.bullets.length}`,
      `Pickups: ${gameData.pickups.length}`,
      `Player HP: ${Math.floor(gameData.player.hp)}`,
      `Wave: ${gameData.wave}`,
      `Score: ${gameData.score}`
    ];
    
    for (const line of info) {
      this.ctx.fillText(line, 10, y);
      y += 15;
    }
    
    this.ctx.restore();
  }
}
