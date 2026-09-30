import { ParticleNetwork } from '../components/InteractiveParticleNetwork';
import { definePlayground } from '../playground/types';

type V = { density: number; linkDistance: number; speed: number; mouseRadius: number; repel: number };

export default definePlayground<V>({
  note: 'マウスを動かすと周囲の粒子が反応します。',
  controls: [
    { key: 'density', label: '粒子の密度', hint: '1万px²あたりの粒子数', type: 'range', min: 0.2, max: 2, step: 0.05, default: 0.9 },
    { key: 'linkDistance', label: '線で結ぶ距離', type: 'range', min: 40, max: 260, step: 5, default: 130, unit: 'px' },
    { key: 'speed', label: '漂う速度', type: 'range', min: 0.05, max: 1.5, step: 0.05, default: 0.35 },
    { key: 'mouseRadius', label: 'マウスの影響半径', type: 'range', min: 40, max: 400, step: 10, default: 160, unit: 'px' },
    { key: 'repel', label: '押し出す強さ', type: 'range', min: 0, max: 2, step: 0.05, default: 0.6 },
  ],
  render: (v) => (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <ParticleNetwork density={v.density} linkDistance={v.linkDistance} speed={v.speed} mouseRadius={v.mouseRadius} repel={v.repel} />
    </main>
  ),
});
