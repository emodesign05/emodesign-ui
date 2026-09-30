import { ScrollProgressBar } from '../components/ScrollProgressBar';
import { definePlayground } from '../playground/types';

type V = { height: number; scrub: number; color1: string; color2: string; color3: string };

export default definePlayground<V>({
  note: 'プレビュー内をスクロールすると、上部のバーが伸びます。',
  controls: [
    { key: 'height', label: 'バーの太さ', type: 'range', min: 2, max: 20, step: 1, default: 4, unit: 'px' },
    { key: 'scrub', label: '追従の遅れ', hint: '0 でスクロールに密着、大きいほどなめらかに遅れて追う', type: 'range', min: 0, max: 2, step: 0.1, default: 0.4, unit: '秒' },
    { key: 'color1', label: '色1（左）', type: 'color', default: '#6366f1' },
    { key: 'color2', label: '色2（中）', type: 'color', default: '#d946ef' },
    { key: 'color3', label: '色3（右）', type: 'color', default: '#fbbf24' },
  ],
  render: (v) => (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <ScrollProgressBar height={v.height} scrub={v.scrub} colors={[v.color1, v.color2, v.color3]} />
      <article className="mx-auto max-w-2xl space-y-8 px-6 py-24 text-base leading-loose text-slate-700 dark:text-slate-300">
        {Array.from({ length: 16 }, (_, i) => (
          <p key={i}>
            デザインの良し悪しは、細部の積み重ねで決まります。余白の取り方、文字の大きさ、色のコントラスト、そして動きのタイミング。ひとつひとつは小さな判断でも、それらが揃ったときにはじめて、使う人にとって心地よい体験が生まれます。
          </p>
        ))}
      </article>
    </main>
  ),
});
