import { ContactForm } from '../components/ContactForm';
import { definePlayground } from '../playground/types';

type V = {
  accent: 'indigo' | 'rose' | 'emerald' | 'slate';
  validateMode: 'input' | 'blur';
  submitMs: number;
  showSteps: boolean;
  radius: number;
};

export default definePlayground<V>({
  note: '入力 → 確認 → 完了の3ステップ。何も入力せずに「確認する」を押すとエラー表示を確認できます。',
  controls: [
    { key: 'accent', label: 'アクセント色', type: 'select', default: 'indigo', options: [
      { value: 'indigo', label: 'Indigo' }, { value: 'rose', label: 'Rose' },
      { value: 'emerald', label: 'Emerald' }, { value: 'slate', label: 'Slate（モノトーン）' },
    ] },
    { key: 'validateMode', label: 'エラー表示のタイミング', type: 'select', default: 'input', options: [
      { value: 'input', label: '入力中から（リアルタイム）' }, { value: 'blur', label: 'フォーカスが外れてから' },
    ] },
    { key: 'submitMs', label: '疑似送信の時間', type: 'range', min: 300, max: 5000, step: 100, default: 1800, unit: 'ms' },
    { key: 'showSteps', label: 'ステップ表示', type: 'toggle', default: true },
    { key: 'radius', label: 'カードの角丸', type: 'range', min: 0, max: 40, step: 2, default: 28, unit: 'px' },
  ],
  render: (v) => (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-8 dark:bg-slate-950">
      <div className="mx-auto flex max-w-2xl justify-center">
        <ContactForm {...v} />
      </div>
    </main>
  ),
});
