import { ClipReveal } from '../components/ClipPathImageReveal';
import { definePlayground } from '../playground/types';

type V = { from: 'bottom' | 'left' | 'center' | 'circle'; duration: number; delay: number };

export default definePlayground<V>({
  remountOnChange: true,
  note: '値を変えるたびに最初から再生します。',
  controls: [
    {
      key: 'from',
      label: '開き方',
      type: 'select',
      default: 'bottom',
      options: [
        { value: 'bottom', label: '下から' },
        { value: 'left', label: '左から' },
        { value: 'center', label: '中央から' },
        { value: 'circle', label: '円形' },
      ],
    },
    { key: 'duration', label: '再生時間', type: 'range', min: 0.3, max: 3, step: 0.1, default: 1.2, unit: 's' },
    { key: 'delay', label: '開始までの遅延', type: 'range', min: 0, max: 2, step: 0.1, default: 0, unit: 's' },
  ],
  render: (v) => (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6 py-10 dark:bg-neutral-950">
      <ClipReveal
        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80"
        alt="霧の森"
        from={v.from}
        duration={v.duration}
        delay={v.delay}
        className="aspect-[4/3] w-full max-w-2xl rounded-2xl"
      />
    </main>
  ),
});
