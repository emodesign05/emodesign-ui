import { ScrollImageSequence } from '../components/ScrollImageSequence';
import { definePlayground } from '../playground/types';

type V = { frameCount: number; scrollLength: number; scrub: number };

export default definePlayground<V>({
  note: 'プレビュー内をスクロールすると、コマ送りで回転します（デモは Canvas で描いたコマ。実案件では連番画像の URL を frames に渡します）。',
  controls: [
    { key: 'frameCount', label: 'コマ数', hint: '多いほどなめらか（画像なら読み込みが重くなる）', type: 'range', min: 12, max: 240, step: 12, default: 120 },
    { key: 'scrollLength', label: '再生に使うスクロール量', type: 'range', min: 100, max: 800, step: 50, default: 300, unit: 'vh' },
    { key: 'scrub', label: '追従の遅れ', type: 'range', min: 0, max: 2, step: 0.1, default: 0.5, unit: '秒' },
  ],
  render: (v) => <ScrollImageSequence frameCount={v.frameCount} scrollLength={v.scrollLength} scrub={v.scrub} />,
});
