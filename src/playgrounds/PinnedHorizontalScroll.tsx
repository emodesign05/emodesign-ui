import { PinnedHorizontalScroll } from '../components/PinnedHorizontalScroll';
import { definePlayground } from '../playground/types';

type V = { cardWidth: number; gap: number; scrub: number; innerParallax: boolean };

export default definePlayground<V>({
  note: 'プレビュー内を縦にスクロールすると、カードが横に流れます。',
  controls: [
    { key: 'cardWidth', label: 'カードの幅', type: 'range', min: 240, max: 720, step: 20, default: 420, unit: 'px' },
    { key: 'gap', label: 'カードの間隔', type: 'range', min: 0, max: 96, step: 4, default: 32, unit: 'px' },
    { key: 'scrub', label: '追従の遅れ', hint: '0 でスクロールに密着', type: 'range', min: 0, max: 2, step: 0.1, default: 0.6, unit: '秒' },
    { key: 'innerParallax', label: 'カード内の奥行き（逆方向の動き）', type: 'toggle', default: true },
  ],
  render: (v) => <PinnedHorizontalScroll cardWidth={v.cardWidth} gap={v.gap} scrub={v.scrub} innerParallax={v.innerParallax} />,
});
