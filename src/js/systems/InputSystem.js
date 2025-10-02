// Система управления вводом (клавиатура и мышь)
export class InputSystem {
  constructor(canvas, game) {
    this.canvas = canvas
    this.game = game
    this.keys = { w: false, a: false, s: false, d: false }
    this.mousePos = { x: 0, y: 0 }
    this.mouseDown = false
    this.callbacks = {
      shoot: null,
      pause: null,
      resume: null,
    }

    this.setupEventListeners()
  }

  // Настройка обработчиков событий
  setupEventListeners() {
    // Движение мыши
    this.canvas.addEventListener("mousemove", (event) => {
      if (this.game.getGameState() === "running") {
        const rect = this.canvas.getBoundingClientRect()
        this.mousePos.x = event.clientX - rect.left
        this.mousePos.y = event.clientY - rect.top
      }
    })

    // Клики мыши
    this.canvas.addEventListener("mousedown", () => {
      this.mouseDown = true
      if (this.callbacks.shoot) {
        this.callbacks.shoot(this.mousePos.x, this.mousePos.y)
      }
    })

    this.canvas.addEventListener("mouseup", () => {
      this.mouseDown = false
    })

    // Клавиатура
    window.addEventListener("keydown", (e) => {
      this.handleKeyDown(e)
    })

    window.addEventListener("keyup", (e) => {
      this.handleKeyUp(e)
    })
  }

  // Обработка нажатия клавиш
  handleKey(e, isDown) {
    const keyMap = {
      KeyW: () => (this.keys.w = isDown),
      KeyA: () => (this.keys.a = isDown),
      KeyS: () => (this.keys.s = isDown),
      KeyD: () => (this.keys.d = isDown),
    }

    keyMap[e.code]?.()

    if (isDown) {
      if (e.code === "KeyP" && this.callbacks.pause) this.callbacks.pause()
      if (e.code === "Escape") this.handleEscape()
    }
  }

  handleKeyDown(e) {
    this.handleKey(e, true)
  }

  handleKeyUp(e) {
    this.handleKey(e, false)
  }

  // Обработка Escape
  handleEscape() {
    const modalReadme = document.getElementById("modalReadme")
    if (modalReadme && modalReadme.style.display === "flex") {
      modalReadme.style.display = "none"
    }
  }

  // Получение вектора движения
  getMovementVector() {
    let vx = 0
    let vy = 0

    const mapping = {
      w: () => (vy -= 1),
      s: () => (vy += 1),
      a: () => (vx -= 1),
      d: () => (vx += 1),
    }

    for (const key in this.keys) {
      if (this.keys[key]) {
        mapping[key]()
      }
    }
    return { x: vx, y: vy }
  }

  // Установка коллбеков
  setShootCallback(callback) {
    this.callbacks.shoot = callback
  }

  setPauseCallback(callback) {
    this.callbacks.pause = callback
  }

  setResumeCallback(callback) {
    this.callbacks.resume = callback
  }

  // Геттеры
  getMousePos() {
    return this.mousePos
  }

  isMouseDown() {
    return this.mouseDown
  }

  getKeys() {
    return this.keys
  }
}
