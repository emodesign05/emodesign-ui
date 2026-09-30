import { MarqueeRow } from '../components/ScrollVelocityMarquee';
import { definePlayground } from '../playground/types';

type V = { text: string; baseVelocity: number; velocityFactor: number; outline: boolean };

export default definePlayground<V>({
  note: 'プレビュー内を上下にスクロールすると速度が変わります。',
  controls: [
    { key: 'text', label: 'テキスト', type: 'text', default: 'CREATIVE DEVELOPMENT' },
    { key: 'baseVelocity', label: '基本速度', hint: 'マイナスで逆方向（%/秒）', type: 'range', min: -10, max: 10, step: 0.5, default: -4 },
    { key: 'velocityFactor', label: 'スクロールの影響度', type: 'range', min: 0, max: 20, step: 0.5, default: 5 },
    { key: 'outline', label: '中抜き文字', type: 'toggle', default: false },
  ],
  render: (v) => (
    <main className="bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <section className="flex min-h-[60vh] items-end justify-center px-6 pb-10 text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">下へ・上へと速くスクロールしてみてください ↓</p>
      </section>
      <section className="border-y border-neutral-200 py-10 dark:border-neutral-800">
        <MarqueeRow
          text={v.text}
          baseVelocity={v.baseVelocity}
          velocityFactor={v.velocityFactor}
          className={`text-5xl font-black tracking-tight sm:text-8xl ${v.outline ? 'text-transparent [-webkit-text-stroke:1.5px_currentColor]' : ''}`}
        />
      </section>
      <section className="min-h-[140vh]" />
    </main>
  ),
});
