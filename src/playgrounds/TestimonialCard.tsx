import { TestimonialWall } from '../components/TestimonialCard';
import { definePlayground } from '../playground/types';

type V = { total: number; perPage: number; loadDelay: number; cardDuration: number; cardOffset: number; columns: '1' | '2' | '3' };

export default definePlayground<V>({
  remountOnChange: true,
  note: '下までスクロールすると次のレビューを読み込みます。値を変えると最初からやり直します。',
  controls: [
    { key: 'columns', label: '最大列数', type: 'select', default: '3', options: [
      { value: '1', label: '1列' }, { value: '2', label: '2列' }, { value: '3', label: '3列' },
    ] },
    { key: 'total', label: '全件数', type: 'range', min: 6, max: 60, step: 1, default: 24 },
    { key: 'perPage', label: '1回の読み込み件数', type: 'range', min: 2, max: 12, step: 1, default: 6 },
    { key: 'loadDelay', label: '読み込み待ち時間', type: 'range', min: 0, max: 3000, step: 100, default: 500, unit: 'ms' },
    { key: 'cardDuration', label: 'カード出現の時間', type: 'range', min: 0.05, max: 1.5, step: 0.05, default: 0.25, unit: 's' },
    { key: 'cardOffset', label: 'カード出現の移動量', type: 'range', min: 0, max: 60, step: 1, default: 15, unit: 'px' },
  ],
  render: (v) => <TestimonialWall {...v} columns={Number(v.columns) as 1 | 2 | 3} />,
});
