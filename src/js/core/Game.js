import { CONFIG } from './config.js';
import { Player } from '../entities/Player.js';
import { EnemySystem } from '../systems/EnemySystem.js';
import { BulletSystem } from '../systems/BulletSystem.js';
import { PickupSystem } from '../systems/PickupSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { InputSystem } from '../systems/InputSystem.js';
import { Renderer } from '../systems/Renderer.js';
import { UIManager } from '../ui/UIManager.js';

export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    this.gameState = 'loading';
    this.lastTime = null;
    this.rafId = null;
    this.score = 0;
    this.wave = 0;
    this.elapsedTime = 0;
    
    this.evilSpawn = 0;
    this.spawnTimer = 0;
    
    this.initialize();
  }

  async initialize() {
    this.uiManager = new UIManager();
    this.uiManager.initialize();
    this.uiManager.setButtonStates('loading');
    
    await this.initializeSystems();
    this.setupCallbacks();
    this.gameState = 'menu';
    this.uiManager.setButtonStates('menu');
    this.startGameLoop();
  }

  async initializeSystems() {
    this.player = new Player(CONFIG.CSS_WIDTH / 2, CONFIG.CSS_HEIGHT / 2);
    this.enemySystem = new EnemySystem();
    this.bulletSystem = new BulletSystem();
    this.pickupSystem = new PickupSystem();
    this.audioSystem = new AudioSystem();
    this.inputSystem = new InputSystem(this.canvas, this);
    this.renderer = new Renderer(this.canvas, this.ctx);
    
    await this.waitForImagesLoaded();
  }

  async waitForImagesLoaded() {
    const checkInterval = 50; // мс
    
    while (!this.renderer.imagesLoaded) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    console.log("Images loaded, game ready to start");
  }

  setupCallbacks() {
    this.inputSystem.setShootCallback((x, y) => this.handleShoot(x, y));
    this.inputSystem.setPauseCallback(() => this.handlePause());
    
    this.uiManager.setCallbacks({
      startGame: () => this.startNewGame(),
      pauseGame: () => this.handlePause(),
      restartGame: () => this.startNewGame()
    });
  }

  handleShoot(x, y) {
    if (this.gameState !== 'running') return;
    
    const bullets = this.player.tryShoot(x, y);
    if (bullets) {
      this.bulletSystem.addBullets(bullets);
      this.audioSystem.playSound('fire');
    }
  }

  handlePause() {
    if (this.gameState === 'running') {
      this.pauseGame();
    } else if (this.gameState === 'paused') {
      this.resumeGame();
    }
  }

  update(dt) {
    if (this.gameState !== 'running') return;
    
    this.elapsedTime += dt;
    
    const movementVector = this.inputSystem.getMovementVector();
    this.player.update(dt, movementVector);
    
    if (this.inputSystem.isMouseDown()) {
      const mousePos = this.inputSystem.getMousePos();
      this.handleShoot(mousePos.x, mousePos.y);
    }
    
    const bulletResult = this.bulletSystem.update(dt, this.enemySystem);
    if (bulletResult && bulletResult.type === 'enemyKilled') {
      this.score += bulletResult.score;
      this.audioSystem.playSound('enemyDeath');
      this.pickupSystem.spawnPickup(bulletResult.enemy.x, bulletResult.enemy.y);
    }
    
    // Обновление врагов
    const timeScale = 1 + Math.floor(this.elapsedTime / 60) * 0.06;
    this.enemySystem.update(dt, this.player, timeScale);
    
    if (this.enemySystem.checkPlayerCollision(this.player)) {
      const damaged = this.player.takeDamage(10);
    }
    
    const pickupResults = this.pickupSystem.update(dt, this.player);
    for (const result of pickupResults) {
      if (result.type === 'pickupCollected') {
        this.audioSystem.playSound('pickup');
      }
    }
    
    this.updateWaveSpawning(dt);
    
    const deathResult = this.player.handleDeath();
    if (deathResult === 'gameOver') {
      this.gameOver();
    }
    
    this.uiManager.updateHUD(this.player, this.wave, this.score);
  }

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

  startWave(waveNum) {
    this.wave = waveNum;
    const minuteFactor = 1 + Math.floor(this.elapsedTime / 60) * CONFIG.WAVE.minuteBonus;
    this.evilSpawn = Math.max(4, Math.floor(CONFIG.WAVE.baseEnemyCount + waveNum * CONFIG.WAVE.enemyCountMultiplier * minuteFactor));
    this.spawnTimer = 0.4;
  }

  render() {
    if (this.gameState === 'loading') {
      this.renderLoadingScreen();
      return;
    }

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

  renderLoadingScreen() {
    this.ctx.clearRect(0, 0, CONFIG.CSS_WIDTH, CONFIG.CSS_HEIGHT);
    
    this.ctx.save();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    
    const status = this.renderer ? this.renderer.getImagesLoadedStatus() : { loaded: false, count: 0 };
    
    this.ctx.fillText(
      'Загрузка изображений...', 
      CONFIG.CSS_WIDTH / 2, 
      CONFIG.CSS_HEIGHT / 2 - 20
    );
    
    this.ctx.font = '16px Arial';
    this.ctx.fillText(
      `Загружено: ${status.count} изображений`, 
      CONFIG.CSS_WIDTH / 2, 
      CONFIG.CSS_HEIGHT / 2 + 20
    );
    this.ctx.restore();
  }

  gameLoop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;
    
    this.update(dt);
    this.render();
    
    this.rafId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  startGameLoop() {
    if (!this.rafId) {
      this.rafId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }
  }

  stopGameLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  startNewGame() {
    this.score = 0;
    this.wave = 0;
    this.elapsedTime = 0;
    this.lastTime = null;
    
    this.player.reset();
    this.enemySystem.clear();
    this.bulletSystem.clear();
    this.pickupSystem.clear();
    
    this.startWave(1);
    
    this.gameState = 'running';
    this.uiManager.setButtonStates(this.gameState);
    this.uiManager.hideGameOver();
    
    this.startGameLoop();
  }

  pauseGame() {
    if (this.gameState !== 'running') return;
    this.gameState = 'paused';
    this.uiManager.setButtonStates(this.gameState);
  }

  resumeGame() {
    if (this.gameState !== 'paused') return;
    this.gameState = 'running';
    this.uiManager.setButtonStates(this.gameState);
  }

  gameOver() {
    this.gameState = 'gameover';
    this.uiManager.setButtonStates(this.gameState);
    this.uiManager.showGameOver(this.wave, this.score);
  }

  getGameState() {
    return this.gameState;
  }
}
