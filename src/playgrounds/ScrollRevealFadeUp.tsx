import { Reveal } from '../components/ScrollRevealFadeUp';
import { definePlayground } from '../playground/types';

type V = { direction: 'up' | 'down' | 'left' | 'right' | 'scale'; duration: number; delay: number; amount: number; once: boolean };

export default definePlayground<V>({
  remountOnChange: true,
  note: 'プレビュー内をスクロールして、カードが画面に入る瞬間の動きを確認します。',
  controls: [
    {
      key: 'direction',
      label: '出現方向',
      type: 'select',
      default: 'up',
      options: [
        { value: 'up', label: '下から' },
        { value: 'down', label: '上から' },
        { value: 'left', label: '右から' },
        { value: 'right', label: '左から' },
        { value: 'scale', label: '拡大' },
      ],
    },
    { key: 'duration', label: '再生時間', type: 'range', min: 0.2, max: 2.5, step: 0.1, default: 0.8, unit: 's' },
    { key: 'delay', label: '開始までの遅延', type: 'range', min: 0, max: 1.5, step: 0.1, default: 0, unit: 's' },
    { key: 'amount', label: '発火の位置', hint: '要素がどれだけ見えたら始めるか', type: 'range', min: 0, max: 1, step: 0.05, default: 0.3 },
    { key: 'once', label: '1回だけ再生', type: 'toggle', default: true },
  ],
  render: (v) => (
    <main className="bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <section className="flex min-h-[80vh] items-center justify-center px-6">
        <p className="text-sm text-neutral-500">↓ スクロールしてください</p>
      </section>
      <section className="flex min-h-[70vh] items-center justify-center px-6">
        <Reveal direction={v.direction} duration={v.duration} delay={v.delay} amount={v.amount} once={v.once} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
          <p className="text-xs font-semibold tracking-widest text-indigo-600 dark:text-indigo-400">REVEAL</p>
          <h2 className="mt-2 text-2xl font-bold">画面に入ると、現れる。</h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">スクロールに合わせてふわっと表示されるブロックです。</p>
        </Reveal>
      </section>
      <section className="min-h-[80vh]" />
    </main>
  ),
});
