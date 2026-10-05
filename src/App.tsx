import { Component, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, ErrorInfo, LazyExoticComponent, ReactNode } from 'react';
import { ArrowUpRight, BookOpen, ChevronLeft, ChevronRight, Code2, LayoutGrid, Search, EyeOff, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES, getMeta } from './componentMeta';
import type { Category } from './componentMeta';
import PlaygroundShell from './playground/PlaygroundShell';
import EmbedRoot from './playground/EmbedRoot';
import { PLAYGROUND_NAMES } from './playground/registry';
import { CardCover } from './CardCover';
import { NOTION_DATABASES, notionPageUrl, notionUrl } from './notionLinks';
import { GITHUB_REPO } from './siteConfig';

/* =========================================================
 * コンポーネント一覧プレビュー
 * - src/components/*.tsx を自動で列挙（ファイルを置くだけで一覧に追加）
 * - 各ファイルの default export（デモ用 App）をそのまま全画面表示
 * - URL: #/ = 一覧 / #/ファイル名 = プレビュー（リロードしても維持）
 * - src/playgrounds/ファイル名.tsx があるものは「プレビュー＋右パネル（パラメータ切り替え）」画面、無いものは従来の全画面プレビュー
 * - #/ファイル名?key=value でパラメータ指定済みのリンクを作れる / #/embed/ファイル名 はプレビューのみ（iframe 用）
 * - キー操作: [ ] で前後切り替え / G で一覧 / H でツールバー表示切替 / 一覧で / を押すと検索
 * - 一覧は日本語名＋英語名＋ファイル名を併記し、カテゴリ別にグループ表示（名称は componentMeta.ts で管理）
 * ========================================================= */

type DemoModule = { default?: ComponentType };

const loaders = import.meta.glob<DemoModule>('./components/*.tsx');

const CATEGORY_ORDER = CATEGORIES.map((c) => c.name);

// カテゴリ順 → 英語名順（一覧の番号・[ ] キーの移動順もこの並び）
const ENTRIES = Object.keys(loaders)
  .map((path) => {
    const name = path.replace('./components/', '').replace(/\.tsx$/, '');
    return { path, name, meta: getMeta(name) };
  })
  .sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.meta.category) - CATEGORY_ORDER.indexOf(b.meta.category) ||
      Number(!!a.meta.legacy) - Number(!!b.meta.legacy) ||
      a.meta.en.localeCompare(b.meta.en, 'en', { sensitivity: 'base' }),
  );

const NAMES = ENTRIES.map((e) => e.name);

function MissingDefault({ name }: { name: string }) {
  return (
    <Notice title={`${name}.tsx に default export がありません`}>
      ファイルが空か、
      <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">export default function App()</code>
      がまだ書かれていません。
    </Notice>
  );
}

// lazy コンポーネントをモジュール読み込み時に1回だけ定義（実際の読み込みは表示時）
const DEMOS: Record<string, LazyExoticComponent<ComponentType>> = Object.fromEntries(
  ENTRIES.map(({ path, name }) => [
    name,
    lazy(async () => {
      const mod = await loaders[path]();
      if (mod.default) return { default: mod.default };
      return { default: () => <MissingDefault name={name} /> };
    }),
  ]),
);

/* ---------- ハッシュルーティング ---------- */
type Route = { name: string | null; embed: boolean; search: string };

function readHash(): Route {
  const [path, ...rest] = window.location.hash.replace(/^#\/?/, '').split('?');
  const search = rest.length ? `?${rest.join('?')}` : '';
  let raw = decodeURIComponent(path);
  const embed = raw.startsWith('embed/');
  if (embed) raw = raw.slice('embed/'.length);
  return { name: NAMES.includes(raw) ? raw : null, embed, search };
}

function useHashRoute() {
  const [route, setRoute] = useState<Route>(readHash);
  useEffect(() => {
    // 直前の「ルートとしての」ハッシュ（#/〜）を覚えておく
    let lastRouteHash = window.location.hash.startsWith('#/') ? window.location.hash : '#/';
    const onChange = () => {
      const hash = window.location.hash;
      // #/ で始まらないハッシュ（デモ内の <a href="#"> や #section などのページ内リンク）はルート遷移として扱わない。
      // → 該当 id があればそこへスクロールし、URL は元のルートに戻す（一覧が入れ子で表示されるのを防ぐ）
      if (!hash.startsWith('#/')) {
        const id = decodeURIComponent(hash.slice(1));
        const target = id ? document.getElementById(id) : null;
        history.replaceState(null, '', lastRouteHash);
        target?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      lastRouteHash = hash;
      const next = readHash();
      setRoute((prev) => (prev.name === next.name && prev.embed === next.embed && prev.search === next.search ? prev : next));
      window.scrollTo(0, 0);
    };
    // ページ内リンクのクリック自体も先に止める（href="#" で先頭へ飛ぶのを防ぐ）。
    // デモ側で preventDefault 済み（独自のスクロール処理など）のリンクには触れない
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const href = a?.getAttribute('href');
      if (!href || href.startsWith('#/')) return;
      e.preventDefault();
      const id = decodeURIComponent(href.slice(1));
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onChange);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('hashchange', onChange);
      document.removeEventListener('click', onClick);
    };
  }, []);
  const go = useCallback((name: string | null) => {
    window.location.hash = name ? `/${encodeURIComponent(name)}` : '/';
  }, []);
  return [route, go] as const;
}

/* ---------- エラー境界（1つ壊れても一覧は落ちない） ---------- */
type BoundaryProps = { name: string; children: ReactNode };
type BoundaryState = { error: Error | null };

class DemoErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };
  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[Preview] ${this.props.name} でエラー`, error, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <Notice title={`${this.props.name} の描画中にエラーが発生しました`}>
          <pre className="mt-2 overflow-auto rounded-lg bg-rose-50 p-3 text-left text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {this.state.error.message}
          </pre>
        </Notice>
      );
    }
    return this.props.children;
  }
}

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</p>
        <div className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{children}</div>
      </div>
    </div>
  );
}

/* ---------- 一覧（インデックス）画面 ---------- */
const META_BY_NAME = Object.fromEntries(ENTRIES.map((e) => [e.name, e.meta]));

/** 全角・半角／大文字・小文字の差を吸収して検索 */
const normalize = (v: string) => v.normalize('NFKC').toLowerCase().replace(/[\s・/（）()＋+]/g, '');

function IndexPage({ onSelect }: { onSelect: (name: string) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const searchRef = useRef<HTMLInputElement>(null);

  // 「/」キーで検索欄へ
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key !== '/' || (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const q = normalize(query.trim());
  const matched = useMemo(
    () =>
      ENTRIES.filter(
        (e) => !q || [e.meta.ja, e.meta.en, e.name].some((v) => normalize(v).includes(q)),
      ),
    [q],
  );

  const counts = useMemo(() => {
    const c: Partial<Record<Category, number>> = {};
    matched.forEach((e) => (c[e.meta.category] = (c[e.meta.category] ?? 0) + 1));
    return c;
  }, [matched]);

  const groups = CATEGORIES.map((c) => ({
    ...c,
    items: matched.filter((e) => e.meta.category === c.name && (category === 'all' || category === c.name)),
  })).filter((g) => g.items.length > 0);

  const chip = (active: boolean) =>
    `inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
      active
        ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ---- ヘッダー（検索＋カテゴリ） ---- */}
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-slate-50/85 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/85">
        <div className="mx-auto max-w-6xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest text-indigo-600 dark:text-indigo-400">COMPONENT PREVIEW</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
                コンポーネント一覧
                <span className="ml-2 align-middle text-sm font-medium text-slate-400">{ENTRIES.length}件</span>
              </h1>
              {/* 外部リンク：プロンプトと解説は Notion、ソースは GitHub */}
              <ul aria-label="関連リンク" className="mt-3 flex flex-wrap gap-2">
                {NOTION_DATABASES.map((db) => (
                  <li key={db.id}>
                    <a href={notionUrl(db.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white">
                      <BookOpen className="h-3.5 w-3.5" aria-hidden />
                      Notion：{db.label}
                      <ArrowUpRight className="h-3 w-3 opacity-50" aria-hidden />
                      <span className="sr-only">（新しいタブで開く）</span>
                    </a>
                  </li>
                ))}
                {GITHUB_REPO && (
                  <li>
                    <a href={GITHUB_REPO} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white">
                      <Code2 className="h-3.5 w-3.5" aria-hidden />
                      GitHub
                      <ArrowUpRight className="h-3 w-3 opacity-50" aria-hidden />
                      <span className="sr-only">（新しいタブで開く）</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <label className="relative block w-full sm:w-80">
              <span className="sr-only">日本語名・英語名・ファイル名で検索</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
                placeholder="日本語・英語・ファイル名で検索"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 [&::-webkit-search-cancel-button]:hidden"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="検索をクリア"
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 px-1.5 text-[10px] text-slate-400 dark:border-slate-700">/</kbd>
              )}
            </label>
          </div>

          <nav aria-label="カテゴリ" className="-mx-4 mt-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ul className="flex gap-2 pb-1">
              <li>
                <button type="button" onClick={() => setCategory('all')} aria-pressed={category === 'all'} className={chip(category === 'all')}>
                  すべて <span className="tabular-nums opacity-60">{matched.length}</span>
                </button>
              </li>
              {CATEGORIES.filter((c) => counts[c.name]).map((c) => (
                <li key={c.name}>
                  <button type="button" onClick={() => setCategory(c.name)} aria-pressed={category === c.name} className={chip(category === c.name)}>
                    <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden />
                    {c.name}
                    <span className="tabular-nums opacity-60">{counts[c.name]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* ---- カテゴリ別グループ ---- */}
      <main className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        {groups.map((g) => (
          <section key={g.name} aria-labelledby={`cat-${g.name}`}>
            <div className="flex items-baseline gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
              <span className={`h-2.5 w-2.5 translate-y-[-1px] rounded-full ${g.dot}`} aria-hidden />
              <h2 id={`cat-${g.name}`} className="text-base font-bold text-slate-900 dark:text-slate-100">
                {g.name}
              </h2>
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{g.en}</span>
              <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {g.group}
              </span>
            </div>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map(({ name, meta }) => (
                <li key={name}>
                  <ComponentCard name={name} meta={meta} dot={g.dot} onSelect={onSelect} />
                </li>
              ))}
            </ul>
          </section>
        ))}

        {groups.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">「{query}」に一致するコンポーネントがありません</p>
            <button type="button" onClick={() => { setQuery(''); setCategory('all'); }} className="mt-4 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              条件をリセット
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------- 一覧のカード（カバー＋名前） ---------- */
type CardProps = {
  name: string;
  meta: ReturnType<typeof getMeta>;
  dot: string;
  onSelect: (name: string) => void;
};

function ComponentCard({ name, meta, dot, onSelect }: CardProps) {
  // ホバー・キーボードフォーカス中だけカバー動画を再生
  const [active, setActive] = useState(false);
  return (
    <button
      type="button"
      onClick={() => onSelect(name)}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(true)}
      onPointerLeave={() => setActive(false)}
      onFocus={(e) => e.currentTarget.matches(':focus-visible') && setActive(true)}
      onBlur={() => setActive(false)}
      className="group flex h-full w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 pb-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/60"
    >
      <CardCover name={name} active={active} label={meta.en} dot={dot} />
      <span className="flex w-full items-start gap-3 px-1.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold tabular-nums text-slate-500 transition group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-indigo-500/10 dark:group-hover:text-indigo-300">
          {String(NAMES.indexOf(name) + 1).padStart(2, '0')}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-slate-900 dark:text-slate-50">{meta.ja}</span>
            {PLAYGROUND_NAMES.has(name) && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                <SlidersHorizontal className="h-2.5 w-2.5" aria-hidden />
                調整可
              </span>
            )}
            {meta.legacy && (
              <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                旧版
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">{meta.en}</span>
          <span className="mt-2 block truncate font-mono text-[10px] text-slate-400 dark:text-slate-500">{name}.tsx</span>
        </span>
        <ChevronRight
          className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:text-slate-600"
          aria-hidden
        />
      </span>
    </button>
  );
}

/* ---------- プレビュー用フローティングツールバー ---------- */
type ToolbarProps = {
  name: string;
  onPrev: () => void;
  onNext: () => void;
  onHome: () => void;
  onHide: () => void;
};

function Toolbar({ name, onPrev, onNext, onHome, onHide }: ToolbarProps) {
  const index = NAMES.indexOf(name);
  const btn =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400';
  return (
    <div
      role="toolbar"
      aria-label="プレビュー操作"
      className="fixed bottom-4 left-4 z-[2147483647] flex items-center gap-1 rounded-xl border border-white/10 bg-slate-900/90 p-1 text-white shadow-2xl backdrop-blur"
    >
      <button type="button" onClick={onHome} className={btn} aria-label="一覧に戻る（G）" title="一覧に戻る（G）">
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button type="button" onClick={onPrev} className={btn} aria-label="前のコンポーネント（[）" title="前へ（[）">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-0 max-w-[48vw] truncate px-1.5 text-xs font-semibold max-sm:max-w-none" aria-live="polite">
        <span className="max-sm:sr-only" title={`${META_BY_NAME[name]?.en} / ${name}.tsx`}>{META_BY_NAME[name]?.ja ?? name}</span>
        <span className="ml-1.5 font-normal text-slate-400 max-sm:ml-0">
          {index + 1}/{NAMES.length}
        </span>
      </span>
      <button type="button" onClick={onNext} className={btn} aria-label="次のコンポーネント（]）" title="次へ（]）">
        <ChevronRight className="h-4 w-4" />
      </button>
      {notionPageUrl(name) && (
        <a href={notionPageUrl(name)} target="_blank" rel="noreferrer" className={btn} aria-label="Notionのページを開く（新しいタブ）" title="Notionで見る">
          <BookOpen className="h-4 w-4" />
        </a>
      )}
      <button type="button" onClick={onHide} className={btn} aria-label="ツールバーを隠す（H）" title="隠す（H で再表示）">
        <EyeOff className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ---------- ルート ---------- */
export default function App() {
  const [route, go] = useHashRoute();
  // プレビューだけ（iframe の中身 / 単体表示）
  if (route.embed && route.name) return <EmbedRoot key={route.name} name={route.name} search={route.search} />;
  return <Viewer current={route.embed ? null : route.name} search={route.search} go={go} />;
}

function Viewer({ current, search, go }: { current: string | null; search: string; go: (name: string | null) => void }) {
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const currentRef = useRef(current);

  useEffect(() => {
    currentRef.current = current;
    document.title = current ? `${META_BY_NAME[current]?.ja ?? current} | Preview` : 'コンポーネント一覧 | Preview';
  }, [current]);

  const step = useCallback(
    (delta: number) => {
      const i = currentRef.current ? NAMES.indexOf(currentRef.current) : -1;
      go(NAMES[(i + delta + NAMES.length) % NAMES.length]);
    },
    [go],
  );

  // キーボードショートカット（入力中・修飾キー併用時は無効）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || !currentRef.current) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === '[') step(-1);
      else if (e.key === ']') step(1);
      else if (e.key === 'g' || e.key === 'G') go(null);
      else if (e.key === 'h' || e.key === 'H') setToolbarVisible((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, step]);

  if (!current) return <IndexPage onSelect={go} />;

  // パラメータ切り替えに対応しているコンポーネント：プレビュー＋右パネル
  if (PLAYGROUND_NAMES.has(current)) {
    const meta = META_BY_NAME[current];
    return (
      <PlaygroundShell
        key={`${current}${search}`}
        name={current}
        ja={meta.ja}
        en={meta.en}
        index={NAMES.indexOf(current)}
        total={NAMES.length}
        search={search}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        onHome={() => go(null)}
      />
    );
  }

  const Demo = DEMOS[current];

  return (
    <>
      <DemoErrorBoundary key={current} name={current}>
        <Suspense
          fallback={<div className="flex min-h-screen items-center justify-center text-xs text-slate-400">読み込み中…</div>}
        >
          <Demo />
        </Suspense>
      </DemoErrorBoundary>

      {toolbarVisible ? (
        <Toolbar
          name={current}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          onHome={() => go(null)}
          onHide={() => setToolbarVisible(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setToolbarVisible(true)}
          aria-label="ツールバーを表示（H）"
          title="ツールバーを表示（H）"
          className="fixed bottom-4 left-4 z-[2147483647] h-3 w-3 rounded-full bg-slate-900/40 hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        />
      )}
    </>
  );
}
