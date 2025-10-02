import { clamp } from "../utils/math.js"

const README_TEXT = `# Top-Down Waves
Описание:
Top-Down Waves — аркадная survival-игра с видом сверху. Игрок управляет персонажем (WASD) и автоматически стреляет в ближайших врагов.
Цель — продержаться как можно дольше, уничтожая волны противников и подбирая бафы.`

export class UIManager {
  constructor() {
    this.initializeElements()
    this.setupEventListeners()
  }

  initializeElements() {
    // HUD элементы
    this.hpfill = document.getElementById("hpfill")
    this.uiWave = document.getElementById("uiWave")
    this.uiScore = document.getElementById("uiScore")
    this.uiBuffs = document.getElementById("uiBuffs")
    this.uiLives = document.getElementById("uiLives")

    // Статистика
    this.statHP = document.getElementById("statHP")
    this.statSpeed = document.getElementById("statSpeed")
    this.statDmg = document.getElementById("statDmg")
    this.statFire = document.getElementById("statFire")

    // Кнопки
    this.btnStart = document.getElementById("btnStart")
    this.btnPause = document.getElementById("btnPause")
    this.btnRestart = document.getElementById("btnRestart")
    this.btnReadme = document.getElementById("btnReadme")

    // Оверлеи и модалки
    this.overlayGameOver = document.getElementById("overlayGameOver")
    this.goText = document.getElementById("goText")
    this.btnGoRestart = document.getElementById("btnGoRestart")
    this.modalReadme = document.getElementById("modalReadme")
    this.readmeTextEl = document.getElementById("readmeText")
    this.btnDownloadReadmeModal = document.getElementById("downloadReadmeBtn")
    this.btnDownloadReadmeSidebar = document.getElementById("btnDownloadReadme")
    this.closeReadmeBtn = document.getElementById("closeReadme")
  }

  setupEventListeners() {
    const eventMap = {
      btnStart: () => this.callbacks?.startGame?.(),
      btnPause: () => this.callbacks?.pauseGame?.(),
      btnRestart: () => this.callbacks?.restartGame?.(),
      btnGoRestart: () => {
        this.hideGameOver()
        this.callbacks?.restartGame?.()
      },
      btnReadme: () => this.showReadme(),
      btnDownloadReadmeModal: () => this.downloadReadme(),
      btnDownloadReadmeSidebar: () => this.downloadReadme(),
      closeReadmeBtn: () => this.hideReadme(),
      modalReadme: (e) => {
        if (e.target === this.modalReadme) this.hideReadme()
      },
    }

    this.callbacks = {}

    Object.entries(eventMap).forEach(([elName, handler]) => {
      const el = this[elName]
      if (el) el.addEventListener("click", handler)
    })
  }

  updateHUD(player, wave, score) {
    const stats = player.getStats()

    if (this.hpfill) {
      const hpPercent = clamp((stats.hp / stats.maxHp) * 100, 0, 100)
      this.hpfill.style.width = `${hpPercent}%`
    }

    const uiMap = {
      uiWave: wave,
      uiScore: score,
      uiLives: stats.lives,
      statHP: stats.hp,
      statSpeed: stats.speed,
      statDmg: stats.damage,
      statFire: stats.fireRate,
    }

    Object.entries(uiMap).forEach(([elName, value]) => {
      if (this[elName]) this[elName].textContent = value
    })

    this.renderBuffs(player.buffs)
  }

  renderBuffs(buffs) {
    if (!this.uiBuffs) return

    this.uiBuffs.innerHTML = ""

    const buffRenderers = {
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

    for (const [buffName, buff] of Object.entries(buffs)) {
      const text = buffRenderers[buffName]?.(buff) || ""
      if (text) {
        const el = document.createElement("div")
        el.className = "buff"
        el.textContent = text
        this.uiBuffs.appendChild(el)
      }
    }
  }

  setButtonStates(gameState) {
    const stateMap = {
      loading: () => {
        this.btnStart && this.setBtn(this.btnStart, true, "Загрузка...")
        this.btnPause && (this.btnPause.disabled = true)
        this.btnRestart && (this.btnRestart.disabled = true)
      },
      menu: () => {
        this.btnStart && this.setBtn(this.btnStart, false, "Старт")
        this.btnPause && (this.btnPause.disabled = true)
        this.btnRestart && (this.btnRestart.disabled = true)
      },
      gameover: () => {
        this.btnStart && this.setBtn(this.btnStart, false, "Старт")
        this.btnPause && (this.btnPause.disabled = true)
        this.btnRestart && (this.btnRestart.disabled = true)
      },
      running: () => {
        this.btnStart && (this.btnStart.disabled = true)
        this.btnPause && this.setBtn(this.btnPause, false, "Пауза")
        this.btnRestart && (this.btnRestart.disabled = false)
      },
      paused: () => {
        this.btnPause && this.setBtn(this.btnPause, false, "Возобновить")
      },
    }

    stateMap[gameState]?.()
  }

  setBtn(btn, disabled, text) {
    btn.disabled = disabled
    if (text) btn.textContent = text
  }

  showGameOver(wave, score) {
    if (this.overlayGameOver) this.overlayGameOver.style.display = "flex"
    if (this.goText) this.goText.textContent = `Вы дошли до волны ${wave}. Набрано очков: ${score}.`
  }

  hideGameOver() {
    if (this.overlayGameOver) this.overlayGameOver.style.display = "none"
  }

  showReadme() {
    const readmeText = README_TEXT
    if (this.readmeTextEl) this.readmeTextEl.textContent = readmeText
    if (this.modalReadme) this.modalReadme.style.display = "flex"
  }

  hideReadme() {
    if (this.modalReadme) this.modalReadme.style.display = "none"
  }

  downloadReadme() {
    const blob = new Blob([README_TEXT], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "README_TopDownWaves.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  initialize() {
    if (this.uiScore) this.uiScore.textContent = "0"
    if (this.uiWave) this.uiWave.textContent = "-"
    this.setButtonStates("menu")
  }
}
