import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Preloader } from '../components/LoadingCounter';
import { definePlayground } from '../playground/types';

type V = { duration: number };

function Stage({ duration }: V) {
  const [loading, setLoading] = useState(true);
  const [run, setRun] = useState(0);
  return (
    <main className="min-h-screen bg-stone-100 text-neutral-900 dark:bg-neutral-900 dark:text-white">
      {loading && <Preloader key={run} duration={duration} onDone={() => setLoading(false)} />}
      <section className="flex min-h-screen flex-col justify-center px-8 sm:px-16">
        <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-8xl">Welcome.</h1>
        <button
          type="button"
          onClick={() => {
            setRun((n) => n + 1);
            setLoading(true);
          }}
          className="mt-10 inline-flex w-fit items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          <RotateCcw className="h-4 w-4" /> もう一度見る
        </button>
      </section>
    </main>
  );
}

export default definePlayground<V>({
  remountOnChange: true,
  note: '値を変えるたびに最初から再生します。',
  controls: [{ key: 'duration', label: 'カウントにかける時間', type: 'range', min: 1, max: 6, step: 0.2, default: 2.6, unit: 's' }],
  render: (v) => <Stage duration={v.duration} />,
});
