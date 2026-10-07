import { paint as P, strips, lights, look } from './hero2.mjs';
export const paint = P;
const S = (sw, ceil, line = 1.6) => strips({ sw, ceil }).map((x, i) => (i === 2 ? { ...x, i: line } : x));
const L = (k) => lights(k);
const sel = (process.env.ONLY || '').split(',').filter(Boolean);
const all = [
  // Mobile hero (portrait 4:5) — rendered at 1080x1350 via W/H override
  { name: 'hero-mobile', size: [1080, 1350], cam: [4.6, 1.05, 4.3], target: [0.35, 0.15, 0.6], fov: 38, strips: S(5, 1.3), lights: L(0.95) },
  // Atelier detail (portrait 4:5): wheel + caliper
  { name: 'detail-roue', size: [1200, 1500], cam: [2.75, 0.52, 2.6], target: [1.0, 0.42, 1.25], fov: 30, strips: S(1, 0.35), lights: L(0.75) },
  // Side profile with light line (wide)
  { name: 'profil', size: [2400, 1200], cam: [8.5, 0.75, 0.2], target: [0, 0.55, 0.2], fov: 30, strips: S(-3, 0.6, 2.6), lights: L(0.5) },
  // McLaren section: rear 3/4, very dark, tail lights
  { name: 'arriere', size: [2400, 1350], cam: [-3.6, 0.85, -4.6], target: [0.15, 0.55, -0.6], fov: 32, strips: [{ w: 10, h: 4, p: [0, 8, 0], look: [0, 0, 0], i: 0.6 }, { w: 1.4, h: 6, p: [-9, 4.6, -3], look: [0, 0.8, -3], i: 7 }, { w: 30, h: 0.5, p: [-9, 1.7, -1], look: [0, 0.6, -1], i: 2.2 }, { w: 12, h: 0.6, p: [0, 2.2, -10], i: 1.2 }], lights: [{ p: [-5, 2.6, -4.6], t: [-1.2, 0.4, -1.4], i: 20, angle: 0.25, penumbra: 1 }] },
  // Wheel face-on (CINEL)
  { name: 'roue-face', size: [1600, 1600], cam: [3.3, 0.6, 1.36], target: [1.0, 0.56, 1.29], fov: 27, strips: S(2.5, 0.6), lights: [{ p: [3.2, 2.4, 2.8], t: [1.1, 0.56, 1.29], i: 26, angle: 0.25, penumbra: 1 }] },
  // Wheel low angle with tyre (EVO Corse)
  { name: 'roue-rasante', size: [1600, 1600], cam: [1.85, 0.1, -3.0], target: [1.0, 0.55, -1.2], fov: 36, strips: S(-1.5, 0.6, 2.4), lights: [{ p: [3.5, 1.6, -3.5], t: [1.1, 0.5, -1.6], i: 26, angle: 0.25, penumbra: 1 }] },
  // Paint finish macro (McLaren Car Care)
  { name: 'finition', size: [1600, 1600], cam: [1.9, 1.05, 0.4], target: [1.1, 0.9, -0.9], fov: 26, strips: S(-0.4, 0.6, 5.0), lights: [{ p: [3.0, 2.6, 1.5], t: [1.1, 0.9, -0.9], i: 10, angle: 0.3, penumbra: 1 }] },
  // OG image
  { name: 'og', size: [1200, 630], cam: [4.35, 0.74, 4.05], target: [0.5, 0.5, 0.75], fov: 30, strips: S(5, 1.3), lights: L(0.95) },
];
export const shots = all.filter((s) => !sel.length || sel.includes(s.name)).map((s) => ({ ...look, ...s }));
