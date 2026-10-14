import { MasonryLightbox } from '../components/MasonryLightbox';
import { definePlayground } from '../playground/types';

type V = {
  columns: string;
  gap: number;
  stagger: number;
  loop: boolean;
  captions: boolean;
};

export default definePlayground<V>({
  note: '写真をクリックで拡大。← → キー・スワイプで前後送り、Esc / 背景クリックで閉じます。',
  remountOnChange: true,
  controls: [
    {
      key: 'columns',
      label: '最大列数（PC）',
      type: 'select',
      default: '3',
      options: [
        { value: '2', label: '2 列' },
        { value: '3', label: '3 列' },
        { value: '4', label: '4 列' },
      ],
    },
    { key: 'gap', label: '画像の間隔', type: 'range', min: 4, max: 40, step: 2, default: 16, unit: 'px' },
    { key: 'stagger', label: '表示の時間差', type: 'range', min: 0, max: 0.3, step: 0.01, default: 0.08, unit: '秒' },
    { key: 'loop', label: 'ループ送り', type: 'toggle', default: true, hint: 'オフにすると最初と最後で止まる' },
    { key: 'captions', label: 'キャプション', type: 'toggle', default: true },
  ],
  render: (v) => (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 sm:px-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl">
        <MasonryLightbox {...v} columns={Number(v.columns) as 2 | 3 | 4} />
      </div>
    </main>
  ),
});
