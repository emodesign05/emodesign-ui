import { DotNav } from '../components/SideDotScrollSpy';
import { definePlayground } from '../playground/types';

type V = { side: 'left' | 'right'; gap: number; showLabels: boolean };

// DotNav が参照するセクション ID（コンポーネント側の SECTIONS と揃える）
const SECTIONS = [
  { id: 'spy-intro', label: 'Intro', bg: 'bg-slate-50 dark:bg-slate-950' },
  { id: 'spy-concept', label: 'Concept', bg: 'bg-indigo-50 dark:bg-indigo-950/60' },
  { id: 'spy-works', label: 'Works', bg: 'bg-rose-50 dark:bg-rose-950/50' },
  { id: 'spy-team', label: 'Team', bg: 'bg-amber-50 dark:bg-amber-950/40' },
  { id: 'spy-contact', label: 'Contact', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
];

export default definePlayground<V>({
  note: 'プレビュー内をスクロールすると、現在地のドットが移動します。',
  controls: [
    {
      key: 'side',
      label: '表示位置',
      type: 'select',
      default: 'right',
      options: [
        { value: 'right', label: '右端' },
        { value: 'left', label: '左端' },
      ],
    },
    { key: 'gap', label: 'ドットの間隔', type: 'range', min: 4, max: 48, step: 2, default: 16, unit: 'px' },
    { key: 'showLabels', label: 'ラベルを常に表示', type: 'toggle', default: false },
  ],
  render: (v) => (
    <main className="text-slate-900 dark:text-white">
      <DotNav side={v.side} gap={v.gap} showLabels={v.showLabels} />
      {SECTIONS.map((s, i) => (
        <section key={s.id} id={s.id} className={`flex min-h-screen flex-col justify-center px-8 sm:px-20 ${s.bg}`}>
          <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">0{i + 1} / 0{SECTIONS.length}</p>
          <h2 className="mt-3 text-5xl font-black sm:text-7xl">{s.label}</h2>
        </section>
      ))}
    </main>
  ),
});
