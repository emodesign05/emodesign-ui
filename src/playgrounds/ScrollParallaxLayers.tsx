import { ScrollParallaxLayers } from '../components/ScrollParallaxLayers';
import { definePlayground } from '../playground/types';

type V = { sunSpeed: number; titleSpeed: number; farSpeed: number; midSpeed: number; nearSpeed: number; scrub: number; sectionHeight: number };

export default definePlayground<V>({
  note: '各レイヤーの速度（1＝セクションの高さ分だけ動く）を変えて、奥行きの出方を確認します。プレビュー内をスクロールしてください。',
  controls: [
    { key: 'sunSpeed', label: '太陽の速度', type: 'range', min: -0.5, max: 1, step: 0.05, default: 0.6 },
    { key: 'titleSpeed', label: '見出しの速度', type: 'range', min: -0.5, max: 1, step: 0.05, default: 0.45 },
    { key: 'farSpeed', label: '奥の山の速度', type: 'range', min: -0.5, max: 1, step: 0.05, default: 0.35 },
    { key: 'midSpeed', label: '中の山の速度', type: 'range', min: -0.5, max: 1, step: 0.05, default: 0.2 },
    { key: 'nearSpeed', label: '手前の山の速度', type: 'range', min: -0.5, max: 1, step: 0.05, default: 0.05 },
    { key: 'scrub', label: '追従の遅れ', hint: '0 でスクロールに密着、大きいほど慣性が強い', type: 'range', min: 0, max: 2, step: 0.1, default: 0.6, unit: '秒' },
    { key: 'sectionHeight', label: 'セクションの高さ', type: 'range', min: 100, max: 260, step: 10, default: 140, unit: 'vh' },
  ],
  render: (v) => (
    <ScrollParallaxLayers
      sunSpeed={v.sunSpeed}
      titleSpeed={v.titleSpeed}
      farSpeed={v.farSpeed}
      midSpeed={v.midSpeed}
      nearSpeed={v.nearSpeed}
      scrub={v.scrub}
      sectionHeight={v.sectionHeight}
    />
  ),
});
