import { MagicScroll } from '../components/MagicScroll';
import { definePlayground } from '../playground/types';

type V = { scrub: number; chapterLength: number; rotate: number; bgShift: boolean };

export default definePlayground<V>({
  note: 'プレビュー内をスクロールすると、画面が固定されたまま製品が回転し、説明が入れ替わります。',
  controls: [
    { key: 'scrub', label: '追従の遅れ', hint: '0 でスクロールに密着、大きいほどなめらか', type: 'range', min: 0, max: 2, step: 0.1, default: 0.8, unit: '秒' },
    { key: 'chapterLength', label: '1章あたりのスクロール量', hint: '大きいほどゆっくり進む', type: 'range', min: 60, max: 250, step: 10, default: 120, unit: 'vh' },
    { key: 'rotate', label: '製品の回転角', type: 'range', min: 0, max: 60, step: 2, default: 28, unit: '°' },
    { key: 'bgShift', label: '背景を暗→明に変える', type: 'toggle', default: true },
  ],
  render: (v) => <MagicScroll scrub={v.scrub} chapterLength={v.chapterLength} rotate={v.rotate} bgShift={v.bgShift} />,
});
