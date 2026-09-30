import { MeshGradient } from '../components/OrganicMeshGradient';
import { definePlayground } from '../playground/types';

type V = { blur: number; saturation: number; speed: number; depth: number; follower: boolean };

export default definePlayground<V>({
  remountOnChange: true,
  note: 'マウスを動かすと色の塊が流れ、カーソル位置に紫の光が溶け込みます。',
  controls: [
    { key: 'blur', label: 'ぼかし', type: 'range', min: 10, max: 140, step: 2, default: 64, unit: 'px' },
    { key: 'saturation', label: '彩度', type: 'range', min: 0.5, max: 2.5, step: 0.1, default: 1.5, unit: 'x' },
    { key: 'speed', label: '漂う速さ', type: 'range', min: 0.25, max: 4, step: 0.25, default: 1, unit: 'x' },
    { key: 'depth', label: 'マウスによるズレ（奥行き）', type: 'range', min: 0, max: 3, step: 0.1, default: 1, unit: 'x' },
    { key: 'follower', label: 'カーソル追従の光', type: 'toggle', default: true },
  ],
  render: (v) => (
    <main className="relative min-h-screen overflow-hidden">
      <MeshGradient blur={v.blur} saturation={v.saturation} speed={v.speed} depth={v.depth} follower={v.follower} />
    </main>
  ),
});
