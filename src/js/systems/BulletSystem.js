import { CONFIG } from '../core/config.js';
import { circleHit } from '../utils/math.js';

export class BulletSystem {
  constructor() {
    this.bullets = [];
  }

  addBullets(newBullets) {
    if (Array.isArray(newBullets)) {
      this.bullets.push(...newBullets);
    } else {
      this.bullets.push(newBullets);
    }
  }

  update(dt, enemySystem) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      
      if (this.isBulletOutOfBounds(bullet)) {
        this.bullets.splice(i, 1);
        continue;
      }
      
      const hitResult = this.checkEnemyCollisions(bullet, enemySystem);
      if (hitResult.hit) {
        this.bullets.splice(i, 1);
        
        if (hitResult.killed) {
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

  isBulletOutOfBounds(bullet) {
    const margin = 20;
    return bullet.x < -margin || 
           bullet.x > CONFIG.CSS_WIDTH + margin || 
           bullet.y < -margin || 
           bullet.y > CONFIG.CSS_HEIGHT + margin;
  }

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

  getBullets() {
    return this.bullets;
  }

  clear() {
    this.bullets = [];
  }

  getCount() {
    return this.bullets.length;
  }

  removeBullet(index) {
    if (index >= 0 && index < this.bullets.length) {
      this.bullets.splice(index, 1);
    }
  }
}
