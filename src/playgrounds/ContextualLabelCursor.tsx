import { LabelCursorArea } from '../components/ContextualLabelCursor';
import { definePlayground } from '../playground/types';

type V = { label: string; color: string; size: number; stiffness: number };

export default definePlayground<V>({
  note: 'カードの上にマウスを重ねてください（マウス専用）。',
  controls: [
    { key: 'label', label: 'ラベル文言', type: 'text', default: 'View' },
    { key: 'color', label: 'ラベルの色', type: 'color', default: '#4f46e5' },
    { key: 'size', label: 'ラベルの大きさ', type: 'range', min: 40, max: 160, step: 4, default: 80, unit: 'px' },
    { key: 'stiffness', label: '追従の速さ', hint: '小さいほどゆったり遅れて追従', type: 'range', min: 80, max: 900, step: 20, default: 500 },
  ],
  render: (v) => (
    <LabelCursorArea size={v.size} stiffness={v.stiffness}>
      <main className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-slate-950">
        <a
          href="#"
          data-cursor-label={v.label}
          data-cursor-color={v.color}
          className="block aspect-[4/3] w-full max-w-xl rounded-3xl bg-gradient-to-br from-indigo-200 via-violet-200 to-pink-200 p-8 text-slate-900 dark:from-indigo-900 dark:via-violet-900 dark:to-fuchsia-900 dark:text-white"
        >
          <p className="text-xs font-semibold tracking-widest opacity-70">PROJECT</p>
          <p className="mt-2 text-3xl font-bold">Kinetic Type</p>
        </a>
      </main>
    </LabelCursorArea>
  ),
});
