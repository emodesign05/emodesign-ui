import { CustomCursorArea } from '../components/DualLayerCustomCursor';
import { definePlayground } from '../playground/types';

type V = { trail: boolean; ringSize: number; hoverRingSize: number; ringStiffness: number };

export default definePlayground<V>({
  note: 'プレビュー内でマウスを動かし、ボタンやリンクに重ねてみてください（マウス専用）。',
  controls: [
    { key: 'ringSize', label: 'リングの大きさ', type: 'range', min: 16, max: 80, step: 2, default: 36, unit: 'px' },
    { key: 'hoverRingSize', label: 'ホバー時のリングの大きさ', type: 'range', min: 32, max: 160, step: 2, default: 72, unit: 'px' },
    { key: 'ringStiffness', label: 'リングの追従の速さ', hint: '小さいほど遅れてついてくる', type: 'range', min: 60, max: 900, step: 10, default: 350 },
    { key: 'trail', label: '軌跡（トレイル）', type: 'toggle', default: true },
  ],
  render: (v) => (
    <CustomCursorArea trail={v.trail} ringSize={v.ringSize} hoverRingSize={v.hoverRingSize} ringStiffness={v.ringStiffness}>
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-white px-6 text-slate-900 dark:bg-slate-950 dark:text-white">
        <h1 className="text-center text-4xl font-bold leading-tight sm:text-6xl">
          カーソルも、
          <br />
          デザインの一部。
        </h1>
        <div className="flex flex-wrap justify-center gap-4">
          <button type="button" className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white">
            プロジェクトを相談する
          </button>
          <a href="#" className="rounded-full border border-slate-300 px-6 py-3 text-sm dark:border-slate-700">
            リンクにも反応
          </a>
        </div>
      </main>
    </CustomCursorArea>
  ),
});
