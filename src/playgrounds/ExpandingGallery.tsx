import { ExpandingGallery } from '../components/ExpandingGallery';
import { definePlayground } from '../playground/types';

type V = {
  expandRatio: number;
  duration: number;
  trigger: 'hover' | 'click';
  height: number;
  gap: number;
};

export default definePlayground<V>({
  note: 'パネルにカーソルを合わせる（スマホはタップ）と横に広がります。スマホ幅では縦積みになります。',
  controls: [
    { key: 'expandRatio', label: '広がりの比率', type: 'range', min: 2, max: 10, step: 0.5, default: 5, hint: '閉じたパネルを 1 としたときの幅' },
    { key: 'duration', label: 'アニメーション時間', type: 'range', min: 0.2, max: 1.6, step: 0.05, default: 0.8, unit: '秒' },
    {
      key: 'trigger',
      label: '開くきっかけ',
      type: 'select',
      default: 'hover',
      options: [
        { value: 'hover', label: 'ホバー / フォーカス' },
        { value: 'click', label: 'クリックのみ' },
      ],
    },
    { key: 'height', label: '高さ（PC）', type: 'range', min: 360, max: 760, step: 10, default: 560, unit: 'px' },
    { key: 'gap', label: 'パネルの隙間', type: 'range', min: 0, max: 32, step: 2, default: 12, unit: 'px' },
  ],
  render: (v) => (
    <main className="flex min-h-screen items-center bg-stone-100 px-4 py-10 sm:px-10 dark:bg-stone-950">
      <div className="mx-auto w-full max-w-7xl">
        <ExpandingGallery {...v} />
      </div>
    </main>
  ),
});
