import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { definePlayground } from '../playground/types';

type V = { accent: 'indigo' | 'rose' | 'emerald' | 'slate'; expandedWidth: number; collapsedWidth: number; stiffness: number; damping: number };

export default definePlayground<V>({
  note: 'PC幅（768px以上）で伸縮サイドバー、スマホ幅ではドロワーになります。左上の矢印ボタンで開閉します。',
  controls: [
    { key: 'accent', label: 'アクセント色', type: 'select', default: 'indigo', options: [
      { value: 'indigo', label: 'Indigo' }, { value: 'rose', label: 'Rose' },
      { value: 'emerald', label: 'Emerald' }, { value: 'slate', label: 'Slate' },
    ] },
    { key: 'expandedWidth', label: '開いた幅', type: 'range', min: 200, max: 360, step: 8, default: 256, unit: 'px' },
    { key: 'collapsedWidth', label: '閉じた幅', type: 'range', min: 56, max: 120, step: 4, default: 80, unit: 'px' },
    { key: 'stiffness', label: 'スプリングの硬さ', type: 'range', min: 50, max: 800, step: 10, default: 300 },
    { key: 'damping', label: 'スプリングの減衰', type: 'range', min: 5, max: 60, step: 1, default: 30 },
  ],
  render: (v) => <CollapsibleSidebar {...v} />,
});
