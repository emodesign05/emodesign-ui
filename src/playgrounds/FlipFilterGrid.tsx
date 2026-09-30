import { FlipFilterGrid } from '../components/FlipFilterGrid';
import { definePlayground } from '../playground/types';

type V = { duration: number; stagger: number; ease: string };

export default definePlayground<V>({
  note: '上のボタンでカテゴリを切り替えると、カードが並び直します。',
  controls: [
    { key: 'duration', label: '移動の時間', type: 'range', min: 0.2, max: 2, step: 0.05, default: 0.7, unit: '秒' },
    { key: 'stagger', label: 'カードごとの時間差', type: 'range', min: 0, max: 0.2, step: 0.01, default: 0.03, unit: '秒' },
    {
      key: 'ease',
      label: '動き方',
      type: 'select',
      default: 'power3.inOut',
      options: [
        { value: 'power3.inOut', label: 'なめらか' },
        { value: 'expo.out', label: '素早く止まる' },
        { value: 'back.inOut(1.4)', label: '少し弾む' },
        { value: 'elastic.out(1, 0.6)', label: 'バネ' },
      ],
    },
  ],
  render: (v) => (
    <main className="min-h-screen bg-slate-50 px-6 py-16 dark:bg-slate-950">
      <FlipFilterGrid duration={v.duration} stagger={v.stagger} ease={v.ease} />
    </main>
  ),
});
