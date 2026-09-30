import { SVGPathDraw } from '../components/SVGPathDraw';
import { definePlayground } from '../playground/types';

type V = { mode: 'scroll' | 'play'; duration: number; strokeWidth: number; color: string; stagger: number };

export default definePlayground<V>({
  remountOnChange: true,
  note: 'プレビュー内をスクロールすると線が描かれます。',
  controls: [
    {
      key: 'mode',
      label: '描き方',
      type: 'select',
      default: 'scroll',
      options: [
        { value: 'scroll', label: 'スクロール量に合わせる' },
        { value: 'play', label: '表示されたら自動で描く' },
      ],
    },
    { key: 'duration', label: '描画時間（自動時）', type: 'range', min: 0.5, max: 6, step: 0.1, default: 2.4, unit: '秒' },
    { key: 'stagger', label: '線ごとの時間差（自動時）', type: 'range', min: 0, max: 1.5, step: 0.05, default: 0.3, unit: '秒' },
    { key: 'strokeWidth', label: '線の太さ', type: 'range', min: 1, max: 12, step: 0.5, default: 3, unit: 'px' },
    { key: 'color', label: '線の色', type: 'color', default: '#6366f1' },
  ],
  render: (v) => <SVGPathDraw mode={v.mode} duration={v.duration} stagger={v.stagger} strokeWidth={v.strokeWidth} color={v.color} />,
});
