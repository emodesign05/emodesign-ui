import { ShaderGradientBackground } from '../components/ShaderGradientBackground';
import { definePlayground } from '../playground/types';

type V = { colorA: string; colorB: string; colorC: string; speed: number; noiseScale: number; grain: number };

export default definePlayground<V>({
  note: '色や流れの速さをリアルタイムに変えられます。マウスを動かすと流れがわずかにずれます。',
  controls: [
    { key: 'colorA', label: '色1', type: 'color', default: '#4f46e5' },
    { key: 'colorB', label: '色2', type: 'color', default: '#ec4899' },
    { key: 'colorC', label: '色3（差し色）', type: 'color', default: '#fbbf24' },
    { key: 'speed', label: '流れる速さ', type: 'range', min: 0, max: 4, step: 0.1, default: 1, unit: '倍' },
    { key: 'noiseScale', label: '模様の細かさ', hint: '大きいほど細かく複雑な模様', type: 'range', min: 0.3, max: 4, step: 0.1, default: 0.9 },
    { key: 'grain', label: '粒子感', type: 'range', min: 0, max: 0.2, step: 0.01, default: 0.06 },
  ],
  render: (v) => (
    <main className="relative flex min-h-screen items-center overflow-hidden">
      <ShaderGradientBackground {...v} />
      <h1 className="relative px-8 text-5xl font-black tracking-tight text-white drop-shadow sm:px-16 sm:text-7xl">色が、流れ続ける。</h1>
    </main>
  ),
});
