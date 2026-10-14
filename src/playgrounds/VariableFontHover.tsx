import { VariableFontHover } from '../components/VariableFontHover';
import { definePlayground } from '../playground/types';

type V = {
  text: string;
  radius: number;
  minWeight: number;
  maxWeight: number;
  maxScale: number;
  smooth: number;
};

export default definePlayground<V>({
  note: '文字の上でカーソルを動かすと、近い文字ほど太く大きくなります（スマホはタップ）。',
  controls: [
    { key: 'text', label: 'テキスト', hint: '改行で複数行', type: 'text', multiline: true, default: 'DESIGN\nIN MOTION' },
    { key: 'radius', label: '影響範囲', type: 'range', min: 60, max: 500, step: 10, default: 220, unit: 'px' },
    { key: 'minWeight', label: '最小ウェイト', type: 'range', min: 100, max: 900, step: 50, default: 150 },
    { key: 'maxWeight', label: '最大ウェイト', type: 'range', min: 100, max: 900, step: 50, default: 900 },
    { key: 'maxScale', label: '最大拡大率', type: 'range', min: 1, max: 1.6, step: 0.02, default: 1.18, unit: '倍' },
    { key: 'smooth', label: '追従のなめらかさ', type: 'range', min: 0.05, max: 1.2, step: 0.05, default: 0.45, unit: 's' },
  ],
  render: (v) => (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f1ea] px-4 text-center text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <VariableFontHover {...v} />
    </div>
  ),
});
