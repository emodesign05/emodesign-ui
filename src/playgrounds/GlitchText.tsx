import { GlitchText } from '../components/GlitchText';
import { definePlayground } from '../playground/types';

type V = {
  text: string;
  frequency: number;
  intensity: number;
  colorA: string;
  colorB: string;
  hoverBoost: boolean;
};

export default definePlayground<V>({
  note: '文字にカーソルを乗せると（hoverBoost が ON なら）グリッチが激しくなります。',
  controls: [
    { key: 'text', label: 'テキスト', type: 'text', default: 'SIGNAL LOST' },
    { key: 'frequency', label: '発生頻度', hint: '1 秒あたりの平均回数', type: 'range', min: 0.1, max: 3, step: 0.1, default: 0.6, unit: '回/s' },
    { key: 'intensity', label: '強さ', hint: 'ずれ幅・傾き・ノイズの濃さ', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5 },
    { key: 'colorA', label: 'ずれ色 1', type: 'color', default: '#ff2a6d' },
    { key: 'colorB', label: 'ずれ色 2', type: 'color', default: '#05d9e8' },
    { key: 'hoverBoost', label: 'ホバーで強くする', type: 'toggle', default: true },
  ],
  render: (v) => (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 3px)' }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,black_85%)]" />
      <div className="relative text-center">
        <p className="font-mono text-[11px] tracking-[0.4em] text-white/50">NEON//FRAME 2026</p>
        <h2 className="mt-4 text-[clamp(2.5rem,11vw,8rem)] font-black leading-none tracking-tighter">
          <GlitchText {...v} />
        </h2>
      </div>
    </div>
  ),
});
