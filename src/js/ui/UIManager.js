import { clamp } from '../utils/math.js';

// Менеджер пользовательского интерфейса
export class UIManager {
  constructor() {
    this.initializeElements();
    this.setupEventListeners();
  }

  // Инициализация элементов DOM
  initializeElements() {
    // HUD элементы
    this.hpfill = document.getElementById('hpfill');
    this.uiWave = document.getElementById('uiWave');
    this.uiScore = document.getElementById('uiScore');
    this.uiBuffs = document.getElementById('uiBuffs');
    this.uiLives = document.getElementById('uiLives');
    
    // Статистика
    this.statHP = document.getElementById('statHP');
    this.statSpeed = document.getElementById('statSpeed');
    this.statDmg = document.getElementById('statDmg');
    this.statFire = document.getElementById('statFire');
    
    // Кнопки
    this.btnStart = document.getElementById('btnStart');
    this.btnPause = document.getElementById('btnPause');
    this.btnRestart = document.getElementById('btnRestart');
    this.btnReadme = document.getElementById('btnReadme');
    
    // Оверлеи и модалки
    this.overlayGameOver = document.getElementById('overlayGameOver');
    this.goText = document.getElementById('goText');
    this.btnGoRestart = document.getElementById('btnGoRestart');
    this.modalReadme = document.getElementById('modalReadme');
    this.readmeTextEl = document.getElementById('readmeText');
    this.btnDownloadReadmeModal = document.getElementById('downloadReadmeBtn');
    this.btnDownloadReadmeSidebar = document.getElementById('btnDownloadReadme');
    this.closeReadmeBtn = document.getElementById('closeReadme');
  }

  // Настройка обработчиков событий кнопок
  setupEventListeners() {
    this.callbacks = {};
    
    if (this.btnStart) {
      this.btnStart.addEventListener('click', () => {
        if (this.callbacks.startGame) this.callbacks.startGame();
      });
    }
    
    if (this.btnPause) {
      this.btnPause.addEventListener('click', () => {
        if (this.callbacks.pauseGame) this.callbacks.pauseGame();
      });
    }
    
    if (this.btnRestart) {
      this.btnRestart.addEventListener('click', () => {
        if (this.callbacks.restartGame) this.callbacks.restartGame();
      });
    }
    
    if (this.btnGoRestart) {
      this.btnGoRestart.addEventListener('click', () => {
        this.hideGameOver();
        if (this.callbacks.restartGame) this.callbacks.restartGame();
      });
    }
    
    if (this.btnReadme) {
      this.btnReadme.addEventListener('click', () => this.showReadme());
    }
    
    if (this.btnDownloadReadmeModal) {
      this.btnDownloadReadmeModal.addEventListener('click', () => this.downloadReadme());
    }
    
    if (this.btnDownloadReadmeSidebar) {
      this.btnDownloadReadmeSidebar.addEventListener('click', () => this.downloadReadme());
    }
    
    if (this.closeReadmeBtn) {
      this.closeReadmeBtn.addEventListener('click', () => this.hideReadme());
    }
    
    if (this.modalReadme) {
      this.modalReadme.addEventListener('click', (e) => {
        if (e.target === this.modalReadme) this.hideReadme();
      });
    }
  }

  // Обновление HUD
  updateHUD(player, wave, score) {
    const stats = player.getStats();
    
    // Полоска здоровья
    if (this.hpfill) {
      const hpPercent = clamp((stats.hp / stats.maxHp) * 100, 0, 100);
      this.hpfill.style.width = `${hpPercent}%`;
    }
    
    // Основная информация
    if (this.uiWave) this.uiWave.textContent = wave;
    if (this.uiScore) this.uiScore.textContent = score;
    if (this.uiLives) this.uiLives.textContent = stats.lives;
    
    // Детальная статистика
    if (this.statHP) this.statHP.textContent = stats.hp;
    if (this.statSpeed) this.statSpeed.textContent = stats.speed;
    if (this.statDmg) this.statDmg.textContent = stats.damage;
    if (this.statFire) this.statFire.textContent = stats.fireRate;
    
    // Бафы
    this.renderBuffs(player.buffs);
  }

  // Отображение активных бафов
  renderBuffs(buffs) {
    if (!this.uiBuffs) return;
    
    this.uiBuffs.innerHTML = '';
    
    for (const buffName of Object.keys(buffs)) {
      const buff = buffs[buffName];
      const el = document.createElement('div');
      el.className = 'buff';
      
      let text = '';
      if (buffName === 'Speed') {
        const multiplier = (1 + 0.7 * buff.stacks).toFixed(1);
        text = `Speed x${multiplier} ${Math.ceil(buff.timeLeft || 0)}s`;
      } else if (buffName === 'DoubleShot') {
        const counts = [1, 2, 4, 8];
        const bulletCount = counts[clamp(buff.stacks, 0, 3)];
        text = `DoubleShot x${bulletCount} ${Math.ceil(buff.timeLeft || 0)}s`;
      } else if (buffName === 'Invuln') {
        text = `Invuln ${Math.ceil(buff.timeLeft || 0)}s`;
      } else if (buffName === 'Rapid') {
        text = `Rapid ${Math.ceil(buff.timeLeft || 0)}s`;
      } else if (buffName === 'Power') {
        text = `Power ${Math.ceil(buff.timeLeft || 0)}s`;
      }
      
      el.textContent = text;
      this.uiBuffs.appendChild(el);
    }
  }

  // Управление состоянием кнопок
  setButtonStates(gameState) {
    if (gameState === 'menu' || gameState === 'gameover') {
      if (this.btnStart) {
        this.btnStart.disabled = false;
        this.btnStart.textContent = 'Старт';
      }
      if (this.btnPause) this.btnPause.disabled = true;
      if (this.btnRestart) this.btnRestart.disabled = true;
    } else if (gameState === 'running') {
      if (this.btnStart) this.btnStart.disabled = true;
      if (this.btnPause) {
        this.btnPause.disabled = false;
        this.btnPause.textContent = 'Пауза';
      }
      if (this.btnRestart) this.btnRestart.disabled = false;
    } else if (gameState === 'paused') {
      if (this.btnPause) this.btnPause.textContent = 'Возобновить';
    }
  }

  // Показ экрана Game Over
  showGameOver(wave, score) {
    if (this.overlayGameOver) {
      this.overlayGameOver.style.display = 'flex';
    }
    if (this.goText) {
      this.goText.textContent = `Вы дошли до волны ${wave}. Набрано очков: ${score}.`;
    }
  }

  // Скрытие экрана Game Over
  hideGameOver() {
    if (this.overlayGameOver) {
      this.overlayGameOver.style.display = 'none';
    }
  }

  // Показ README
  showReadme() {
    const readmeText = `# Top-Down Waves

Описание:
Top-Down Waves — аркадная survival-игра с видом сверху. Игрок управляет персонажем (WASD) и автоматически стреляет в ближайших врагов.
Цель — продержаться как можно дольше, уничтожая волны противников и подбирая бафы.

Полный README доступен в файле README.md в той же папке проекта.`;
    
    if (this.readmeTextEl) {
      this.readmeTextEl.textContent = readmeText;
    }
    if (this.modalReadme) {
      this.modalReadme.style.display = 'flex';
    }
  }

  // Скрытие README
  hideReadme() {
    if (this.modalReadme) {
      this.modalReadme.style.display = 'none';
    }
  }

  // Скачивание README
  downloadReadme() {
    const readmeText = `# Top-Down Waves

Описание:
Top-Down Waves — аркадная survival-игра с видом сверху. Игрок управляет персонажем (WASD) и автоматически стреляет в ближайших врагов.
Цель — продержаться как можно дольше, уничтожая волны противников и подбирая бафы.

Полный README доступен в файле README.md в той же папке проекта.`;
    
    const blob = new Blob([readmeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README_TopDownWaves.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Установка коллбеков
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Инициализация начальных значений
  initialize() {
    if (this.uiScore) this.uiScore.textContent = '0';
    if (this.uiWave) this.uiWave.textContent = '-';
    this.setButtonStates('menu');
  }
}
