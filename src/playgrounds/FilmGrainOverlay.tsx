import { FilmGrain } from '../components/FilmGrainOverlay';
import { definePlayground } from '../playground/types';

type V = { opacity: number; frequency: number; animated: boolean; blend: 'overlay' | 'soft-light' | 'multiply' | 'normal' };

export default definePlayground<V>({
  controls: [
    { key: 'opacity', label: '強さ（不透明度）', type: 'range', min: 0, max: 0.6, step: 0.01, default: 0.18 },
    { key: 'frequency', label: '粒の細かさ', hint: '大きいほど細かい粒', type: 'range', min: 0.5, max: 1.2, step: 0.05, default: 0.85 },
    { key: 'animated', label: '動かす', type: 'toggle', default: true },
    {
      key: 'blend',
      label: '重ね方',
      type: 'select',
      default: 'overlay',
      options: [
        { value: 'overlay', label: 'overlay' },
        { value: 'soft-light', label: 'soft-light' },
        { value: 'multiply', label: 'multiply' },
        { value: 'normal', label: 'normal' },
      ],
    },
  ],
  render: (v) => (
    <main className="relative min-h-screen overflow-hidden bg-stone-900 text-stone-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,#f59e0b_0%,transparent_45%),radial-gradient(ellipse_at_80%_70%,#be185d_0%,transparent_50%),linear-gradient(160deg,#1c1917,#44403c)]" />
      <FilmGrain opacity={v.opacity} frequency={v.frequency} animated={v.animated} blend={v.blend} />
      <section className="relative flex min-h-screen flex-col justify-end px-8 pb-16 sm:px-16">
        <p className="text-xs font-semibold tracking-[0.35em] text-amber-200/80">FILM GRAIN</p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight sm:text-7xl">フィルムの、温度。</h1>
      </section>
    </main>
  ),
});
