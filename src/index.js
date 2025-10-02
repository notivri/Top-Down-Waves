import { Game } from './js/core/Game.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Создание и запуск игры
new Game(canvas, ctx);
