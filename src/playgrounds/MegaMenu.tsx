import { MegaMenuDemo } from '../components/MegaMenu';
import { definePlayground } from '../playground/types';

type V = {
  accent: 'indigo' | 'rose' | 'emerald' | 'slate';
  openDelay: number;
  closeDelay: number;
  duration: number;
  showFeatured: boolean;
  brandName: string;
};

export default definePlayground<V>({
  note: '「サービス」「実績」「リソース」にホバー（またはクリック・↓キー）でパネルが開きます。スマホ幅ではドロワーになります。',
  controls: [
    { key: 'accent', label: 'アクセント色', type: 'select', default: 'indigo', options: [
      { value: 'indigo', label: 'Indigo' }, { value: 'rose', label: 'Rose' },
      { value: 'emerald', label: 'Emerald' }, { value: 'slate', label: 'Slate' },
    ] },
    { key: 'openDelay', label: '開くまでの遅延', hint: 'カーソルが横切っただけで開かないように', type: 'range', min: 0, max: 400, step: 10, default: 80, unit: 'ms' },
    { key: 'closeDelay', label: '閉じるまでの遅延', hint: 'パネルへ移動する途中で閉じないように', type: 'range', min: 0, max: 800, step: 10, default: 220, unit: 'ms' },
    { key: 'duration', label: 'アニメーション時間', type: 'range', min: 0, max: 0.6, step: 0.02, default: 0.22, unit: '秒' },
    { key: 'showFeatured', label: 'おすすめ画像カード', type: 'toggle', default: true },
    { key: 'brandName', label: 'ブランド名', type: 'text', default: 'Studio Hibi' },
  ],
  render: (v) => <MegaMenuDemo {...v} />,
});
