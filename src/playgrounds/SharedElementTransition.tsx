import { SharedElementTransition } from '../components/SharedElementTransition';
import { definePlayground } from '../playground/types';

type V = { duration: number; ease: string };

export default definePlayground<V>({
  note: 'サムネイルをクリックすると、画像とタイトルがそのまま詳細ページへ移動します。',
  controls: [
    { key: 'duration', label: '遷移の時間', type: 'range', min: 0.2, max: 2, step: 0.05, default: 0.8, unit: '秒' },
    {
      key: 'ease',
      label: '動き方',
      type: 'select',
      default: 'power3.inOut',
      options: [
        { value: 'power3.inOut', label: 'なめらか' },
        { value: 'expo.inOut', label: 'メリハリ強め' },
        { value: 'power2.out', label: '素早く始まる' },
        { value: 'back.inOut(1.2)', label: '少し弾む' },
      ],
    },
  ],
  render: (v) => <SharedElementTransition duration={v.duration} ease={v.ease} />,
});
