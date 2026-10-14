import { ComparisonTable } from '../components/ComparisonTable';
import { definePlayground } from '../playground/types';

type V = {
  accent: 'indigo' | 'rose' | 'emerald' | 'violet';
  recommended: 'light' | 'standard' | 'premium';
  defaultYearly: boolean;
  stickyFirstColumn: boolean;
  discountLabel: string;
};

export default definePlayground<V>({
  note: '月払い／年払いトグルで価格が切り替わります。スマホ幅では表を横スクロール（機能名の列は固定）。',
  remountOnChange: true,
  controls: [
    { key: 'accent', label: 'アクセント色', type: 'select', default: 'indigo', options: [
      { value: 'indigo', label: 'Indigo' }, { value: 'rose', label: 'Rose' },
      { value: 'emerald', label: 'Emerald' }, { value: 'violet', label: 'Violet' },
    ] },
    { key: 'recommended', label: 'おすすめプラン', type: 'select', default: 'standard', options: [
      { value: 'light', label: 'ライト' }, { value: 'standard', label: 'スタンダード' }, { value: 'premium', label: 'プレミアム' },
    ] },
    { key: 'defaultYearly', label: '最初から年払い表示', type: 'toggle', default: false },
    { key: 'stickyFirstColumn', label: '機能名の列を固定', hint: '横スクロール時に1列目を固定', type: 'toggle', default: true },
    { key: 'discountLabel', label: '年払いバッジの文言', type: 'text', default: '約20%おトク' },
  ],
  render: (v) => (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-8 dark:bg-slate-950">
      <div className="mx-auto flex max-w-5xl justify-center">
        <ComparisonTable {...v} />
      </div>
    </main>
  ),
});
