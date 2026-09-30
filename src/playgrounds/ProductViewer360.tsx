import { ProductViewer360 } from '../components/ProductViewer360';
import { definePlayground } from '../playground/types';

type V = { autoRotateSpeed: number; minDistance: number; maxDistance: number; fov: number; lightIntensity: number; damping: boolean };

export default definePlayground<V>({
  remountOnChange: true,
  note: 'ドラッグで回転、ホイールで拡大縮小。右側のスウォッチで色を切り替えられます。',
  controls: [
    { key: 'autoRotateSpeed', label: '自動回転の速さ', type: 'range', min: 0, max: 8, step: 0.2, default: 1.2 },
    { key: 'fov', label: '画角（fov）', hint: '大きいほど広角で、遠近感が強い', type: 'range', min: 15, max: 75, step: 1, default: 35, unit: '°' },
    { key: 'minDistance', label: '最も寄れる距離', type: 'range', min: 2, max: 8, step: 0.5, default: 5 },
    { key: 'maxDistance', label: '最も引ける距離', type: 'range', min: 8, max: 20, step: 0.5, default: 12 },
    { key: 'lightIntensity', label: 'メインライトの強さ', type: 'range', min: 0, max: 6, step: 0.1, default: 2.4 },
    { key: 'damping', label: '慣性（ダンピング）', type: 'toggle', default: true },
  ],
  render: (v) => (
    <ProductViewer360
      autoRotateSpeed={v.autoRotateSpeed}
      minDistance={v.minDistance}
      maxDistance={v.maxDistance}
      fov={v.fov}
      lightIntensity={v.lightIntensity}
      damping={v.damping}
    />
  ),
});
