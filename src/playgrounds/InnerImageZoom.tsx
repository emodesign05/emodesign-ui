import { InnerImageZoom } from '../components/InnerImageZoom';
import { definePlayground } from '../playground/types';

type V = { zoom: number; aspect: 'portrait' | 'square' | 'wide' };

// Tailwind が静的に検出できるよう、クラス名は文字列リテラルで書く
const ASPECT = { portrait: 'aspect-[4/5]', square: 'aspect-square', wide: 'aspect-video' } as const;

export default definePlayground<V>({
  note: '画像にマウスを乗せると拡大します（タッチはタップ）。',
  controls: [
    { key: 'zoom', label: '拡大率', type: 'range', min: 1.2, max: 4, step: 0.1, default: 2.2, unit: 'x' },
    {
      key: 'aspect',
      label: '縦横比',
      type: 'select',
      default: 'portrait',
      options: [
        { value: 'portrait', label: '縦長 4:5' },
        { value: 'square', label: '正方形' },
        { value: 'wide', label: '横長 16:9' },
      ],
    },
  ],
  render: (v) => (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <InnerImageZoom
          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80"
          alt="ミニマルな腕時計"
          zoom={v.zoom}
          aspectClass={ASPECT[v.aspect]}
        />
      </div>
    </main>
  ),
});
