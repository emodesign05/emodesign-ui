import { CircleClipMenu } from '../components/CircleClipMenu';
import { definePlayground } from '../playground/types';

type V = { openDuration: number; closeDuration: number; stagger: number; bgColor: string };

export default definePlayground<V>({
  note: '右上のボタンを押すと、その位置から円が広がります（Escで閉じる）。',
  controls: [
    { key: 'openDuration', label: '開く時間', type: 'range', min: 0.2, max: 2, step: 0.05, default: 0.8, unit: 's' },
    { key: 'closeDuration', label: '閉じる時間', type: 'range', min: 0.2, max: 2, step: 0.05, default: 0.6, unit: 's' },
    { key: 'stagger', label: '項目ごとのずれ', type: 'range', min: 0, max: 0.25, step: 0.01, default: 0.07, unit: 's' },
    { key: 'bgColor', label: 'メニューの背景色', type: 'color', default: '#4f46e5' },
  ],
  render: (v) => (
    <main className="min-h-screen bg-stone-100 text-slate-900 dark:bg-slate-950 dark:text-white">
      <CircleClipMenu openDuration={v.openDuration} closeDuration={v.closeDuration} stagger={v.stagger} bgColor={v.bgColor} />
      <section className="flex min-h-screen flex-col justify-center px-8 sm:px-16">
        <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
          右上のボタンから、
          <br />
          円が画面を満たす。
        </h1>
      </section>
    </main>
  ),
});
