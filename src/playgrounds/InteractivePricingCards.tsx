import { InteractivePricingCards } from '../components/InteractivePricingCards';
import { definePlayground } from '../playground/types';

type V = {
  accent: 'indigo' | 'rose' | 'emerald' | 'violet';
  defaultYearly: boolean; discountLabel: string;
  stiffness: number; damping: number; priceDuration: number; radius: number; popularLift: number;
};

export default definePlayground<V>({
  remountOnChange: true,
  note: '月払い／年払いのスイッチで価格が切り替わります。PC幅で3列になります。',
  controls: [
    { key: 'accent', label: 'アクセント色', type: 'select', default: 'indigo', options: [
      { value: 'indigo', label: 'Indigo' }, { value: 'rose', label: 'Rose' },
      { value: 'emerald', label: 'Emerald' }, { value: 'violet', label: 'Violet' },
    ] },
    { key: 'defaultYearly', label: '最初から年払い', type: 'toggle', default: false },
    { key: 'discountLabel', label: '割引バッジの文言', type: 'text', default: '20% OFF' },
    { key: 'stiffness', label: 'スイッチの硬さ', type: 'range', min: 100, max: 1000, step: 20, default: 500 },
    { key: 'damping', label: 'スイッチの減衰', type: 'range', min: 5, max: 60, step: 1, default: 30 },
    { key: 'priceDuration', label: '価格切替の時間', type: 'range', min: 0.05, max: 1, step: 0.05, default: 0.2, unit: 's' },
    { key: 'radius', label: 'カードの角丸', type: 'range', min: 0, max: 48, step: 2, default: 24, unit: 'px' },
    { key: 'popularLift', label: 'おすすめカードの浮き', type: 'range', min: 0, max: 30, step: 1, default: 8, unit: 'px' },
  ],
  render: (v) => (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6">
      <InteractivePricingCards {...v} />
    </div>
  ),
});
