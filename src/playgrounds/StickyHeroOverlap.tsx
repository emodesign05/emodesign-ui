import { StickyHeroOverlap } from '../components/StickyHeroOverlap';
import { definePlayground } from '../playground/types';

type V = { minScale: number; maxRadius: number; maxDim: number };

export default definePlayground<V>({
  note: 'プレビュー内をスクロールすると、次のセクションがヒーローに重なります。',
  controls: [
    { key: 'minScale', label: '覆われた時の縮小率', hint: '1で縮小なし', type: 'range', min: 0.6, max: 1, step: 0.01, default: 0.9 },
    { key: 'maxRadius', label: '角丸の最大値', type: 'range', min: 0, max: 80, step: 2, default: 32, unit: 'px' },
    { key: 'maxDim', label: '暗くなる強さ', type: 'range', min: 0, max: 1, step: 0.05, default: 0.6 },
  ],
  render: (v) => <StickyHeroOverlap minScale={v.minScale} maxRadius={v.maxRadius} maxDim={v.maxDim} />,
});
