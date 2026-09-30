import { SplineScene } from '../components/SplineSceneWrapper';
import { definePlayground } from '../playground/types';

type V = { scene: string; height: number; preloadMargin: '0px' | '300px' | '800px' };

export default definePlayground<V>({
  remountOnChange: true,
  note: 'Spline の書き出しURL（.splinecode）を貼ると、そのシーンに差し替わります。',
  controls: [
    { key: 'scene', label: 'シーンのURL', hint: 'Spline の Export → Code → React で得られるURL', type: 'text', default: 'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode' },
    { key: 'height', label: '高さ', type: 'range', min: 240, max: 800, step: 20, default: 520, unit: 'px' },
    {
      key: 'preloadMargin',
      label: '読み込み開始の位置',
      hint: '画面の何px手前で読み込みを始めるか',
      type: 'select',
      default: '300px',
      options: [
        { value: '0px', label: '見えてから' },
        { value: '300px', label: '300px手前' },
        { value: '800px', label: '800px手前' },
      ],
    },
  ],
  render: (v) => (
    <main className="min-h-screen bg-slate-950 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl" style={{ height: v.height }}>
        <SplineScene scene={v.scene} preloadMargin={v.preloadMargin} className="h-full rounded-3xl border border-white/10" />
      </div>
    </main>
  ),
});
