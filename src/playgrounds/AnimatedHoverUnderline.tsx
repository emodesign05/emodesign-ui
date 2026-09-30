import { UnderlineLink } from '../components/AnimatedHoverUnderline';
import { definePlayground } from '../playground/types';

type V = { variant: 'sweep' | 'center' | 'swap' | 'marker'; label: string; fontSize: number };

export default definePlayground<V>({
  note: 'リンクにマウスを乗せる（またはTabキーでフォーカスする）と線が動きます。',
  controls: [
    {
      key: 'variant',
      label: 'スタイル',
      type: 'select',
      default: 'sweep',
      options: [
        { value: 'sweep', label: 'スイープ' },
        { value: 'center', label: '中央から' },
        { value: 'swap', label: '入れ替わり' },
        { value: 'marker', label: 'マーカー' },
      ],
    },
    { key: 'label', label: 'リンク文言', type: 'text', default: 'Sweep link' },
    { key: 'fontSize', label: '文字サイズ', type: 'range', min: 14, max: 96, step: 1, default: 48, unit: 'px' },
  ],
  render: (v) => (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div style={{ fontSize: v.fontSize }} className="font-bold leading-tight">
        <UnderlineLink href="#" variant={v.variant}>
          {v.label}
        </UnderlineLink>
      </div>
    </main>
  ),
});
