import { BentoGridFeatures } from '../components/BentoGrid';
import { definePlayground } from '../playground/types';

type V = { gap: number; rowHeight: number; radius: number; lift: number };

export default definePlayground<V>({
  note: 'PC幅（768px以上）では3列、スマホ幅では1列に変わります。',
  controls: [
    { key: 'gap', label: 'カードの間隔', type: 'range', min: 0, max: 64, step: 2, default: 24, unit: 'px' },
    { key: 'rowHeight', label: '1行の高さ', type: 'range', min: 140, max: 400, step: 10, default: 240, unit: 'px' },
    { key: 'radius', label: '角丸', type: 'range', min: 0, max: 60, step: 2, default: 24, unit: 'px' },
    { key: 'lift', label: 'ホバー時に浮く量', type: 'range', min: 0, max: 20, step: 1, default: 5, unit: 'px' },
  ],
  render: (v) => (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <BentoGridFeatures gap={v.gap} rowHeight={v.rowHeight} radius={v.radius} lift={v.lift} />
    </div>
  ),
});
