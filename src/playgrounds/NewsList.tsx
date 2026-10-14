import { NewsList } from '../components/NewsList';
import { definePlayground } from '../playground/types';

type V = {
  accent: 'indigo' | 'rose' | 'emerald' | 'slate';
  newDays: number;
  initialCount: number;
  loadStep: number;
  showTabs: boolean;
};

export default definePlayground<V>({
  note: 'タブでカテゴリを絞り込み、「もっと見る」で続きを表示します。タイトルにホバーすると下線が伸びます。',
  remountOnChange: true,
  controls: [
    { key: 'accent', label: 'アクセント色', type: 'select', default: 'indigo', options: [
      { value: 'indigo', label: 'Indigo' }, { value: 'rose', label: 'Rose' },
      { value: 'emerald', label: 'Emerald' }, { value: 'slate', label: 'Slate（モノトーン）' },
    ] },
    { key: 'newDays', label: 'NEW を付ける期間', hint: '公開から何日以内を NEW にするか', type: 'range', min: 0, max: 60, step: 1, default: 14, unit: '日' },
    { key: 'initialCount', label: '最初の表示件数', type: 'range', min: 3, max: 12, step: 1, default: 5, unit: '件' },
    { key: 'loadStep', label: '「もっと見る」の追加件数', type: 'range', min: 1, max: 12, step: 1, default: 3, unit: '件' },
    { key: 'showTabs', label: 'カテゴリタブを表示', type: 'toggle', default: true },
  ],
  render: (v) => (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-8 dark:bg-slate-950">
      <div className="mx-auto flex max-w-4xl justify-center">
        <NewsList {...v} />
      </div>
    </main>
  ),
});
