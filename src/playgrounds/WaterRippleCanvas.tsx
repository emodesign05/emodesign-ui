import { WaterRipple } from '../components/WaterRippleCanvas';
import { definePlayground } from '../playground/types';

type V = { resolution: number; damping: number; strength: number; radius: number; dropInterval: number };

export default definePlayground<V>({
  remountOnChange: true,
  note: 'マウスを動かすと波紋、クリックで大きな波が立ちます。',
  controls: [
    { key: 'resolution', label: '計算解像度', hint: '低いほど軽く、柔らかい見た目', type: 'range', min: 0.25, max: 1, step: 0.05, default: 0.5 },
    { key: 'damping', label: '波の減衰', hint: '大きいほど長く残る', type: 'range', min: 0.9, max: 0.99, step: 0.001, default: 0.965 },
    { key: 'strength', label: '波紋の強さ', type: 'range', min: 100, max: 900, step: 10, default: 420 },
    { key: 'radius', label: '波紋の半径', type: 'range', min: 1, max: 10, step: 1, default: 3 },
    { key: 'dropInterval', label: 'しずくの間隔', hint: '0 で自動落下なし', type: 'range', min: 0, max: 3000, step: 100, default: 900, unit: 'ms' },
  ],
  render: (v) => (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      <WaterRipple resolution={v.resolution} damping={v.damping} strength={v.strength} radius={v.radius} dropInterval={v.dropInterval} />
    </main>
  ),
});
