import { BlobMorph } from '../components/BlobMorph';
import { definePlayground } from '../playground/types';

type V = {
  speed: number;
  complexity: number;
  wobble: number;
  colorFrom: string;
  colorTo: string;
  layers: number;
};

export default definePlayground<V>({
  note: 'ブロブは止まらずに変形し続けます。複雑さ（点の数）を上げると輪郭が細かくうねります。',
  controls: [
    { key: 'speed', label: '速さ', type: 'range', min: 0.1, max: 4, step: 0.1, default: 1, unit: '倍' },
    { key: 'complexity', label: '複雑さ', hint: '輪郭の点の数', type: 'range', min: 3, max: 12, step: 1, default: 7, unit: '点' },
    { key: 'wobble', label: 'ゆらぎの大きさ', type: 'range', min: 0.02, max: 0.4, step: 0.01, default: 0.18 },
    { key: 'colorFrom', label: '色 1', type: 'color', default: '#6366f1' },
    { key: 'colorTo', label: '色 2', type: 'color', default: '#ec4899' },
    { key: 'layers', label: '重ねる数', type: 'range', min: 1, max: 4, step: 1, default: 3, unit: '枚' },
  ],
  render: (v) => (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf8ff] p-6 dark:bg-[#0b0814]">
      <div className="w-full max-w-[min(80vh,560px)]">
        <BlobMorph {...v} className="h-auto w-full" />
      </div>
    </div>
  ),
});
