import { paint as P, strips, lights, look } from './hero2.mjs';
export const paint = P;
const S = (sw, ceil, line = 1.6) => strips({ sw, ceil }).map((x, i) => (i === 2 ? { ...x, i: line } : x));
export const shots = [
  { name: 'hero-mobile', cam: [2.8, 0.75, 2.6], target: [1.0, 0.1, 1.29], fov: 50, strips: S(1.2, 0.5, 2.0), lights: lights(0.85) },
  { name: 'm2', cam: [2.6, 0.62, 2.35], target: [1.05, -0.05, 1.29], fov: 50, strips: S(2.0, 0.7, 2.0), lights: lights(0.9) },
  { name: 'm3', cam: [2.9, 0.45, 2.2], target: [1.0, 0.62, 1.0], fov: 48, strips: S(0.8, 0.5, 2.2), lights: lights(0.85) },
].filter((s) => s.name === 'hero-mobile').map((s) => ({ ...look, ...s }));
