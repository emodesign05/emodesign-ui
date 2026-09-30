import { StickyCardStack } from '../components/StickyCardStack';
import { definePlayground } from '../playground/types';

type V = { scaleStep: number; offset: number; dim: number };

export default definePlayground<V>({
  note: 'プレビュー内をスクロールすると、カードが上部で止まって重なっていきます。',
  controls: [
    { key: 'scaleStep', label: '1枚ごとの縮小量', hint: '0 で縮小なし', type: 'range', min: 0, max: 0.15, step: 0.01, default: 0.05 },
    { key: 'offset', label: '重なりのずれ', hint: '奥のカードがどれだけ上に見えるか', type: 'range', min: 0, max: 60, step: 2, default: 24, unit: 'px' },
    { key: 'dim', label: '奥のカードの暗さ', type: 'range', min: 0, max: 0.8, step: 0.05, default: 0.35 },
  ],
  render: (v) => <StickyCardStack scaleStep={v.scaleStep} offset={v.offset} dim={v.dim} />,
});
