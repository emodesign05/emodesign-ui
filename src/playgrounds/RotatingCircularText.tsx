import { RotatingBadge } from '../components/RotatingCircularText';
import { definePlayground } from '../playground/types';

type V = { text: string; size: number; duration: number; hoverBoost: number; scrollBoost: boolean };

export default definePlayground<V>({
  note: 'バッジにカーソルを乗せると加速します。プレビュー内をスクロールしても回転が変わります。',
  controls: [
    { key: 'text', label: '円に沿う文字', hint: '最後に区切り（•）を入れると一周がきれいにつながる', type: 'text', default: 'SCROLL DOWN • SCROLL DOWN • ' },
    { key: 'size', label: '直径', type: 'range', min: 80, max: 320, step: 10, default: 140, unit: 'px' },
    { key: 'duration', label: '1周の時間', hint: '小さいほど速く回る', type: 'range', min: 2, max: 40, step: 1, default: 12, unit: '秒' },
    { key: 'hoverBoost', label: 'ホバー時の加速', type: 'range', min: 1, max: 10, step: 0.5, default: 4, unit: '倍' },
    { key: 'scrollBoost', label: 'スクロールに反応', type: 'toggle', default: true },
  ],
  render: (v) => (
    <main className="min-h-[200vh] bg-stone-100 text-stone-900 dark:bg-neutral-950 dark:text-white">
      <div className="sticky top-0 flex h-screen items-center justify-center">
        <RotatingBadge text={v.text} size={v.size} duration={v.duration} hoverBoost={v.hoverBoost} scrollBoost={v.scrollBoost} />
      </div>
    </main>
  ),
});
