import { CONFIG } from '../core/config.js';
import { circleHit } from '../utils/math.js';

// Система пуль
export class BulletSystem {
  constructor() {
    this.bullets = [];
  }

  // Добавление пуль
  addBullets(newBullets) {
    if (Array.isArray(newBullets)) {
      this.bullets.push(...newBullets);
    } else {
      this.bullets.push(newBullets);
    }
  }

  // Обновление всех пуль
  update(dt, enemySystem) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      // Движение пули
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      
      // Проверка выхода за границы экрана
      if (this.isBulletOutOfBounds(bullet)) {
        this.bullets.splice(i, 1);
        continue;
      }
      
      // Проверка столкновений с врагами
      const hitResult = this.checkEnemyCollisions(bullet, enemySystem);
      if (hitResult.hit) {
        this.bullets.splice(i, 1);
        
        if (hitResult.killed) {
          // Возвращаем информацию о убитом враге для обработки (очки, звук, pickup)
          return {
            type: 'enemyKilled',
            enemy: hitResult.enemy,
            score: 10
          };
        }
      }
    }
    
    return null;
  }

  // Проверка выхода пули за границы
  isBulletOutOfBounds(bullet) {
    const margin = 20;
    return bullet.x < -margin || 
           bullet.x > CONFIG.CSS_WIDTH + margin || 
           bullet.y < -margin || 
           bullet.y > CONFIG.CSS_HEIGHT + margin;
  }

  // Проверка столкновений с врагами
  checkEnemyCollisions(bullet, enemySystem) {
    const enemies = enemySystem.getEnemies();
    
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      
      if (circleHit(bullet, enemy)) {
        const result = enemySystem.damageEnemy(j, bullet.dmg);
        return {
          hit: true,
          killed: result.killed,
          enemy: result.enemy
        };
      }
    }
    
    return { hit: false };
  }

  // Получение всех пуль
  getBullets() {
    return this.bullets;
  }

  // Очистка всех пуль
  clear() {
    this.bullets = [];
  }

  // Получение количества пуль
  getCount() {
    return this.bullets.length;
  }

  // Удаление пули по индексу
  removeBullet(index) {
    if (index >= 0 && index < this.bullets.length) {
      this.bullets.splice(index, 1);
    }
  }
}
