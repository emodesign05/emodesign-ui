import { CurtainReveal } from '../components/CurtainReveal';
import { definePlayground } from '../playground/types';

type V = { panels: number; duration: number; stagger: number };

export default definePlayground<V>({
  remountOnChange: true,
  note: '右上のメニュー（Home / Works …）を押すと、カーテンが画面を覆って切り替わります。',
  controls: [
    { key: 'panels', label: 'カーテンの枚数', type: 'range', min: 1, max: 12, step: 1, default: 5 },
    { key: 'duration', label: '1枚あたりの時間', type: 'range', min: 0.2, max: 1.6, step: 0.05, default: 0.7, unit: 's' },
    { key: 'stagger', label: '枚数ごとのずれ', hint: '大きいほど波のように順番に動く', type: 'range', min: 0, max: 0.3, step: 0.01, default: 0.06, unit: 's' },
  ],
  render: (v) => <CurtainReveal panels={v.panels} duration={v.duration} stagger={v.stagger} />,
});
