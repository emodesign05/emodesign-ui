import { InstagramFeedGridDemo } from '../components/InstagramFeedGrid';
import { definePlayground } from '../playground/types';

type V = {
  count: number;
  gap: number;
  radius: number;
  overlayOpacity: number;
  loop: boolean;
  account: string;
};

export default definePlayground<V>({
  note: 'サムネイルにホバーでいいね数・コメント数、クリックで拡大。モーダル内は ←→ キーで送り、Esc で閉じます。',
  controls: [
    { key: 'count', label: '表示件数', type: 'range', min: 3, max: 12, step: 3, default: 9, unit: '件' },
    { key: 'gap', label: 'マスの隙間', type: 'range', min: 0, max: 16, step: 1, default: 4, unit: 'px' },
    { key: 'radius', label: 'サムネイルの角丸', type: 'range', min: 0, max: 24, step: 1, default: 0, unit: 'px' },
    { key: 'overlayOpacity', label: 'オーバーレイの濃さ', type: 'range', min: 0.1, max: 0.8, step: 0.05, default: 0.45 },
    { key: 'loop', label: '前後送りをループ', hint: 'オフだと最初／最後でボタンが無効に', type: 'toggle', default: true },
    { key: 'account', label: 'アカウント名', type: 'text', default: 'atelier_hibi' },
  ],
  render: (v) => <InstagramFeedGridDemo {...v} />,
});
