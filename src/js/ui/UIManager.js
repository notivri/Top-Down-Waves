import { clamp } from "../utils/math.js"

// Менеджер пользовательского интерфейса
export class UIManager {
  static README_TEXT = `# Top-Down Waves

Описание:
Top-Down Waves — аркадная survival-игра с видом сверху. Игрок управляет персонажем (WASD) и автоматически стреляет в ближайших врагов.
Цель — продержаться как можно дольше, уничтожая волны противников и подбирая бафы.

Полный README доступен в файле README.md в той же папке проекта.`

  constructor() {
    this.initializeElements()
    this.setupEventListeners()
  }

  // Утилиты
  setContent(el, value) {
    if (el) el.textContent = value
  }

  setDisplay(el, value) {
    if (el) el.style.display = value
  }

  // Инициализация элементов DOM
  initializeElements() {
    const ids = [
      "hpfill",
      "uiWave",
      "uiScore",
      "uiBuffs",
      "uiLives",
      "statHP",
      "statSpeed",
      "statDmg",
      "statFire",
      "btnStart",
      "btnPause",
      "btnRestart",
      "btnReadme",
      "overlayGameOver",
      "goText",
      "btnGoRestart",
      "modalReadme",
      "readmeText",
      "btnDownloadReadmeBtn",
      "btnDownloadReadme",
      "closeReadme",
    ]

    ids.forEach((id) => (this[id] = document.getElementById(id)))
  }

  // Настройка обработчиков событий кнопок
  setupEventListeners() {
    this.callbacks = {}

    const onClick = (btn, handler) => btn?.addEventListener("click", handler)

    onClick(this.btnStart, () => this.callbacks.startGame?.())
    onClick(this.btnPause, () => this.callbacks.pauseGame?.())
    onClick(this.btnRestart, () => this.callbacks.restartGame?.())
    onClick(this.btnGoRestart, () => {
      this.hideGameOver()
      this.callbacks.restartGame?.()
    })
    onClick(this.btnReadme, () => this.showReadme())
    onClick(this.btnDownloadReadmeModal, () => this.downloadReadme())
    onClick(this.btnDownloadReadmeSidebar, () => this.downloadReadme())
    onClick(this.closeReadmeBtn, () => this.hideReadme())

    this.modalReadme?.addEventListener("click", (e) => {
      if (e.target === this.modalReadme) this.hideReadme()
    })
  }

  // Обновление HUD
  updateHUD(player, wave, score) {
    const stats = player.getStats()

    // Полоска здоровья
    if (this.hpfill) {
      const hpPercent = clamp((stats.hp / stats.maxHp) * 100, 0, 100)
      this.hpfill.style.width = `${hpPercent}%`
    }

    // Текстовые элементы
    const bindings = {
      uiWave: wave,
      uiScore: score,
      uiLives: stats.lives,
      statHP: stats.hp,
      statSpeed: stats.speed,
      statDmg: stats.damage,
      statFire: stats.fireRate,
    }

    Object.entries(bindings).forEach(([key, value]) => this.setContent(this[key], value))

    this.renderBuffs(player.buffs)
  }

  // Отображение активных бафов
  renderBuffs(buffs) {
    if (!this.uiBuffs) return
    this.uiBuffs.innerHTML = ""

    const formatters = {
      Speed: (buff) => `Speed x${(1 + 0.7 * buff.stacks).toFixed(1)} ${Math.ceil(buff.timeLeft || 0)}s`,
      DoubleShot: (buff) => {
        const counts = [1, 2, 4, 8]
        const bulletCount = counts[clamp(buff.stacks, 0, 3)]
        return `DoubleShot x${bulletCount} ${Math.ceil(buff.timeLeft || 0)}s`
      },
      Invuln: (buff) => `Invuln ${Math.ceil(buff.timeLeft || 0)}s`,
      Rapid: (buff) => `Rapid ${Math.ceil(buff.timeLeft || 0)}s`,
      Power: (buff) => `Power ${Math.ceil(buff.timeLeft || 0)}s`,
    }

    Object.entries(buffs).forEach(([buffName, buff]) => {
      const el = document.createElement("div")
      el.className = "buff"
      const formatter = formatters[buffName]
      if (formatter) el.textContent = formatter(buff)
      this.uiBuffs.appendChild(el)
    })
  }

  // Управление состоянием кнопок
  setButtonStates(gameState) {
    const states = {
      menu: {
        btnStart: { disabled: false, text: "Старт" },
        btnPause: { disabled: true },
        btnRestart: { disabled: true },
      },
      gameover: {
        btnStart: { disabled: false, text: "Старт" },
        btnPause: { disabled: true },
        btnRestart: { disabled: true },
      },
      running: {
        btnStart: { disabled: true },
        btnPause: { disabled: false, text: "Пауза" },
        btnRestart: { disabled: false },
      },
      paused: {
        btnPause: { text: "Возобновить" },
      },
    }

    const config = states[gameState]
    if (!config) return

    Object.entries(config).forEach(([btnKey, props]) => {
      const btn = this[btnKey]
      if (!btn) return
      if ("disabled" in props) btn.disabled = props.disabled
      if ("text" in props) btn.textContent = props.text
    })
  }

  // Показ/скрытие Game Over
  showGameOver(wave, score) {
    this.setDisplay(this.overlayGameOver, "flex")
    this.setContent(this.goText, `Вы дошли до волны ${wave}. Набрано очков: ${score}.`)
  }

  hideGameOver() {
    this.setDisplay(this.overlayGameOver, "none")
  }

  // Показ/скрытие README
  showReadme() {
    this.setContent(this.readmeTextEl, UIManager.README_TEXT)
    this.setDisplay(this.modalReadme, "flex")
  }

  hideReadme() {
    this.setDisplay(this.modalReadme, "none")
  }

  // Скачивание README
  downloadReadme() {
    const blob = new Blob([UIManager.README_TEXT], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "README_TopDownWaves.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Установка коллбеков
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  // Инициализация начальных значений
  initialize() {
    this.setContent(this.uiScore, "0")
    this.setContent(this.uiWave, "-")
    this.setButtonStates("menu")
  }
}
