import { GooeyBlobs } from '../components/GooeyBlobs';
import { definePlayground } from '../playground/types';

type V = { blur: number; followers: number; color: string; lag: number };

export default definePlayground<V>({
  note: 'プレビューの上でマウスを動かすと、玉が液体のようにくっついたり離れたりします。',
  controls: [
    { key: 'blur', label: 'くっつき具合', hint: '大きいほど遠くからくっつく（大きすぎると輪郭がぼやける）', type: 'range', min: 4, max: 30, step: 1, default: 14 },
    { key: 'followers', label: '追従する玉の数', type: 'range', min: 1, max: 10, step: 1, default: 5 },
    { key: 'lag', label: '追従の遅れ', type: 'range', min: 0.05, max: 1, step: 0.05, default: 0.25, unit: '秒' },
    { key: 'color', label: '玉の色', type: 'color', default: '#6366f1' },
  ],
  render: (v) => <GooeyBlobs blur={v.blur} followers={v.followers} lag={v.lag} color={v.color} />,
});
