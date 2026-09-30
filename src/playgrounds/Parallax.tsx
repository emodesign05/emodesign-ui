import { ParallaxSectionInertiaFixed } from '../components/Parallax';
import { definePlayground } from '../playground/types';

type V = {
  scrub: number; shift: number; imageOpacity: number; height: number;
  subtitle: string; title: string;
};

export default definePlayground<V>({
  note: 'ページをスクロールすると背景が慣性付きで動きます（GSAP ScrollTrigger）。',
  controls: [
    { key: 'scrub', label: '追従の遅れ', hint: '0 でスクロールに密着、大きいほどゆったり追いつく', type: 'range', min: 0, max: 3, step: 0.1, default: 1, unit: '秒' },
    { key: 'shift', label: '背景の動く量', type: 'range', min: 0, max: 15, step: 0.5, default: 12.5, unit: '%' },
    { key: 'imageOpacity', label: '背景画像の濃さ', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5 },
    { key: 'height', label: 'セクションの高さ', type: 'range', min: 50, max: 120, step: 5, default: 85, unit: 'vh' },
    { key: 'subtitle', label: 'サブタイトル', type: 'text', default: 'STABLE INERTIA PARALLAX' },
    { key: 'title', label: 'タイトル', type: 'text', multiline: true, default: 'スクロール量に左右されない、常に均一で滑らかな慣性表現' },
  ],
  render: (v) => (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <section className="flex h-[70vh] flex-col items-center justify-center bg-slate-900 p-6 text-center">
        <p className="text-sm text-slate-400">↓ スクロールしてください</p>
      </section>
      <ParallaxSectionInertiaFixed {...v} />
      <section className="h-[80vh] bg-slate-900" />
    </div>
  ),
});
