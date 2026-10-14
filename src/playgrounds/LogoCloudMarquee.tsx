import { LogoCloudMarquee } from '../components/LogoCloudMarquee';
import { definePlayground } from '../playground/types';

type V = {
  speed: number;
  dualRow: boolean;
  pauseOnHover: boolean;
  fadeWidth: number;
  gap: number;
  direction: 'left' | 'right';
};

export default definePlayground<V>({
  note: 'ロゴはすべて架空です。ホバーすると流れがゆっくり止まります。',
  controls: [
    { key: 'speed', label: '速度', type: 'range', min: 10, max: 160, step: 5, default: 40, unit: 'px/秒' },
    { key: 'dualRow', label: '2 段（逆方向）', type: 'toggle', default: true },
    { key: 'pauseOnHover', label: 'ホバーで一時停止', type: 'toggle', default: true },
    { key: 'fadeWidth', label: '両端のフェード幅', type: 'range', min: 0, max: 30, step: 1, default: 12, unit: '%' },
    { key: 'gap', label: 'ロゴの間隔', type: 'range', min: 24, max: 120, step: 4, default: 56, unit: 'px' },
    {
      key: 'direction',
      label: '流れる向き',
      type: 'select',
      default: 'left',
      options: [
        { value: 'left', label: '左へ' },
        { value: 'right', label: '右へ' },
      ],
    },
  ],
  render: (v) => (
    <main className="flex min-h-screen flex-col justify-center bg-white py-16 dark:bg-slate-950">
      <p className="mb-8 text-center text-xs font-semibold tracking-[0.3em] text-slate-400">TRUSTED BY</p>
      <LogoCloudMarquee {...v} />
    </main>
  ),
});
