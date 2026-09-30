import { ScrambleText } from '../components/TextScramble';
import { definePlayground } from '../playground/types';

type V = { text: string; duration: number; chars: 'upper' | 'alnum' | 'symbol' | 'katakana'; speed: number; replayOnHover: boolean };

export default definePlayground<V>({
  remountOnChange: true,
  note: '値を変えるたびに最初から再生します。文字にカーソルを乗せても再生します。',
  controls: [
    { key: 'text', label: 'テキスト', type: 'text', default: 'DECODE THE FUTURE' },
    { key: 'duration', label: '再生時間', type: 'range', min: 0.3, max: 4, step: 0.1, default: 1.2, unit: '秒' },
    {
      key: 'chars',
      label: 'ランダム文字の種類',
      type: 'select',
      default: 'upper',
      options: [
        { value: 'upper', label: '英大文字' },
        { value: 'alnum', label: '英数字' },
        { value: 'symbol', label: '記号' },
        { value: 'katakana', label: 'カタカナ' },
      ],
    },
    { key: 'speed', label: '入れ替わりの激しさ', type: 'range', min: 0.1, max: 1, step: 0.05, default: 0.6 },
    { key: 'replayOnHover', label: 'ホバーで再生', type: 'toggle', default: true },
  ],
  render: (v) => (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 font-mono text-white">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        <ScrambleText text={v.text} duration={v.duration} chars={v.chars} speed={v.speed} replayOnHover={v.replayOnHover} />
      </h1>
    </main>
  ),
});
