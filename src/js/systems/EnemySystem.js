import { CONFIG } from '../core/config.js';
import { rand, randInt, clamp, getDirection } from '../utils/math.js';

// Система врагов
export class EnemySystem {
  constructor() {
    this.enemies = [];
  }

  // Создание врага для определенной волны
  spawnEnemyForWave(waveNum, typeOverride = null) {
    const config = CONFIG.ENEMIES;
    const baseHp = config.baseHp + Math.floor(waveNum * 8);
    const baseSpeed = clamp(config.baseSpeed + waveNum * 6 + Math.random() * 30, config.baseSpeed, 260);
    
    // Случайная позиция спавна на краю экрана
    const { x, y } = this.getSpawnPosition();
    
    // Выбор типа врага
    const typeChance = Math.min(0.25 + waveNum * 0.02, 0.85);
    const types = Object.keys(config.types);
    const type = typeOverride || (Math.random() < typeChance ? types[randInt(0, types.length - 1)] : 'circle');
    
    // Настройки по типу
    const typeConfig = config.types[type];
    const radius = randInt(...typeConfig.radiusRange);
    const speed = baseSpeed * typeConfig.speedModifier;
    const hp = Math.floor(baseHp * typeConfig.hpModifier);

    const enemy = {
      x,
      y,
      radius,
      hp,
      maxHp: hp,
      speed,
      type,
      color: typeConfig.color
    };

    this.enemies.push(enemy);
    return enemy;
  }

  // Получение случайной позиции спавна
  getSpawnPosition() {
    const margin = CONFIG.ENEMIES.spawnMargin;
    const side = randInt(0, 3);
    
    switch (side) {
      case 0: // Левая сторона
        return { x: -margin, y: rand(-margin, CONFIG.CSS_HEIGHT + margin) };
      case 1: // Правая сторона
        return { x: CONFIG.CSS_WIDTH + margin, y: rand(-margin, CONFIG.CSS_HEIGHT + margin) };
      case 2: // Верх
        return { x: rand(-margin, CONFIG.CSS_WIDTH + margin), y: -margin };
      case 3: // Низ
        return { x: rand(-margin, CONFIG.CSS_WIDTH + margin), y: CONFIG.CSS_HEIGHT + margin };
      default:
        return { x: 0, y: 0 };
    }
  }

  // Обновление всех врагов
  update(dt, player, timeScale) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      this.updateEnemy(enemy, dt, player, timeScale);
    }
  }

  // Обновление отдельного врага
  updateEnemy(enemy, dt, player, timeScale) {
    // Движение к игроку
    const direction = getDirection(enemy, player);
    const actualSpeed = enemy.speed * timeScale;
    
    enemy.x += direction.x * actualSpeed * dt;
    enemy.y += direction.y * actualSpeed * dt;
  }

  // Проверка столкновения с игроком
  checkPlayerCollision(player) {
    for (const enemy of this.enemies) {
      const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      if (distance <= enemy.radius + player.radius + 2) {
        // Отбрасываем врага от игрока
        const direction = getDirection(player, enemy);
        enemy.x += direction.x * 24;
        enemy.y += direction.y * 24;
        return true;
      }
    }
    return false;
  }

  // Нанесение урона врагу
  damageEnemy(enemyIndex, damage) {
    if (enemyIndex < 0 || enemyIndex >= this.enemies.length) return false;
    
    const enemy = this.enemies[enemyIndex];
    enemy.hp -= damage;
    
    if (enemy.hp <= 0) {
      const deadEnemy = this.enemies.splice(enemyIndex, 1)[0];
      return { killed: true, enemy: deadEnemy };
    }
    
    return { killed: false, enemy };
  }

  // Получение всех врагов
  getEnemies() {
    return this.enemies;
  }

  // Очистка всех врагов
  clear() {
    this.enemies = [];
  }

  // Получение количества врагов
  getCount() {
    return this.enemies.length;
  }

  // Поиск ближайшего врага к точке
  findClosestEnemy(x, y) {
    if (this.enemies.length === 0) return null;
    
    let closest = this.enemies[0];
    let minDist = Math.hypot(closest.x - x, closest.y - y);
    
    for (let i = 1; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      const dist = Math.hypot(enemy.x - x, enemy.y - y);
      if (dist < minDist) {
        minDist = dist;
        closest = enemy;
      }
    }
    
    return closest;
  }
}
