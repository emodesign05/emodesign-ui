import { HoverImagePeek } from '../components/HoverImagePeek';
import { definePlayground } from '../playground/types';

type V = { peekW: number; peekH: number; tilt: number; stiffness: number };

export default definePlayground<V>({
  note: 'リストの上でマウスを動かすと、画像が追いかけてきます（マウス専用）。',
  controls: [
    { key: 'peekW', label: '画像の幅', type: 'range', min: 120, max: 520, step: 10, default: 280, unit: 'px' },
    { key: 'peekH', label: '画像の高さ', type: 'range', min: 90, max: 420, step: 10, default: 200, unit: 'px' },
    { key: 'tilt', label: '移動時の傾き', type: 'range', min: 0, max: 30, step: 1, default: 12, unit: '°' },
    { key: 'stiffness', label: '追従の速さ', hint: '大きいほどキビキビ追従', type: 'range', min: 40, max: 500, step: 10, default: 180 },
  ],
  render: (v) => <HoverImagePeek peekW={v.peekW} peekH={v.peekH} tilt={v.tilt} stiffness={v.stiffness} />,
});
