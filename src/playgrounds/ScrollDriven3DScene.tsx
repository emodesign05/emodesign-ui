import { ScrollDriven3DScene } from '../components/ScrollDriven3DScene';
import { definePlayground } from '../playground/types';

type V = { smooth: number; fov: number; sectionHeight: number; knotColor: string };

export default definePlayground<V>({
  remountOnChange: true,
  note: 'プレビュー内をスクロールすると、カメラが移動しモデルが変形します。',
  controls: [
    { key: 'smooth', label: 'カメラ追従のなめらかさ', hint: '小さいほどゆっくり追従', type: 'range', min: 0.02, max: 0.4, step: 0.01, default: 0.08 },
    { key: 'fov', label: '画角（fov）', type: 'range', min: 20, max: 80, step: 1, default: 40, unit: '°' },
    { key: 'sectionHeight', label: 'スクロールの長さ', type: 'range', min: 250, max: 900, step: 50, default: 500, unit: 'vh' },
    { key: 'knotColor', label: 'モデルの色', type: 'color', default: '#6366f1' },
  ],
  render: (v) => <ScrollDriven3DScene smooth={v.smooth} fov={v.fov} sectionHeight={v.sectionHeight} knotColor={v.knotColor} />,
});
