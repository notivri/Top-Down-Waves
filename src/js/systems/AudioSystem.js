import { CONFIG } from '../core/config.js';

// Система аудио для WebAudio звуковых эффектов
export class AudioSystem {
  constructor() {
    this.audioCtx = null;
    this.AudioCtx = window.AudioContext || window.webkitAudioContext;
  }

  // Создание аудио контекста при первом использовании
  ensureAudio() {
    if (!this.audioCtx && this.AudioCtx) {
      this.audioCtx = new this.AudioCtx();
    }
  }

  // Воспроизведение звука по типу
  playSound(type) {
    try {
      this.ensureAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const config = CONFIG.AUDIO[type];
      
      if (!config) return;

      if (type === 'fire') {
        this.playFireSound(now, config);
      } else if (type === 'enemyDeath') {
        this.playEnemyDeathSound(now, config);
      } else if (type === 'pickup') {
        this.playPickupSound(now, config);
      }
    } catch (e) {
      // Игнорируем ошибки воспроизведения аудио
      console.warn('Audio playback error:', e);
    }
  }

  // Звук выстрела
  playFireSound(now, config) {
    const oscillator = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(config.frequency, now);
    
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(config.volume, now + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + config.duration);
    
    oscillator.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    oscillator.start(now);
    oscillator.stop(now + config.duration);
  }

  // Звук смерти врага
  playEnemyDeathSound(now, config) {
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc1.frequency.setValueAtTime(config.frequencies[0], now);
    osc2.frequency.setValueAtTime(config.frequencies[1], now);
    
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(config.volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + config.duration);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + config.duration);
    osc2.stop(now + config.duration);
  }

  // Звук подбора предмета
  playPickupSound(now, config) {
    const oscillator = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(config.frequency, now);
    
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(config.volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + config.duration);
    
    oscillator.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    oscillator.start(now);
    oscillator.stop(now + config.duration);
  }
}
