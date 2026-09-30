import { Sparkles } from 'lucide-react';
import { Layer, TiltCard } from '../components/TiltCard3D';
import { definePlayground } from '../playground/types';

type V = { maxTilt: number; glare: number; title: string; price: string };

export default definePlayground<V>({
  note: 'カードの上でマウスを動かしてください（タッチ操作では傾きません）。',
  controls: [
    { key: 'maxTilt', label: '最大の傾き', type: 'range', min: 0, max: 40, step: 1, default: 14, unit: '°' },
    { key: 'glare', label: '光沢の強さ', type: 'range', min: 0, max: 1, step: 0.05, default: 0.35 },
    { key: 'title', label: 'タイトル', type: 'text', default: 'Aurora' },
    { key: 'price', label: '価格表記', type: 'text', default: '¥12,800' },
  ],
  render: (v) => (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12 dark:bg-slate-950">
      <div className="w-full max-w-xs">
        <TiltCard maxTilt={v.maxTilt} glare={v.glare} className="aspect-[3/4] bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-5 shadow-2xl shadow-slate-900/20">
          <Layer depth={30} className="flex h-3/5 items-center justify-center overflow-hidden rounded-2xl bg-white/15 shadow-xl">
            <Sparkles className="h-16 w-16 text-white/80" aria-hidden />
          </Layer>
          <Layer depth={60} className="mt-5 text-white">
            <p className="text-[11px] font-semibold tracking-widest text-white/80">LIMITED</p>
            <h2 className="mt-1 text-2xl font-bold">{v.title}</h2>
          </Layer>
          <Layer depth={45} className="mt-3 flex items-center justify-between">
            <span className="text-lg font-semibold text-white">{v.price}</span>
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-slate-900">詳細を見る</span>
          </Layer>
        </TiltCard>
      </div>
    </main>
  ),
});
