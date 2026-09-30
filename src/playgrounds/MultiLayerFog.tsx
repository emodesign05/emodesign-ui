import { Fog } from '../components/MultiLayerFog';
import { definePlayground } from '../playground/types';

type V = { speed: number; density: number; grain: number };

// 元の3層（奥→手前）。速度・濃さ・粒の大きさを一括で倍率調整する
const BASE = [
  { duration: 120, opacity: 0.35, top: '35%', height: '70%', frequency: 0.004, seed: 3 },
  { duration: 80, opacity: 0.45, top: '50%', height: '60%', reverse: true, frequency: 0.006, seed: 7 },
  { duration: 50, opacity: 0.55, top: '65%', height: '50%', frequency: 0.009, seed: 11 },
];

export default definePlayground<V>({
  controls: [
    { key: 'speed', label: '流れる速さ', hint: '1で標準。大きいほど速い', type: 'range', min: 0.25, max: 6, step: 0.25, default: 1, unit: 'x' },
    { key: 'density', label: '霧の濃さ', type: 'range', min: 0, max: 1.6, step: 0.05, default: 1, unit: 'x' },
    { key: 'grain', label: '霧の粒の細かさ', hint: '大きいほど細かくモヤモヤした霧', type: 'range', min: 0.3, max: 3, step: 0.1, default: 1, unit: 'x' },
  ],
  render: (v) => (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950">
      <svg aria-hidden viewBox="0 0 1440 400" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[55%] w-full">
        <path d="M0 260 L180 150 L320 220 L520 90 L700 200 L880 120 L1080 230 L1260 140 L1440 210 V400 H0Z" className="fill-slate-800/80" />
        <path d="M0 320 L220 230 L400 300 L620 200 L820 290 L1040 220 L1240 300 L1440 250 V400 H0Z" className="fill-slate-900" />
        <path d="M0 370 L260 310 L520 360 L760 300 L1000 360 L1240 320 L1440 350 V400 H0Z" className="fill-black" />
      </svg>
      <Fog
        layers={BASE.map((l) => ({
          ...l,
          duration: l.duration / v.speed,
          opacity: Math.min(1, l.opacity * v.density),
          frequency: l.frequency * v.grain,
        }))}
      />
      <h1 className="relative z-10 px-6 text-center text-5xl font-bold text-white sm:text-7xl">霧の向こうへ。</h1>
    </main>
  ),
});
