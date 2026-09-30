import { TouchEnabledCarousel } from '../components/CardCarousel';
import { definePlayground } from '../playground/types';

type V = { stiffness: number; damping: number; swipeThreshold: number; dragElastic: number };

export default definePlayground<V>({
  note: 'ドラッグ／スワイプまたは矢印ボタンで切り替えます。',
  controls: [
    { key: 'stiffness', label: 'スプリングの硬さ', type: 'range', min: 50, max: 800, step: 10, default: 300 },
    { key: 'damping', label: 'スプリングの減衰', type: 'range', min: 5, max: 60, step: 1, default: 30 },
    { key: 'swipeThreshold', label: 'スワイプ判定距離', type: 'range', min: 10, max: 200, step: 5, default: 50, unit: 'px' },
    { key: 'dragElastic', label: 'ドラッグの伸び', type: 'range', min: 0, max: 1, step: 0.05, default: 0.2 },
  ],
  render: (v) => (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <TouchEnabledCarousel {...v} />
    </div>
  ),
});
