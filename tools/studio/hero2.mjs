const B = '#090b0d';
const N = +(process.env.N || 150);
export const paint = { paint1: { color: '#22272e', metalness: 0.6, roughness: 0.3 }, paint2: { color: '#0e1013', metalness: 0.3, roughness: 0.4 }, caliper: '#c81e1e', rim: { color: '#4a4f57', roughness: 0.28 } };
const K = [
  { t: 0.00, cam: [2.75, 0.5, 2.75], tg: [0.75, 0.42, 1.05], fov: 26, sw: -2, ceil: 0.25, k: 0.35 },
  { t: 0.18, cam: [2.95, 0.52, 2.85], tg: [0.8, 0.42, 1.0], fov: 26, sw: 0.5, ceil: 0.35, k: 0.65 },
  { t: 0.55, cam: [3.7, 0.62, 3.6], tg: [0.65, 0.46, 0.9], fov: 28, sw: 3.0, ceil: 0.8, k: 0.85 },
  { t: 1.00, cam: [4.35, 0.74, 4.05], tg: [0.5, 0.5, 0.75], fov: 30, sw: 5.0, ceil: 1.3, k: 0.95 },
];
function cr(p0, p1, p2, p3, t) { const t2 = t * t, t3 = t2 * t; return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); }
function sample(u) {
  const e = u * u * (3 - 2 * u);
  const v = 0.5 * u + 0.5 * e; // gentle ease, ends at rest
  let i = 0; while (i < K.length - 2 && v > K[i + 1].t) i++;
  const a = K[Math.max(0, i - 1)], b = K[i], c = K[i + 1], d = K[Math.min(K.length - 1, i + 2)];
  const lt = (v - b.t) / (c.t - b.t);
  const vec = (k) => [0, 1, 2].map((j) => cr(a[k][j], b[k][j], c[k][j], d[k][j], lt));
  const sc = (k) => cr(a[k], b[k], c[k], d[k], lt);
  return { cam: vec('cam'), tg: vec('tg'), fov: sc('fov'), sw: sc('sw'), ceil: Math.max(0.2, sc('ceil')), k: sc('k') };
}
export const strips = (s) => [
  { w: 10, h: 4, p: [0, 8, 0], look: [0, 0, 0], i: s.ceil },
  { w: 1.4, h: 6, p: [9, 4.6, s.sw], look: [0, 0.8, s.sw], i: 7 },
  { w: 30, h: 0.5, p: [9, 1.7, 2], look: [0, 0.6, 2], i: 1.6 },
  { w: 1.5, h: 6, p: [-8, 4, 2], i: 1.4 },
  { w: 12, h: 0.6, p: [0, 2.2, -10], i: 1.6 },
];
export const lights = (k) => [
  { p: [5.0, 2.6, 4.6], t: [1.2, 0.4, 1.4], i: 34 * k, angle: 0.2, penumbra: 1 },
  { p: [-1, 6, 7], t: [0.3, 0.5, 1.2], i: 18 * k, angle: 0.4, penumbra: 1, color: '#dfe8ff' },
];
export const look = { bg: B, bgGlow: B, fogColor: B, fogNear: 4, fogFar: 18, floor: B, floorEnv: 0.14 };
export const shots = Array.from({ length: N }, (_, f) => {
  const s = sample(f / (N - 1));
  return { ...look, name: String(f).padStart(4, '0'), cam: s.cam, target: s.tg, fov: s.fov, strips: strips(s), lights: lights(s.k) };
});
