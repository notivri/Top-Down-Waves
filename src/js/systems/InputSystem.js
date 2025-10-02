// Система управления вводом (клавиатура и мышь)
export class InputSystem {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;
    this.keys = { w: false, a: false, s: false, d: false };
    this.mousePos = { x: 0, y: 0 };
    this.mouseDown = false;
    this.callbacks = {
      shoot: null,
      pause: null,
      resume: null
    };

    this.setupEventListeners();
  }

  // Настройка обработчиков событий
  setupEventListeners() {
    // Движение мыши
    this.canvas.addEventListener('mousemove', (event) => {
      if (this.game.getGameState() === 'running') {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = event.clientX - rect.left;
        this.mousePos.y = event.clientY - rect.top;
      }
    });

    // Клики мыши
    this.canvas.addEventListener('mousedown', () => {
      this.mouseDown = true;
      if (this.callbacks.shoot) {
        this.callbacks.shoot(this.mousePos.x, this.mousePos.y);
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.mouseDown = false;
    });

    // Клавиатура
    window.addEventListener('keydown', (e) => {
      this.handleKeyDown(e);
    });

    window.addEventListener('keyup', (e) => {
      this.handleKeyUp(e);
    });
  }

  // Обработка нажатия клавиш
  handleKeyDown(e) {
    // WASD для движения
    if (e.code === 'KeyW') this.keys.w = true;
    if (e.code === 'KeyA') this.keys.a = true;
    if (e.code === 'KeyS') this.keys.s = true;
    if (e.code === 'KeyD') this.keys.d = true;

    // P для паузы
    if (e.code === 'KeyP') {
      if (this.callbacks.pause) this.callbacks.pause();
    }

    // Escape для закрытия модалок
    if (e.code === 'Escape') {
      this.handleEscape();
    }
  }

  // Обработка отпускания клавиш
  handleKeyUp(e) {
    if (e.code === 'KeyW') this.keys.w = false;
    if (e.code === 'KeyA') this.keys.a = false;
    if (e.code === 'KeyS') this.keys.s = false;
    if (e.code === 'KeyD') this.keys.d = false;
  }

  // Обработка Escape
  handleEscape() {
    const modalReadme = document.getElementById('modalReadme');
    if (modalReadme && modalReadme.style.display === 'flex') {
      modalReadme.style.display = 'none';
    }
  }

  // Получение вектора движения
  getMovementVector() {
    let vx = 0, vy = 0;
    if (this.keys.w) vy -= 1;
    if (this.keys.s) vy += 1;
    if (this.keys.a) vx -= 1;
    if (this.keys.d) vx += 1;
    return { x: vx, y: vy };
  }

  // Установка коллбеков
  setShootCallback(callback) {
    this.callbacks.shoot = callback;
  }

  setPauseCallback(callback) {
    this.callbacks.pause = callback;
  }

  setResumeCallback(callback) {
    this.callbacks.resume = callback;
  }

  // Геттеры
  getMousePos() {
    return this.mousePos;
  }

  isMouseDown() {
    return this.mouseDown;
  }

  getKeys() {
    return this.keys;
  }
}
