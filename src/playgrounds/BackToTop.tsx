import { BackToTopDemo } from '../components/BackToTop';
import { definePlayground } from '../playground/types';

type V = { threshold: number; size: number; strokeWidth: number; color: string; side: 'right' | 'left'; showPercent: boolean };

export default definePlayground<V>({
  note: 'プレビューを下へスクロールするとボタンが現れ、リングが読了率に合わせて伸びます。',
  controls: [
    { key: 'threshold', label: '出現するスクロール量', type: 'range', min: 0, max: 1200, step: 50, default: 400, unit: 'px' },
    { key: 'size', label: 'ボタンの大きさ', type: 'range', min: 44, max: 80, step: 2, default: 56, unit: 'px' },
    { key: 'strokeWidth', label: 'リングの太さ', type: 'range', min: 1, max: 6, step: 0.5, default: 3, unit: 'px' },
    { key: 'color', label: 'リングの色', type: 'color', default: '#6366f1' },
    {
      key: 'side',
      label: '配置',
      type: 'select',
      default: 'right',
      options: [
        { value: 'right', label: '右下' },
        { value: 'left', label: '左下' },
      ],
    },
    { key: 'showPercent', label: '中央に％を表示', type: 'toggle', default: false },
  ],
  render: (v) => <BackToTopDemo {...v} />,
});
