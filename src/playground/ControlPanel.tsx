import { useId } from 'react';
import { RotateCcw, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { Control, Value, Values } from './types';
import { toPropsString } from './values';

/* =========================================================
 * 右サイドのコントロールパネル
 * - 各コントロールは props 名（key）を併記 → Notion のパラメータ表と見比べやすい
 * ========================================================= */

const inputBase =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

function Field({ control, value, onChange }: { control: Control; value: Value; onChange: (v: Value) => void }) {
  const id = useId();
  const display =
    control.type === 'range'
      ? `${Number.isInteger(control.step) ? value : Number(value).toFixed(String(control.step).split('.')[1]?.length ?? 2)}${control.unit ?? ''}`
      : control.type === 'toggle'
        ? value
          ? 'ON'
          : 'OFF'
        : null;

  return (
    <div className="border-b border-slate-100 py-4 last:border-b-0 dark:border-slate-800">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {control.label}
        </label>
        {display !== null && <span className="font-mono text-xs tabular-nums text-indigo-600 dark:text-indigo-400">{String(display)}</span>}
      </div>
      <p className="mt-0.5 font-mono text-[10px] text-slate-400 dark:text-slate-500">{control.key}</p>
      {control.hint && <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{control.hint}</p>}

      <div className="mt-2.5">
        {control.type === 'range' && (
          <input
            id={id}
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={Number(value)}
            onChange={(e) => onChange(Number(e.target.value))}
            className="h-2 w-full cursor-pointer accent-indigo-600"
          />
        )}

        {control.type === 'select' &&
          (control.options.length <= 4 ? (
            <div id={id} role="radiogroup" aria-label={control.label} className="flex flex-wrap gap-1.5">
              {control.options.map((o) => {
                const on = value === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => onChange(o.value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      on
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <select id={id} value={String(value)} onChange={(e) => onChange(e.target.value)} className={inputBase}>
              {control.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}

        {control.type === 'toggle' && (
          <button
            id={id}
            type="button"
            role="switch"
            aria-checked={Boolean(value)}
            onClick={() => onChange(!value)}
            className={`relative h-6 w-11 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${
              value ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : ''}`}
            />
          </button>
        )}

        {control.type === 'text' &&
          (control.multiline ? (
            <textarea id={id} rows={3} value={String(value)} onChange={(e) => onChange(e.target.value)} className={inputBase} />
          ) : (
            <input id={id} type="text" value={String(value)} onChange={(e) => onChange(e.target.value)} className={inputBase} />
          ))}

        {control.type === 'color' && (
          <div className="flex items-center gap-2">
            <input
              id={id}
              type="color"
              value={String(value)}
              onChange={(e) => onChange(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
            />
            <input
              type="text"
              aria-label={`${control.label}（16進数）`}
              value={String(value)}
              onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && onChange(e.target.value)}
              className={`${inputBase} font-mono`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

type Props = {
  controls: Control[];
  values: Values;
  onChange: (key: string, value: Value) => void;
  onReset: () => void;
  note?: string;
};

export default function ControlPanel({ controls, values, onChange, onReset, note }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toPropsString(controls, values));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* クリップボードが使えない環境では何もしない */
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h2 className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400">PARAMETERS</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'コピーしました' : 'propsをコピー'}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            リセット
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        {note && (
          <p className="mt-4 rounded-lg bg-indigo-50 px-3 py-2 text-xs leading-relaxed text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-200">
            {note}
          </p>
        )}
        {controls.map((c) => (
          <Field key={c.key} control={c} value={values[c.key]} onChange={(v) => onChange(c.key, v)} />
        ))}
      </div>
    </div>
  );
}
