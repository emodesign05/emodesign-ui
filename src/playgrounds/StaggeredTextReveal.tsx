import { StaggeredText } from '../components/StaggeredTextReveal';
import { definePlayground } from '../playground/types';

type V = { text: string; splitBy: 'char' | 'word'; stagger: number; delay: number };

export default definePlayground<V>({
  remountOnChange: true,
  note: '値を変えるたびに最初から再生します。',
  controls: [
    { key: 'text', label: 'テキスト', type: 'text', multiline: true, default: '言葉が、ひとつずつ届く。' },
    {
      key: 'splitBy',
      label: '分割単位',
      type: 'select',
      default: 'char',
      options: [
        { value: 'char', label: '1文字ずつ' },
        { value: 'word', label: '単語ずつ' },
      ],
    },
    { key: 'stagger', label: '1つごとの遅延', hint: '大きいほどゆっくり順番に表示', type: 'range', min: 0.01, max: 0.25, step: 0.005, default: 0.06, unit: 's' },
    { key: 'delay', label: '開始までの遅延', type: 'range', min: 0, max: 2, step: 0.1, default: 0, unit: 's' },
  ],
  render: (v) => (
    <main className="flex min-h-screen items-center bg-stone-50 px-6 text-stone-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto w-full max-w-4xl">
        <StaggeredText
          as="h1"
          text={v.text}
          splitBy={v.splitBy}
          stagger={v.stagger}
          delay={v.delay}
          className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl"
        />
      </div>
    </main>
  ),
});
