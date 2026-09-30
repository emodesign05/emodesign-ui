import { SpotlightGrid } from '../components/SpotlightCard';
import { definePlayground } from '../playground/types';

type V = { size: number; color: string; intensity: number; smooth: number };

export default definePlayground<V>({
  note: 'カードの上でマウスを動かすと、カーソルの位置が光ります（隣のカードの枠もつながって光ります）。',
  controls: [
    { key: 'size', label: '光の大きさ', type: 'range', min: 100, max: 700, step: 20, default: 320, unit: 'px' },
    { key: 'color', label: '光の色', type: 'color', default: '#818cf8' },
    { key: 'intensity', label: '面の光の強さ', hint: '枠線の光はそのまま、カード内側の光だけ変わる', type: 'range', min: 0, max: 0.5, step: 0.01, default: 0.15 },
    { key: 'smooth', label: '追従の遅れ', hint: '0 でカーソルにぴったり', type: 'range', min: 0, max: 1, step: 0.05, default: 0.3, unit: '秒' },
  ],
  render: (v) => (
    <main className="flex min-h-screen items-center bg-neutral-950 px-6 py-16">
      <SpotlightGrid size={v.size} color={v.color} intensity={v.intensity} smooth={v.smooth} />
    </main>
  ),
});
