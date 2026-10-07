import { paint as P, look } from './hero2.mjs';
export const paint = P;
const sel = (process.env.ONLY || '').split(',').filter(Boolean);
const all = [
  { name: 'echappement', props: 'exhaust', cam: [0.7, 0.36, 0.62], target: [-0.02, 0.3, -0.2], fov: 30, floorEnv: 0.12, fogNear: 1.5, fogFar: 6,
    strips: [{ w: 8, h: 3, p: [0, 5, -1], look: [0, 0, 0], i: 2.2 }, { w: 1.2, h: 5, p: [3.5, 2.5, 2], look: [0, 0.3, 0], i: 7 }, { w: 1.0, h: 5, p: [-3.5, 2.0, 1.0], look: [0, 0.3, 0], i: 4 }, { w: 12, h: 0.8, p: [0, 0.9, -5], i: 3 }, { w: 4, h: 0.5, p: [2, 0.2, 3], look: [0, 0.3, 0], i: 3 }],
    lights: [{ p: [1.5, 2.2, 1.5], t: [0, 0.3, 0], i: 5, angle: 0.3, penumbra: 1 }, { p: [-1.6, 0.8, 1.0], t: [0, 0.3, 0], i: 6, angle: 0.35, penumbra: 1, color: '#ffd9b0' }] },
  { name: 'goutte', props: 'drop', cam: [0, 0.3, 1.25], target: [0, 0.2, 0], fov: 30, floorEnv: 0.18, floor: '#08090b', fogNear: 2, fogFar: 9,
    strips: [{ w: 3, h: 0.35, p: [0, 1.4, -3], look: [0, 0.2, 0], i: 6, r: 6, g: 3.9, b: 1.2 }, { w: 0.4, h: 2.5, p: [2.2, 1.6, 1], look: [0, 0.2, 0], i: 5 }, { w: 0.4, h: 2.5, p: [-2.2, 1.6, 0.6], look: [0, 0.2, 0], i: 2.5 }, { w: 3, h: 1.2, p: [0, 4, 0], look: [0, 0, 0], i: 1.0 }],
    lights: [{ p: [0, 1.0, -1.6], t: [0, 0.08, 0], i: 4, angle: 0.16, penumbra: 1, color: '#ffb84a' }, { p: [0.8, 1.8, 1.2], t: [0, 0.1, 0], i: 3, angle: 0.3, penumbra: 1 }] },
];
export const shots = all.filter((s) => !sel.length || sel.includes(s.name)).map((s) => ({ ...look, ...s }));
