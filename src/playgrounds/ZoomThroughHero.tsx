import { ZoomThroughHero } from '../components/ZoomThroughHero';
import { definePlayground } from '../playground/types';

type V = { word: string; maxScale: number; focusX: number; focusY: number; scrollLength: number };

export default definePlayground<V>({
  note: 'プレビュー内をスクロールすると、文字の中へ吸い込まれるように写真が広がります。',
  controls: [
    { key: 'word', label: '切り抜く文字', hint: '短い英単語がおすすめ', type: 'text', default: 'EXPLORE' },
    { key: 'maxScale', label: '最大拡大率', type: 'range', min: 5, max: 80, step: 1, default: 40 },
    { key: 'focusX', label: '通り抜ける位置（横）', hint: '文字の穴に合わせる', type: 'range', min: 0, max: 100, step: 1, default: 50, unit: '%' },
    { key: 'focusY', label: '通り抜ける位置（縦）', type: 'range', min: 0, max: 100, step: 1, default: 50, unit: '%' },
    { key: 'scrollLength', label: '再生に使うスクロール量', type: 'range', min: 100, max: 500, step: 25, default: 200, unit: 'vh' },
  ],
  render: (v) => <ZoomThroughHero word={v.word} maxScale={v.maxScale} focusX={v.focusX} focusY={v.focusY} scrollLength={v.scrollLength} />,
});
