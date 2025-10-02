import { CONFIG } from '../core/config.js';
import { rand, randInt } from '../utils/math.js';

// Система подбираемых предметов (бафов)
export class PickupSystem {
  constructor() {
    this.pickups = [];
  }

  // Создание pickup в позиции врага
  spawnPickup(x, y) {
    if (Math.random() > CONFIG.PICKUPS.dropChance) return null;
    
    const types = Object.keys(CONFIG.PICKUPS.types);
    const type = types[randInt(0, types.length - 1)];
    const config = CONFIG.PICKUPS.types[type];
    
    let duration;
    if (config.instant) {
      duration = 0; // ExtraLife мгновенный
    } else if (Array.isArray(config.duration)) {
      duration = rand(...config.duration);
    } else {
      duration = config.duration;
    }
    
    const pickup = {
      x,
      y,
      type,
      duration,
      ttl: CONFIG.PICKUPS.ttl,
      color: config.color
    };
    
    this.pickups.push(pickup);
    return pickup;
  }

  // Обновление всех pickups
  update(dt, player) {
    const results = [];
    
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pickup = this.pickups[i];
      
      // Уменьшаем время жизни
      pickup.ttl -= dt;
      
      // Удаляем истекшие
      if (pickup.ttl <= 0) {
        this.pickups.splice(i, 1);
        continue;
      }
      
      // Проверяем подбор игроком
      const distance = Math.hypot(pickup.x - player.x, pickup.y - player.y);
      if (distance < player.radius + CONFIG.PICKUPS.radius + 2) {
        const applied = player.applyBuff(pickup);
        this.pickups.splice(i, 1);
        
        if (applied) {
          results.push({
            type: 'pickupCollected',
            pickupType: pickup.type
          });
        }
      }
    }
    
    return results;
  }

  // Получение всех pickups
  getPickups() {
    return this.pickups;
  }

  // Очистка всех pickups
  clear() {
    this.pickups = [];
  }

  // Получение количества pickups
  getCount() {
    return this.pickups.length;
  }

  // Удаление pickup по индексу
  removePickup(index) {
    if (index >= 0 && index < this.pickups.length) {
      this.pickups.splice(index, 1);
    }
  }

  // Принудительное создание pickup определенного типа (для тестирования)
  forceSpawnPickup(x, y, type) {
    const config = CONFIG.PICKUPS.types[type];
    if (!config) return null;
    
    let duration;
    if (config.instant) {
      duration = 0;
    } else if (Array.isArray(config.duration)) {
      duration = rand(...config.duration);
    } else {
      duration = config.duration;
    }
    
    const pickup = {
      x,
      y,
      type,
      duration,
      ttl: CONFIG.PICKUPS.ttl,
      color: config.color
    };
    
    this.pickups.push(pickup);
    return pickup;
  }
}
