import { Fragment, useEffect, useMemo, useState } from 'react';
import { MSG } from './messages';
import { usePlaygroundDef } from './registry';
import type { Values } from './types';
import { parseSearch } from './values';

/* =========================================================
 * iframe の中で動くプレビュー本体（#/embed/<名前>）
 * - 親（PlaygroundShell）から postMessage で値を受け取って再描画
 * - 単体で開いた場合（親なし）は URL のクエリから初期値を作る
 * ========================================================= */

export default function EmbedRoot({ name, search }: { name: string; search: string }) {
  const { def, error } = usePlaygroundDef(name);
  const [values, setValues] = useState<Values | null>(null);
  const [replay, setReplay] = useState(0);
  const inFrame = window.parent !== window;

  // 親からのメッセージ
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return;
      const d = e.data as { type?: string; values?: Values } | null;
      if (d?.type === MSG.values && d.values) setValues(d.values);
      if (d?.type === MSG.replay) setReplay((n) => n + 1);
    };
    window.addEventListener('message', onMessage);
    if (inFrame) window.parent.postMessage({ type: MSG.ready }, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, [inFrame]);

  // 親がいない（単体表示）場合は URL のクエリから初期値
  const standalone = useMemo(() => (def && !inFrame ? parseSearch(def.controls, search) : null), [def, inFrame, search]);

  useEffect(() => {
    document.title = `${name} | Preview`;
  }, [name]);

  if (error) return <p className="p-6 text-sm text-rose-600">読み込みに失敗しました: {error.message}</p>;
  if (!def) return <div className="flex min-h-screen items-center justify-center text-xs text-slate-400">読み込み中…</div>;

  const v = values ?? standalone;
  // 親から最初の値が届くまで待つ（既定値が一瞬映るのを防ぐ）
  if (!v) return <div className="flex min-h-screen items-center justify-center text-xs text-slate-400">読み込み中…</div>;
  // remountOnChange の場合は値が変わるたびに key を変えて作り直す
  const key = `${replay}:${def.remountOnChange ? JSON.stringify(v) : ''}`;

  return <Fragment key={key}>{def.render(v)}</Fragment>;
}
