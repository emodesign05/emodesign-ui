import { Interactive3DCanvasHero } from '../components/Interactive3DCanvasHero';
import { definePlayground } from '../playground/types';

type V = { followStrength: number; lerp: number; autoRotate: boolean; color: string; accent: string; height: number };

export default definePlayground<V>({
  note: 'マウスを動かすと、シーン全体がなめらかに回り込みます。',
  controls: [
    { key: 'followStrength', label: 'マウス追従の強さ', hint: '回転角の最大値（ラジアン）', type: 'range', min: 0, max: 1.2, step: 0.05, default: 0.5 },
    { key: 'lerp', label: '追従のなめらかさ', hint: '小さいほどゆっくり追従', type: 'range', min: 0.01, max: 0.3, step: 0.01, default: 0.06 },
    { key: 'autoRotate', label: '自動回転・うねり', type: 'toggle', default: true },
    { key: 'color', label: 'ワイヤーフレームの色', type: 'color', default: '#06b6d4' },
    { key: 'accent', label: 'コアの色', type: 'color', default: '#7c3aed' },
    { key: 'height', label: '高さ', type: 'range', min: 360, max: 800, step: 20, default: 620, unit: 'px' },
  ],
  render: (v) => <Interactive3DCanvasHero followStrength={v.followStrength} lerp={v.lerp} autoRotate={v.autoRotate} color={v.color} accent={v.accent} height={v.height} />,
});
