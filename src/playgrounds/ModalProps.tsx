import { ModalDemo } from '../components/ModalProps';
import { definePlayground } from '../playground/types';

type V = { duration: number; startScale: number; offset: number; overlayOpacity: number; blur: number; radius: number; closeDelay: number };

export default definePlayground<V>({
  note: '「詳細を見る」でモーダルが開きます。Escキーや背景クリックで閉じます。',
  controls: [
    { key: 'duration', label: '開閉の時間', type: 'range', min: 0.05, max: 1.2, step: 0.05, default: 0.2, unit: 's' },
    { key: 'startScale', label: '開始時の縮小', type: 'range', min: 0.5, max: 1, step: 0.01, default: 0.95 },
    { key: 'offset', label: '開始位置のズレ', type: 'range', min: 0, max: 80, step: 1, default: 10, unit: 'px' },
    { key: 'overlayOpacity', label: '背景の暗さ', type: 'range', min: 0, max: 0.95, step: 0.05, default: 0.6 },
    { key: 'blur', label: '背景のぼかし', type: 'range', min: 0, max: 24, step: 1, default: 4, unit: 'px' },
    { key: 'radius', label: 'モーダルの角丸', type: 'range', min: 0, max: 48, step: 2, default: 24, unit: 'px' },
    { key: 'closeDelay', label: 'カート追加後に閉じるまで', type: 'range', min: 200, max: 3000, step: 100, default: 1200, unit: 'ms' },
  ],
  render: (v) => <ModalDemo {...v} />,
});
