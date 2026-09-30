import { AnimatedUnderlineTabs } from '../components/TabData';
import { definePlayground } from '../playground/types';

type V = {
  accent: 'rose' | 'indigo' | 'emerald' | 'amber';
  stiffness: number;
  damping: number;
  contentDuration: number;
  contentOffset: number;
};

export default definePlayground<V>({
  note: 'タブを切り替えると下線がスプリングで移動します。',
  controls: [
    { key: 'accent', label: 'アクセント色', type: 'select', default: 'rose', options: [
      { value: 'rose', label: 'Rose' }, { value: 'indigo', label: 'Indigo' },
      { value: 'emerald', label: 'Emerald' }, { value: 'amber', label: 'Amber' },
    ] },
    { key: 'stiffness', label: '下線の硬さ', type: 'range', min: 50, max: 800, step: 10, default: 380 },
    { key: 'damping', label: '下線の減衰', type: 'range', min: 5, max: 60, step: 1, default: 30 },
    { key: 'contentDuration', label: '内容の切替時間', type: 'range', min: 0.05, max: 1, step: 0.05, default: 0.2, unit: 's' },
    { key: 'contentOffset', label: '内容の移動量', type: 'range', min: 0, max: 40, step: 1, default: 8, unit: 'px' },
  ],
  render: (v) => (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <AnimatedUnderlineTabs {...v} />
    </div>
  ),
});
