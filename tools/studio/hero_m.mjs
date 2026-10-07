// Film défilé vertical (téléphone) : de l'étrier rouge à la voiture entière, vue plongeante.
import { paint as P, strips, lights, look } from './hero2.mjs';
export const paint = P;
const N = +(process.env.N || 120);
const K = [
  { t: 0.0, cam: [2.8, 0.75, 2.6], tg: [1.0, 0.1, 1.29], fov: 50, sw: 0.2, ceil: 0.35, line: 1.2, k: 0.65 },
  { t: 0.42, cam: [3.6, 1.2, 3.5], tg: [0.9, 0.25, 1.0], fov: 52, sw: 2.2, ceil: 0.9, line: 1.9, k: 1.0 },
  { t: 1.0, cam: [5.2, 2.6, 5.6], tg: [0.15, -0.05, 0.1], fov: 47, sw: 4.4, ceil: 1.7, line: 2.6, k: 1.2 },
];
function cr(p0, p1, p2, p3, t) { const t2 = t * t, t3 = t2 * t; return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); }
function sample(u) {
  const v = 0.5 * u + 0.5 * u * u * (3 - 2 * u);
  let i = 0; while (i < K.length - 2 && v > K[i + 1].t) i++;
  const a = K[Math.max(0, i - 1)], b = K[i], c = K[i + 1], d = K[Math.min(K.length - 1, i + 2)];
  const lt = (v - b.t) / (c.t - b.t);
  const vec = (k) => [0, 1, 2].map((j) => cr(a[k][j], b[k][j], c[k][j], d[k][j], lt));
  const sc = (k) => cr(a[k], b[k], c[k], d[k], lt);
  return { cam: vec('cam'), tg: vec('tg'), fov: sc('fov'), sw: sc('sw'), ceil: Math.max(0.2, sc('ceil')), line: sc('line'), k: sc('k') };
}
export const shots = Array.from({ length: N }, (_, f) => {
  const s = sample(f / (N - 1));
  return { ...look, name: String(f).padStart(4, '0'), cam: s.cam, target: s.tg, fov: s.fov,
    strips: strips({ sw: s.sw, ceil: s.ceil }).map((x, i) => (i === 2 ? { ...x, i: s.line } : x)), lights: lights(s.k) };
});
