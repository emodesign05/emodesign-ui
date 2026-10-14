import { SplitScreenScroll } from '../components/SplitScreenScroll';
import { definePlayground } from '../playground/types';

type V = {
  chapters: number;
  reverse: boolean;
  fadeDuration: number;
  zoom: number;
};

export default definePlayground<V>({
  note: 'プレビュー内をスクロールすると、固定側の写真と見出しが章ごとに切り替わります（幅 1024px 以上で分割表示）。',
  controls: [
    { key: 'chapters', label: '章の数', type: 'range', min: 2, max: 6, step: 1, default: 4, unit: '章' },
    { key: 'reverse', label: '左右を入れ替える', hint: 'ON で固定側が右になる', type: 'toggle', default: false },
    { key: 'fadeDuration', label: 'クロスフェードの時間', type: 'range', min: 0.2, max: 2, step: 0.05, default: 0.9, unit: 's' },
    { key: 'zoom', label: '画像の寄り', hint: '切り替わり時の拡大率（1 = なし）', type: 'range', min: 1, max: 1.3, step: 0.01, default: 1.12, unit: '倍' },
  ],
  render: (v) => (
    <main className="bg-[#f5f2ec] text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="flex min-h-[50vh] flex-col justify-end px-5 pb-12 sm:px-10 lg:px-16">
        <p className="font-mono text-xs tracking-[0.35em] text-stone-500">ATELIER NIWA — PROCESS</p>
        <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">一軒の家が、できるまで。</h2>
      </header>
      <SplitScreenScroll {...v} />
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-stone-500">— END —</div>
    </main>
  ),
});
