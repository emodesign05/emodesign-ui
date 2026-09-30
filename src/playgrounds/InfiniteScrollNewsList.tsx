import { InfiniteScrollNewsList } from '../components/InfiniteScrollNewsList';
import { definePlayground } from '../playground/types';

type V = {
  total: number; perPage: number; loadDelay: number;
  cardDuration: number; cardOffset: number; shimmerDuration: number; skeletonCount: number;
};

export default definePlayground<V>({
  remountOnChange: true,
  note: '下までスクロールすると次のニュースを読み込みます。値を変えると最初からやり直します。',
  controls: [
    { key: 'total', label: '全件数', type: 'range', min: 6, max: 40, step: 1, default: 15 },
    { key: 'perPage', label: '1回の読み込み件数', type: 'range', min: 2, max: 12, step: 1, default: 6 },
    { key: 'loadDelay', label: '読み込み待ち時間', type: 'range', min: 0, max: 3000, step: 100, default: 1000, unit: 'ms' },
    { key: 'cardDuration', label: 'カード出現の時間', type: 'range', min: 0.05, max: 1.5, step: 0.05, default: 0.25, unit: 's' },
    { key: 'cardOffset', label: 'カード出現の移動量', type: 'range', min: 0, max: 60, step: 1, default: 15, unit: 'px' },
    { key: 'shimmerDuration', label: 'スケルトンの光の速さ', type: 'range', min: 0.4, max: 4, step: 0.1, default: 1.5, unit: 's' },
    { key: 'skeletonCount', label: 'スケルトンの数', type: 'range', min: 1, max: 5, step: 1, default: 2 },
  ],
  render: (v) => <InfiniteScrollNewsList {...v} />,
});
