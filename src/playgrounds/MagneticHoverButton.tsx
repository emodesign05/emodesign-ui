import { ArrowUpRight, Play } from 'lucide-react';
import { MagneticButton } from '../components/MagneticHoverButton';
import { definePlayground } from '../playground/types';

type V = { variant: 'solid' | 'outline' | 'circle'; strength: number; labelStrength: number; label: string };

export default definePlayground<V>({
  note: 'ボタンの周りでマウスを動かしてください（タッチ操作では吸着しません）。',
  controls: [
    {
      key: 'variant',
      label: '形',
      type: 'select',
      default: 'solid',
      options: [
        { value: 'solid', label: '塗り' },
        { value: 'outline', label: '枠線' },
        { value: 'circle', label: '円形' },
      ],
    },
    { key: 'strength', label: '本体の吸着量', type: 'range', min: 0, max: 1, step: 0.05, default: 0.35 },
    { key: 'labelStrength', label: 'ラベルの吸着量', hint: '本体より大きくすると奥行きが出ます', type: 'range', min: 0, max: 1.5, step: 0.05, default: 0.55 },
    { key: 'label', label: 'ラベル', hint: '円形ではアイコン表示', type: 'text', default: 'お問い合わせ' },
  ],
  render: (v) => (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-slate-950">
      <MagneticButton variant={v.variant} strength={v.strength} labelStrength={v.labelStrength} ariaLabel={v.variant === 'circle' ? v.label : undefined}>
        {v.variant === 'circle' ? (
          <Play className="h-6 w-6" />
        ) : (
          <>
            {v.label} <ArrowUpRight className="h-4 w-4" />
          </>
        )}
      </MagneticButton>
    </main>
  ),
});
