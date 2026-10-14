import { CompanyInfoAccess } from '../components/CompanyInfoAccess';
import { definePlayground } from '../playground/types';

type V = {
  accent: 'indigo' | 'rose' | 'emerald' | 'slate';
  mapQuery: string;
  zoom: number;
  mapHeight: number;
  layout: 'side' | 'stack';
  grayscale: boolean;
};

export default definePlayground<V>({
  note: '地図は API キー不要の Google マップ埋め込みです。検索語を変えると地図の場所が変わります。',
  controls: [
    { key: 'accent', label: 'アクセント色', type: 'select', default: 'indigo', options: [
      { value: 'indigo', label: 'Indigo' }, { value: 'rose', label: 'Rose' },
      { value: 'emerald', label: 'Emerald' }, { value: 'slate', label: 'Slate（モノトーン）' },
    ] },
    { key: 'mapQuery', label: '地図の検索語', hint: '実在の地名・住所（例：東京駅、大阪駅）', type: 'text', default: '東京駅' },
    { key: 'zoom', label: '地図のズーム', type: 'range', min: 10, max: 20, step: 1, default: 16 },
    { key: 'mapHeight', label: '地図の高さ', type: 'range', min: 240, max: 560, step: 10, default: 400, unit: 'px' },
    { key: 'layout', label: 'レイアウト', type: 'select', default: 'side', options: [
      { value: 'side', label: '左右（PC）' }, { value: 'stack', label: '地図を上に全幅' },
    ] },
    { key: 'grayscale', label: '地図をモノクロに', type: 'toggle', default: false },
  ],
  render: (v) => (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-8 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl justify-center">
        <CompanyInfoAccess {...v} />
      </div>
    </main>
  ),
});
