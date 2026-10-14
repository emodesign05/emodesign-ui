import { StepFlow } from '../components/StepFlow';
import { definePlayground } from '../playground/types';

type V = {
  accent: 'indigo' | 'rose' | 'emerald' | 'amber';
  layout: 'auto' | 'vertical' | 'horizontal';
  scrub: boolean;
  lineWidth: number;
  showNumber: boolean;
};

export default definePlayground<V>({
  note: 'プレビューを下へスクロールすると線が伸び、各ステップが点灯します。',
  remountOnChange: true,
  controls: [
    { key: 'accent', label: 'アクセント色', type: 'select', default: 'indigo', options: [
      { value: 'indigo', label: 'Indigo' }, { value: 'rose', label: 'Rose' },
      { value: 'emerald', label: 'Emerald' }, { value: 'amber', label: 'Amber' },
    ] },
    { key: 'layout', label: '並び方', type: 'select', default: 'auto', options: [
      { value: 'auto', label: '自動（スマホ縦／PC横）' }, { value: 'vertical', label: '常に縦' }, { value: 'horizontal', label: '常に横' },
    ] },
    { key: 'scrub', label: 'スクロール連動', hint: 'オフ：画面に入ったら一度だけ順番に点灯', type: 'toggle', default: true },
    { key: 'lineWidth', label: '線の太さ', type: 'range', min: 1, max: 6, step: 1, default: 2, unit: 'px' },
    { key: 'showNumber', label: '丸の中を番号にする', hint: 'オフでアイコン表示', type: 'toggle', default: true },
  ],
  render: (v) => (
    <main className="min-h-screen bg-slate-50 px-4 dark:bg-slate-950">
      <div className="flex h-[55vh] flex-col items-center justify-center text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-slate-400">FLOW</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">ご利用の流れ</h2>
        <p className="mt-3 text-sm text-slate-500">↓ スクロールしてください</p>
      </div>
      <div className="mx-auto flex max-w-6xl justify-center rounded-3xl border border-slate-200 bg-white px-5 py-14 sm:px-10 dark:border-slate-800 dark:bg-slate-900">
        <StepFlow {...v} />
      </div>
      <div className="h-[80vh]" />
    </main>
  ),
});
