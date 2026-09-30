import { GlassmorphismCardLight } from '../components/GlassmorphismCard';
import { definePlayground } from '../playground/types';

type V = { blur: number; cardOpacity: number; radius: number; lift: number; orbStrength: number };

export default definePlayground<V>({
  controls: [
    { key: 'blur', label: 'ぼかし（backdrop-blur）', type: 'range', min: 0, max: 60, step: 1, default: 40, unit: 'px' },
    { key: 'cardOpacity', label: 'カードの白の濃さ', hint: '小さいほど背景が透ける', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5 },
    { key: 'orbStrength', label: '背景の色の強さ', type: 'range', min: 0, max: 1.5, step: 0.05, default: 1 },
    { key: 'radius', label: '角丸', type: 'range', min: 0, max: 60, step: 2, default: 24, unit: 'px' },
    { key: 'lift', label: 'ホバー時に浮く量', type: 'range', min: 0, max: 24, step: 1, default: 8, unit: 'px' },
  ],
  render: (v) => (
    <div className="flex min-h-screen items-center justify-center bg-slate-200 p-4">
      <GlassmorphismCardLight blur={v.blur} cardOpacity={v.cardOpacity} radius={v.radius} lift={v.lift} orbStrength={v.orbStrength} />
    </div>
  ),
});
