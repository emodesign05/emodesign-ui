import { StatsSection } from '../components/NumberCountUp';
import { definePlayground } from '../playground/types';

type V = { duration: number; stagger: number; ease: string };

export default definePlayground<V>({
  remountOnChange: true,
  note: '値を変えるたびに最初から再生します。',
  controls: [
    { key: 'duration', label: 'カウント時間', type: 'range', min: 0.3, max: 5, step: 0.1, default: 2, unit: '秒' },
    { key: 'stagger', label: '数字ごとのずれ', type: 'range', min: 0, max: 0.6, step: 0.05, default: 0.15, unit: '秒' },
    {
      key: 'ease',
      label: '増え方',
      type: 'select',
      default: 'expo.out',
      options: [
        { value: 'expo.out', label: '最初速く・最後じっくり' },
        { value: 'power2.inOut', label: 'ゆっくり始まり・ゆっくり終わる' },
        { value: 'none', label: '一定の速さ' },
        { value: 'back.out(1.4)', label: '少し行き過ぎて戻る' },
      ],
    },
  ],
  render: (v) => (
    <main className="flex min-h-screen items-center bg-white dark:bg-slate-950">
      <StatsSection duration={v.duration} stagger={v.stagger} ease={v.ease} />
    </main>
  ),
});
