import { InlineNewsletterSignupBar } from '../components/InlineNewsletterSignupBar';
import { definePlayground } from '../playground/types';

type V = { theme: 'cyan' | 'emerald' | 'rose' | 'violet'; loadingMs: number; duration: number; radius: number };

export default definePlayground<V>({
  note: 'メールアドレスを入力して送信すると、ローディング後に完了画面へ切り替わります。',
  controls: [
    { key: 'theme', label: 'カラーテーマ', type: 'select', default: 'cyan', options: [
      { value: 'cyan', label: 'Cyan' }, { value: 'emerald', label: 'Emerald' },
      { value: 'rose', label: 'Rose' }, { value: 'violet', label: 'Violet' },
    ] },
    { key: 'loadingMs', label: '送信中の時間', type: 'range', min: 200, max: 4000, step: 100, default: 1500, unit: 'ms' },
    { key: 'duration', label: '画面切替の時間', type: 'range', min: 0.05, max: 1, step: 0.05, default: 0.2, unit: 's' },
    { key: 'radius', label: '角丸', type: 'range', min: 0, max: 48, step: 2, default: 24, unit: 'px' },
  ],
  render: (v) => (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <InlineNewsletterSignupBar {...v} />
    </div>
  ),
});
