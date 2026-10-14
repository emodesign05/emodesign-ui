import { FlipCardGrid } from '../components/FlipCard3D';
import { definePlayground } from '../playground/types';

type V = {
  axis: 'x' | 'y';
  trigger: 'hover' | 'click';
  duration: number;
  bounce: number;
  perspective: number;
  count: number;
};

export default definePlayground<V>({
  note: 'カードにホバー（click モードではクリック）すると裏返ります。Tab で移動してキーボードでも確認できます。',
  controls: [
    { key: 'axis', label: '回転軸', type: 'select', default: 'y', options: [
      { value: 'y', label: 'Y 軸（左右に返す）' },
      { value: 'x', label: 'X 軸（上下に返す）' },
    ] },
    { key: 'trigger', label: 'トリガー', type: 'select', default: 'hover', options: [
      { value: 'hover', label: 'ホバー／フォーカス' },
      { value: 'click', label: 'クリック／タップ' },
    ] },
    { key: 'duration', label: '回転の時間', type: 'range', min: 0.2, max: 2, step: 0.05, default: 0.8, unit: 's' },
    { key: 'bounce', label: '揺り戻し', hint: '0 で揺れずにピタッと止まる', type: 'range', min: 0, max: 0.5, step: 0.05, default: 0.2 },
    { key: 'perspective', label: '奥行き（perspective）', hint: '小さいほどパースが強い', type: 'range', min: 400, max: 3000, step: 50, default: 1200, unit: 'px' },
    { key: 'count', label: '枚数', type: 'range', min: 1, max: 6, step: 1, default: 6, unit: '枚' },
  ],
  render: (v) => (
    <div className="flex min-h-screen items-center bg-slate-100 px-4 py-12 sm:px-10 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl">
        <FlipCardGrid {...v} />
      </div>
    </div>
  ),
});
