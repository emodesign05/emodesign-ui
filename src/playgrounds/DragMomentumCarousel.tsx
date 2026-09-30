import { DragMomentumCarousel } from '../components/DragMomentumCarousel';
import { definePlayground } from '../playground/types';

type V = { cardW: number; gap: number; elastic: number; power: number; timeConstant: number };

export default definePlayground<V>({
  remountOnChange: true,
  note: 'カードをつかんで横に投げてみてください。',
  controls: [
    { key: 'cardW', label: 'カードの幅', type: 'range', min: 160, max: 480, step: 10, default: 320, unit: 'px' },
    { key: 'gap', label: 'カードの間隔', type: 'range', min: 0, max: 64, step: 2, default: 24, unit: 'px' },
    { key: 'power', label: '慣性の強さ', hint: '大きいほど遠くまで滑る', type: 'range', min: 0.05, max: 1, step: 0.05, default: 0.35 },
    { key: 'timeConstant', label: '止まるまでの時間', hint: '大きいほどゆっくり止まる', type: 'range', min: 100, max: 900, step: 20, default: 320, unit: 'ms' },
    { key: 'elastic', label: '端の弾性', type: 'range', min: 0, max: 0.6, step: 0.02, default: 0.12 },
  ],
  render: (v) => <DragMomentumCarousel cardW={v.cardW} gap={v.gap} elastic={v.elastic} power={v.power} timeConstant={v.timeConstant} />,
});
