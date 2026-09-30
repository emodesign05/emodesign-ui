import { ImageTrailArea } from '../components/ImageTrailCursor';
import { definePlayground } from '../playground/types';

type V = { threshold: number; lifetime: number; size: number; rotate: number };

export default definePlayground<V>({
  note: 'プレビューの上でマウスを動かしてください（タッチ操作では表示されません）。',
  controls: [
    { key: 'threshold', label: '出す間隔', hint: '何px動くごとに1枚出すか。小さいほど密に並ぶ', type: 'range', min: 20, max: 240, step: 10, default: 80, unit: 'px' },
    { key: 'lifetime', label: '表示時間', type: 'range', min: 0.2, max: 3, step: 0.1, default: 0.9, unit: '秒' },
    { key: 'size', label: '画像の幅', type: 'range', min: 100, max: 400, step: 10, default: 220, unit: 'px' },
    { key: 'rotate', label: 'ランダムな傾き', type: 'range', min: 0, max: 30, step: 1, default: 10, unit: '°' },
  ],
  render: (v) => <ImageTrailArea threshold={v.threshold} lifetime={v.lifetime} size={v.size} rotate={v.rotate} />,
});
