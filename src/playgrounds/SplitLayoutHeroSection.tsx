import { SplitHeroDemo } from '../components/SplitLayoutHeroSection';
import { definePlayground } from '../playground/types';

type V = {
  accent: 'indigo' | 'rose' | 'emerald' | 'violet';
  line1: string; line2: string;
  enterDuration: number; slide: number; floatDistance: number; floatDuration: number;
};

export default definePlayground<V>({
  remountOnChange: true,
  note: '読み込み時のアニメーションと右カードの浮遊を調整できます。',
  controls: [
    { key: 'accent', label: 'アクセント色', type: 'select', default: 'indigo', options: [
      { value: 'indigo', label: 'Indigo' }, { value: 'rose', label: 'Rose' },
      { value: 'emerald', label: 'Emerald' }, { value: 'violet', label: 'Violet' },
    ] },
    { key: 'line1', label: '見出し1行目', type: 'text', default: 'Webアプリ開発を' },
    { key: 'line2', label: '見出し2行目', type: 'text', default: '10倍アップデートする' },
    { key: 'enterDuration', label: '登場の時間', type: 'range', min: 0.1, max: 2, step: 0.1, default: 0.5, unit: 's' },
    { key: 'slide', label: '左からのスライド量', type: 'range', min: 0, max: 100, step: 2, default: 20, unit: 'px' },
    { key: 'floatDistance', label: '浮遊の高さ', type: 'range', min: 0, max: 40, step: 1, default: 12, unit: 'px' },
    { key: 'floatDuration', label: '浮遊の周期', type: 'range', min: 1, max: 10, step: 0.5, default: 4, unit: 's' },
  ],
  render: (v) => <SplitHeroDemo {...v} />,
});
