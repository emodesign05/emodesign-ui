import { HoverImageDistortion } from '../components/HoverImageDistortion';
import { definePlayground } from '../playground/types';

type V = { strength: number; rgbShift: number; hoverDuration: number };

export default definePlayground<V>({
  note: '画像の上でマウスを動かすと、カーソルの周りが波打ちます。',
  controls: [
    { key: 'strength', label: '歪みの強さ', type: 'range', min: 0, max: 0.12, step: 0.005, default: 0.03 },
    { key: 'rgbShift', label: '色ずれ（RGB）', type: 'range', min: 0, max: 0.05, step: 0.002, default: 0.012 },
    { key: 'hoverDuration', label: '効果の出入りの時間', type: 'range', min: 0.1, max: 2, step: 0.1, default: 0.6, unit: '秒' },
  ],
  render: (v) => (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-10">
      <div className="aspect-[16/10] w-full max-w-4xl">
        <HoverImageDistortion strength={v.strength} rgbShift={v.rgbShift} hoverDuration={v.hoverDuration} />
      </div>
    </main>
  ),
});
