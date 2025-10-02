// Конфигурация игры
export const CONFIG = {
  // Размеры экрана
  CSS_WIDTH: 900,
  CSS_HEIGHT: 600,

  // Настройки игрока
  PLAYER: {
    radius: 14,
    maxHp: 100,
    baseSpeed: 140,
    baseDmg: 20,
    bulletSpeed: 380,
    fireCooldownBase: 0.45,
    maxExtraLives: 3
  },

  // Настройки врагов
  ENEMIES: {
    baseHp: 18,
    baseSpeed: 40,
    spawnMargin: 40,
    types: {
      circle: {
        speedModifier: 1,
        hpModifier: 1,
        radiusRange: [10, 16],
        color: '#ff6b6b'
      },
      square: {
        speedModifier: 0.6,
        hpModifier: 1.6,
        radiusRange: [14, 20],
        color: '#ff9b6b'
      },
      triangle: {
        speedModifier: 1.35,
        hpModifier: 0.75,
        radiusRange: [10, 14],
        color: '#ffd166'
      }
    }
  },

  // Настройки пуль
  BULLETS: {
    radius: 4,
    color: '#ffd166'
  },

  // Настройки бафов
  PICKUPS: {
    dropChance: 0.4,
    radius: 10,
    ttl: 18,
    types: {
      Speed: { color: '#7cf59a', duration: [6, 12], stackable: true, maxStacks: 3 },
      DoubleShot: { color: '#ffd166', duration: [6, 12], stackable: true, maxStacks: 3 },
      ExtraLife: { color: '#9ad6ff', instant: true },
      Invuln: { color: '#b39dfc', duration: 5, stackable: false },
      Rapid: { color: '#ff9b6b', duration: [6, 12], value: 1.8 },
      Power: { color: '#ff6b6b', duration: [6, 12], value: 1.8 }
    }
  },

  // Настройки волн
  WAVE: {
    baseEnemyCount: 3,
    enemyCountMultiplier: 1.4,
    spawnInterval: [0.45, 0.95],
    minuteBonus: 0.2,
    speedIncrease: 0.06
  },

  // Аудио частоты
  AUDIO: {
    fire: { frequency: 900, duration: 0.13, volume: 0.14 },
    enemyDeath: { frequencies: [220, 440], duration: 0.28, volume: 0.18 },
    pickup: { frequency: 660, duration: 0.24, volume: 0.16 }
  }
};
