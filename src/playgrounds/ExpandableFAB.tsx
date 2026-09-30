import { ExpandableFAB } from '../components/ExpandableFAB';
import { definePlayground } from '../playground/types';

type V = { stagger: number; itemDuration: number; size: number; side: 'left' | 'right' };

export default definePlayground<V>({
  remountOnChange: true,
  note: '＋ボタンを押すとメニューが展開します（項目を押すとアラートが出ます）。',
  controls: [
    { key: 'stagger', label: '項目ごとの時間差', type: 'range', min: 0, max: 0.25, step: 0.01, default: 0.04, unit: 's' },
    { key: 'itemDuration', label: '1項目の出現時間', type: 'range', min: 0.05, max: 1, step: 0.05, default: 0.2, unit: 's' },
    { key: 'size', label: 'ボタンの大きさ', type: 'range', min: 40, max: 96, step: 2, default: 56, unit: 'px' },
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
  ],
  render: (v) => (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <p className="text-sm text-slate-500">画面{v.side === 'right' ? '右下' : '左下'}の「＋」ボタンを押してください。</p>
      <ExpandableFAB stagger={v.stagger} itemDuration={v.itemDuration} size={v.size} side={v.side} />
    </div>
  ),
});
