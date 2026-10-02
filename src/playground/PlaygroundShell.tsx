import { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Code2, Eye, ExternalLink, LayoutGrid, Monitor, Play, Smartphone, Tablet } from 'lucide-react';
import CodeView from './CodeView';
import { notionPageUrl } from '../notionLinks';
import ControlPanel from './ControlPanel';
import { MSG } from './messages';
import { usePlaygroundDef } from './registry';
import type { PlaygroundDef, Value, Values } from './types';
import { defaultsOf, parseSearch, toSearch } from './values';

/* =========================================================
 * 「プレビュー（左）＋コントロールパネル（右）」の画面
 * - プレビューは iframe（#/embed/<名前>）：画面幅の切り替え・window スクロール系の演出・fixed 要素がそのまま動く
 * - パラメータの変更は URL にも反映（#/名前?key=value）→ 共有・Notion からのリンクに使える
 * ========================================================= */

type Device = 'mobile' | 'tablet' | 'desktop';
const DEVICES: { id: Device; label: string; width: number | null; Icon: typeof Monitor }[] = [
  { id: 'mobile', label: 'スマホ (390px)', width: 390, Icon: Smartphone },
  { id: 'tablet', label: 'タブレット (768px)', width: 768, Icon: Tablet },
  { id: 'desktop', label: 'PC（全幅）', width: null, Icon: Monitor },
];

type Props = {
  name: string;
  ja: string;
  en: string;
  index: number;
  total: number;
  /** 起動時の URL クエリ（"?a=1"） */
  search: string;
  onPrev: () => void;
  onNext: () => void;
  onHome: () => void;
};

const iconBtn =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800';

/** 定義（controls / render）を読み込んでから本体を表示する */
export default function PlaygroundShell(props: Props) {
  const { def, error } = usePlaygroundDef(props.name);
  if (error) return <p className="p-6 text-sm text-rose-600">読み込みに失敗しました: {error.message}</p>;
  if (!def) return <div className="flex h-dvh items-center justify-center text-xs text-slate-400">読み込み中…</div>;
  return <ShellBody {...props} def={def} />;
}

function ShellBody({ name, ja, en, index, total, search, onPrev, onNext, onHome, def }: Props & { def: PlaygroundDef }) {
  const [device, setDevice] = useState<Device>('desktop');
  // プレビュー／コード の切り替え
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const controls = def.controls;
  // 初期値＝既定値＋URL のクエリ
  const [values, setValues] = useState<Values>(() => parseSearch(def.controls, search));

  const valuesRef = useRef<Values | null>(null);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const post = useCallback((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(msg, window.location.origin);
  }, []);

  // iframe 側の準備完了 → 現在値を送る
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== iframeRef.current?.contentWindow) return;
      if ((e.data as { type?: string } | null)?.type === MSG.ready && valuesRef.current) {
        post({ type: MSG.values, values: valuesRef.current });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [post]);

  // 値が変わったら iframe へ送信＋URL を更新（履歴は増やさない）
  useEffect(() => {
    post({ type: MSG.values, values });
    const url = `${window.location.pathname}${window.location.search}#/${encodeURIComponent(name)}${toSearch(controls, values)}`;
    window.history.replaceState(null, '', url);
  }, [values, controls, name, post]);

  const onChange = (key: string, value: Value) => setValues((v) => ({ ...v, [key]: value }));
  const onReset = () => setValues(defaultsOf(controls));

  const current = DEVICES.find((d) => d.id === device)!;
  const embedSrc = `${window.location.pathname}${window.location.search}#/embed/${encodeURIComponent(name)}`;
  const standaloneHref = `#/embed/${encodeURIComponent(name)}${toSearch(controls, values)}`;

  return (
    <div className="flex h-dvh min-h-[560px] flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* ---- ヘッダー ---- */}
      <header className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-b border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
        <button type="button" onClick={onHome} className={iconBtn} aria-label="一覧に戻る（G）" title="一覧に戻る（G）">
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button type="button" onClick={onPrev} className={iconBtn} aria-label="前のコンポーネント（[）" title="前へ（[）">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={onNext} className={iconBtn} aria-label="次のコンポーネント（]）" title="次へ（]）">
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="order-last min-w-0 basis-full px-1 sm:order-none sm:flex-1 sm:basis-auto">
          <h1 className="truncate text-sm font-bold" title={`${en} / ${name}.tsx`}>
            {ja}
            <span className="ml-2 text-xs font-normal tabular-nums text-slate-400">
              {index + 1}/{total}
            </span>
          </h1>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{en}</p>
        </div>

        <div role="radiogroup" aria-label="プレビュー幅" className="hidden items-center rounded-lg bg-slate-100 p-0.5 sm:flex dark:bg-slate-800">
          {DEVICES.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={device === id}
              aria-label={label}
              title={label}
              onClick={() => setDevice(id)}
              className={`flex h-8 w-9 items-center justify-center rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                device === id ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <div role="tablist" aria-label="表示切り替え" className="flex items-center rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
          {([
            { id: 'preview', label: 'デモ', Icon: Eye },
            { id: 'code', label: 'コード', Icon: Code2 },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                tab === id ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
        {notionPageUrl(name) && (
          <a
            href={notionPageUrl(name)}
            target="_blank"
            rel="noreferrer"
            className={`${iconBtn} w-auto gap-1.5 px-3 text-xs font-semibold`}
            title="このコンポーネントのNotionページ（プロンプト・解説）を開く"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Notion
            <span className="sr-only">（新しいタブで開く）</span>
          </a>
        )}
        <button type="button" onClick={() => post({ type: MSG.replay })} className={`${iconBtn} w-auto gap-1.5 px-3 text-xs font-semibold`} title="アニメーションを最初から再生">
          <Play className="h-3.5 w-3.5" />
          リプレイ
        </button>
        <a href={standaloneHref} target="_blank" rel="noreferrer" className={iconBtn} aria-label="プレビューだけを新しいタブで開く" title="プレビューだけを新しいタブで開く">
          <ExternalLink className="h-4 w-4" />
        </a>
      </header>

      {/* ---- 本体：プレビュー＋パネル ---- */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <main className="relative flex min-h-[55dvh] flex-1 items-stretch justify-center overflow-auto bg-[radial-gradient(circle,#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] p-0 dark:bg-[radial-gradient(circle,#334155_1px,transparent_1px)] lg:min-h-0 lg:p-4">
          {tab === 'code' && <CodeView name={name} />}
          <iframe
            hidden={tab === 'code'}
            ref={iframeRef}
            key={name}
            src={embedSrc}
            title={`${ja} のプレビュー`}
            onLoad={() => valuesRef.current && post({ type: MSG.values, values: valuesRef.current })}
            style={current.width ? { width: current.width, maxWidth: '100%' } : undefined}
            className={`h-full min-h-[55dvh] border-0 bg-white shadow-xl dark:bg-slate-950 lg:min-h-0 ${current.width ? 'rounded-2xl ring-1 ring-slate-300 dark:ring-slate-700' : 'w-full lg:rounded-xl lg:ring-1 lg:ring-slate-200 lg:dark:ring-slate-800'}`}
          />
        </main>

        <aside
          aria-label="パラメータ"
          className="h-[45dvh] shrink-0 border-t border-slate-200 bg-white lg:h-auto lg:w-[22rem] lg:border-l lg:border-t-0 dark:border-slate-800 dark:bg-slate-900"
        >
          <ControlPanel controls={controls} values={values} onChange={onChange} onReset={onReset} note={def.note} />
        </aside>
      </div>
    </div>
  );
}
