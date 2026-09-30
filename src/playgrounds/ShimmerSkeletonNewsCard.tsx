import { ShimmerDemo } from '../components/ShimmerSkeletonNewsCard';
import { definePlayground } from '../playground/types';

type V = { shimmerDuration: number; fadeDuration: number; startLoading: boolean };

export default definePlayground<V>({
  remountOnChange: true,
  note: '上のボタンでスケルトンと実データを切り替えられます。',
  controls: [
    { key: 'shimmerDuration', label: '光が流れる時間', type: 'range', min: 0.4, max: 4, step: 0.1, default: 1.5, unit: 's' },
    { key: 'fadeDuration', label: '切替のフェード時間', type: 'range', min: 0.05, max: 1.5, step: 0.05, default: 0.3, unit: 's' },
    { key: 'startLoading', label: '最初はスケルトン', type: 'toggle', default: true },
  ],
  render: (v) => <ShimmerDemo {...v} />,
});
