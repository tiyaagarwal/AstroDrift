// Shared math utilities

export function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export function wrap(val, lo, hi) {
  const range = hi - lo;
  if (val < lo) return val + range;
  if (val > hi) return val - range;
  return val;
}
