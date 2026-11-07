import { VelocityWebGLGallery } from '../components/VelocityWebGLGallery';
import { definePlayground } from '../playground/types';

type V = { bend: number; wave: number; rgbShift: number; radius: number; smoothScroll: boolean };

export default definePlayground<V>({
  note: 'プレビュー内を勢いよくスクロールすると、画像が曲がって波打ちます。止まると元に戻ります。',
  controls: [
    { key: 'bend', label: '弓なりの強さ', hint: '速いときに最大何 px たわむか', type: 'range', min: 0, max: 200, step: 5, default: 60, unit: 'px' },
    { key: 'wave', label: '波の強さ', type: 'range', min: 0, max: 30, step: 1, default: 8, unit: 'px' },
    { key: 'rgbShift', label: 'RGBのずれ', type: 'range', min: 0, max: 0.06, step: 0.005, default: 0.02 },
    { key: 'radius', label: '角丸', type: 'range', min: 0, max: 60, step: 2, default: 16, unit: 'px' },
    { key: 'smoothScroll', label: '慣性スクロール（Lenis）', hint: 'オフにするとブラウザ標準のスクロール', type: 'toggle', default: true },
  ],
  render: (v) => (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="flex h-[70vh] flex-col justify-end px-6 pb-12 sm:px-12">
        <h1 className="max-w-4xl text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">速く動かすほど、画像がしなる。</h1>
        <p className="mt-4 text-sm text-white/60">勢いよくスクロールしてみてください ↓</p>
      </header>
      <VelocityWebGLGallery {...v} />
      <footer className="h-[40vh]" />
    </main>
  ),
});
