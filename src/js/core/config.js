export const CONFIG = {
  // Размеры экрана
  CSS_WIDTH: 900,
  CSS_HEIGHT: 600,

  PLAYER: {
    radius: 30,
    maxHp: 100,
    baseSpeed: 140,
    baseDmg: 10,
    bulletSpeed: 380,
    fireCooldownBase: 0.45,
    maxExtraLives: 3
  },

  ENEMIES: {
    baseHp: 18,
    baseSpeed: 40,
    spawnMargin: 40,
    types: {
      basic: {
        speedModifier: 1,
        hpModifier: 1,
        radiusRange: [15, 20],
        color: '#ff6b6b',
        imageKey: 'greenZombie'
      },
      giant: {
        speedModifier: 0.6,
        hpModifier: 1.6,
        radiusRange: [30, 40],
        color: '#ff9b6b',
        imageKey: 'cyanZombie'
      },
      speedster: {
        speedModifier: 1.35,
        hpModifier: 0.75,
        radiusRange: [12, 17],
        color: '#ffd166',
        imageKey: 'purpleZombie'
      }
    }
  },

  BULLETS: {
    radius: 4,
    color: '#ffd166'
  },

  PICKUPS: {
    dropChance: 0.4,
    radius: 15,
    ttl: 18, // время жизни 
    types: {
      Speed: { color: '#7cf59a', duration: [6, 12], stackable: true, maxStacks: 3, imageKey: 'speedPowerup' },
      DoubleShot: { color: '#ffd166', duration: [6, 12], stackable: true, maxStacks: 3, imageKey: 'speedPowerup' },
      ExtraLife: { color: '#9ad6ff', instant: true, imageKey: 'healthPowerup' },
      Invuln: { color: '#b39dfc', duration: 5, stackable: false, imageKey: 'invulPowerup' },
      Rapid: { color: '#ff9b6b', duration: [6, 12], value: 1.8, imageKey: 'speedPowerup' },
      Power: { color: '#ff6b6b', duration: [6, 12], value: 1.8, imageKey: 'speedPowerup' }
    }
  },

  WAVE: {
    baseEnemyCount: 3,
    enemyCountMultiplier: 1.4,
    spawnInterval: [0.45, 0.95],
    minuteBonus: 0.2,
    speedIncrease: 0.06
  },

  AUDIO: {
    fire: { frequency: 900, duration: 0.13, volume: 0.14 },
    enemyDeath: { frequencies: [220, 440], duration: 0.28, volume: 0.18 },
    pickup: { frequency: 660, duration: 0.24, volume: 0.16 }
  }
};
