import { CONFIG } from './config.js';
import { Player } from '../entities/Player.js';
import { EnemySystem } from '../systems/EnemySystem.js';
import { BulletSystem } from '../systems/BulletSystem.js';
import { PickupSystem } from '../systems/PickupSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { InputSystem } from '../systems/InputSystem.js';
import { Renderer } from '../systems/Renderer.js';
import { UIManager } from '../ui/UIManager.js';

// Основной класс игры
export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    // Состояние игры
    this.gameState = 'menu';
    this.lastTime = null;
    this.rafId = null;
    this.score = 0;
    this.wave = 0;
    this.elapsedTime = 0;
    
    // Спавн врагов
    this.evilSpawn = 0;
    this.spawnTimer = 0;
    
    // Инициализация систем
    this.initializeSystems();
    this.setupCallbacks();
    this.startGameLoop();
  }

  // Инициализация всех систем
  initializeSystems() {
    // Создание сущностей и систем
    this.player = new Player(CONFIG.CSS_WIDTH / 2, CONFIG.CSS_HEIGHT / 2);
    this.enemySystem = new EnemySystem();
    this.bulletSystem = new BulletSystem();
    this.pickupSystem = new PickupSystem();
    this.audioSystem = new AudioSystem();
    this.inputSystem = new InputSystem(this.canvas, this);
    this.renderer = new Renderer(this.canvas, this.ctx);
    this.uiManager = new UIManager();
    
    this.uiManager.initialize();
  }

  // Настройка коллбеков между системами
  setupCallbacks() {
    // Коллбеки ввода
    this.inputSystem.setShootCallback((x, y) => this.handleShoot(x, y));
    this.inputSystem.setPauseCallback(() => this.handlePause());
    
    // Коллбеки UI
    this.uiManager.setCallbacks({
      startGame: () => this.startNewGame(),
      pauseGame: () => this.handlePause(),
      restartGame: () => this.startNewGame()
    });
  }

  // Обработка выстрела
  handleShoot(x, y) {
    if (this.gameState !== 'running') return;
    
    const bullets = this.player.tryShoot(x, y);
    if (bullets) {
      this.bulletSystem.addBullets(bullets);
      this.audioSystem.playSound('fire');
    }
  }

  // Обработка паузы
  handlePause() {
    if (this.gameState === 'running') {
      this.pauseGame();
    } else if (this.gameState === 'paused') {
      this.resumeGame();
    }
  }

  // Основной цикл обновления
  update(dt) {
    if (this.gameState !== 'running') return;
    
    this.elapsedTime += dt;
    
    // Обновление игрока
    const movementVector = this.inputSystem.getMovementVector();
    this.player.update(dt, movementVector);
    
    // Автоматическая стрельба при зажатой мыши
    if (this.inputSystem.isMouseDown()) {
      const mousePos = this.inputSystem.getMousePos();
      this.handleShoot(mousePos.x, mousePos.y);
    }
    
    // Обновление пуль и проверка попаданий
    const bulletResult = this.bulletSystem.update(dt, this.enemySystem);
    if (bulletResult && bulletResult.type === 'enemyKilled') {
      this.score += bulletResult.score;
      this.audioSystem.playSound('enemyDeath');
      this.pickupSystem.spawnPickup(bulletResult.enemy.x, bulletResult.enemy.y);
    }
    
    // Обновление врагов
    const timeScale = 1 + Math.floor(this.elapsedTime / 60) * 0.06;
    this.enemySystem.update(dt, this.player, timeScale);
    
    // Проверка столкновений с игроком
    if (this.enemySystem.checkPlayerCollision(this.player)) {
      const damaged = this.player.takeDamage(10);
      // Враги уже отброшены в enemySystem.checkPlayerCollision
    }
    
    // Обновление подбираемых предметов
    const pickupResults = this.pickupSystem.update(dt, this.player);
    for (const result of pickupResults) {
      if (result.type === 'pickupCollected') {
        this.audioSystem.playSound('pickup');
      }
    }
    
    // Обновление спавна врагов
    this.updateWaveSpawning(dt);
    
    // Проверка смерти игрока
    const deathResult = this.player.handleDeath();
    if (deathResult === 'gameOver') {
      this.gameOver();
    }
    
    // Обновление UI
    this.uiManager.updateHUD(this.player, this.wave, this.score);
  }

  // Обновление спавна волн
  updateWaveSpawning(dt) {
    if (this.evilSpawn > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const minuteBonus = Math.floor(this.elapsedTime / 60);
        const spawnMany = Math.min(4, 1 + Math.floor(minuteBonus / 2));
        
        for (let i = 0; i < spawnMany; i++) {
          this.enemySystem.spawnEnemyForWave(this.wave);
        }
        
        this.evilSpawn--;
        this.spawnTimer = 0.45 + Math.random() * 0.5;
      }
    } else {
      if (this.enemySystem.getCount() === 0) {
        this.wave++;
        this.startWave(this.wave);
      }
    }
  }

  // Начало новой волны
  startWave(waveNum) {
    this.wave = waveNum;
    const minuteFactor = 1 + Math.floor(this.elapsedTime / 60) * CONFIG.WAVE.minuteBonus;
    this.evilSpawn = Math.max(4, Math.floor(CONFIG.WAVE.baseEnemyCount + waveNum * CONFIG.WAVE.enemyCountMultiplier * minuteFactor));
    this.spawnTimer = 0.4;
  }

  // Рендеринг
  render() {
    const gameData = {
      player: this.player,
      enemies: this.enemySystem.getEnemies(),
      bullets: this.bulletSystem.getBullets(),
      pickups: this.pickupSystem.getPickups(),
      mousePos: this.inputSystem.getMousePos(),
      wave: this.wave,
      score: this.score
    };
    
    this.renderer.render(gameData);
  }

  // Основной игровой цикл
  gameLoop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;
    
    this.update(dt);
    this.render();
    
    this.rafId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  // Запуск игрового цикла
  startGameLoop() {
    if (!this.rafId) {
      this.rafId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }
  }

  // Остановка игрового цикла
  stopGameLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // Начало новой игры
  startNewGame() {
    this.score = 0;
    this.wave = 0;
    this.elapsedTime = 0;
    this.lastTime = null;
    
    // Сброс всех систем
    this.player.reset();
    this.enemySystem.clear();
    this.bulletSystem.clear();
    this.pickupSystem.clear();
    
    // Начало первой волны
    this.startWave(1);
    
    // Обновление состояния
    this.gameState = 'running';
    this.uiManager.setButtonStates(this.gameState);
    this.uiManager.hideGameOver();
    
    // Запуск игрового цикла
    this.startGameLoop();
  }

  // Пауза игры
  pauseGame() {
    if (this.gameState !== 'running') return;
    this.gameState = 'paused';
    this.uiManager.setButtonStates(this.gameState);
  }

  // Возобновление игры
  resumeGame() {
    if (this.gameState !== 'paused') return;
    this.gameState = 'running';
    this.uiManager.setButtonStates(this.gameState);
  }

  // Окончание игры
  gameOver() {
    this.gameState = 'gameover';
    this.uiManager.setButtonStates(this.gameState);
    this.uiManager.showGameOver(this.wave, this.score);
  }

  // Получение текущего состояния игры
  getGameState() {
    return this.gameState;
  }
}
