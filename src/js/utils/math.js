// Математические утилиты

// Случайное число от a до b
export const rand = (a, b) => Math.random() * (b - a) + a;

// Случайное целое число от a до b включительно
export const randInt = (a, b) => Math.floor(rand(a, b + 1));

// Ограничить значение v в диапазоне [a, b]
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// расстояние между двумя точками/объектами
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Проверка столкновения двух кругов
export const circleHit = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) <= a.radius + b.radius;

// Нормализация вектора
export const normalize = (x, y) => {
  const mag = Math.hypot(x, y) || 1;
  return { x: x / mag, y: y / mag };
};

// Расчет направления от одной точки к другой
export const getDirection = (from, to) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return normalize(dx, dy);
};
