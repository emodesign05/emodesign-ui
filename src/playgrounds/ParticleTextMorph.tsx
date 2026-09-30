import { ParticleText } from '../components/ParticleTextMorph';
import { definePlayground } from '../playground/types';

type V = { words: string; gap: number; particleSize: number; repelRadius: number; interval: number; color: string };

export default definePlayground<V>({
  note: '文字にカーソルを近づけると粒子が散ります。「,」で区切ると一定時間ごとに文字が組み替わります。',
  controls: [
    { key: 'words', label: '表示する文字', hint: 'カンマ区切りで複数（例: EMO,DESIGN）', type: 'text', default: 'EMO,DESIGN,MOTION' },
    { key: 'gap', label: '粒子の間隔', hint: '小さいほど精細（重くなる）', type: 'range', min: 3, max: 12, step: 1, default: 5, unit: 'px' },
    { key: 'particleSize', label: '粒子の大きさ', type: 'range', min: 1, max: 6, step: 0.5, default: 2, unit: 'px' },
    { key: 'repelRadius', label: 'マウスの反発範囲', type: 'range', min: 0, max: 240, step: 10, default: 90, unit: 'px' },
    { key: 'interval', label: '文字の切り替え間隔', type: 'range', min: 1.5, max: 10, step: 0.5, default: 3.5, unit: '秒' },
    { key: 'color', label: '粒子の色', type: 'color', default: '#a5b4fc' },
  ],
  render: (v) => (
    <main className="h-screen bg-neutral-950">
      <ParticleText
        words={v.words.split(',').map((s) => s.trim()).filter(Boolean)}
        gap={v.gap}
        particleSize={v.particleSize}
        repelRadius={v.repelRadius}
        interval={v.interval}
        color={v.color}
      />
    </main>
  ),
});
