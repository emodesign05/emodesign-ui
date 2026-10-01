import { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { githubFileUrl } from '../siteConfig';

/* =========================================================
 * 「コード」タブ：src/components/<名前>.tsx のソースをそのまま表示
 * - ファイルの中身はビルド時に文字列として読み込む（?raw）。開いた時だけ読み込むので一覧の表示は重くならない
 * - コピーボタン／GitHub で見るリンク
 * ========================================================= */

const sources = import.meta.glob<string>('../components/*.tsx', { query: '?raw', import: 'default' });

export default function CodeView({ name }: { name: string }) {
  const [code, setCode] = useState<{ name: string; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    sources[`../components/${name}.tsx`]?.().then((text) => alive && setCode({ name, text }));
    return () => {
      alive = false;
    };
  }, [name]);

  const text = code?.name === name ? code.text : null;
  const github = githubFileUrl(name);

  const copy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="flex h-full min-h-[55dvh] w-full flex-col overflow-hidden bg-slate-950 text-slate-100 lg:rounded-xl lg:ring-1 lg:ring-slate-800">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <p className="min-w-0 flex-1 truncate font-mono text-xs text-slate-400">src/components/{name}.tsx</p>
        {github && (
          <a href={github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
            <ExternalLink className="h-3.5 w-3.5" /> GitHubで見る
          </a>
        )}
        <button
          type="button"
          onClick={copy}
          disabled={!text}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:opacity-50"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'コピーしました' : 'コードをコピー'}
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {text ? (
          <pre className="p-4 text-[12.5px] leading-relaxed">
            <code className="grid grid-cols-[auto_1fr] gap-x-4 font-mono">
              {text.split('\n').map((line, i) => (
                <span key={i} className="contents">
                  <span className="select-none text-right tabular-nums text-slate-600">{i + 1}</span>
                  <span className="whitespace-pre">{line || ' '}</span>
                </span>
              ))}
            </code>
          </pre>
        ) : (
          <p className="p-6 text-xs text-slate-500">読み込み中…</p>
        )}
      </div>
    </div>
  );
}
