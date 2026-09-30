import { LenisSmoothScroll } from '../components/LenisSmoothScroll';
import { definePlayground } from '../playground/types';

type V = { lerp: number; wheelMultiplier: number; anchorDuration: number };

export default definePlayground<V>({
  remountOnChange: true,
  note: 'プレビュー内でマウスホイールを回して手触りを比べてください。右上のスイッチで ON / OFF できます。',
  controls: [
    { key: 'lerp', label: '追従の強さ（lerp）', hint: '小さいほど“ぬるっと”長く滑る', type: 'range', min: 0.02, max: 0.3, step: 0.01, default: 0.08 },
    { key: 'wheelMultiplier', label: 'ホイール1回の移動量', type: 'range', min: 0.3, max: 3, step: 0.1, default: 1, unit: 'x' },
    { key: 'anchorDuration', label: 'リンク移動の時間', type: 'range', min: 0.3, max: 4, step: 0.1, default: 1.4, unit: 's' },
  ],
  render: (v) => <LenisSmoothScroll lerp={v.lerp} wheelMultiplier={v.wheelMultiplier} anchorDuration={v.anchorDuration} />,
});
