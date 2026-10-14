import { useEffect, useId, useRef, useState } from 'react';
import type { FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  Building2,
  ChevronDown,
  Code2,
  GraduationCap,
  Headphones,
  LayoutTemplate,
  Megaphone,
  Menu,
  Newspaper,
  Palette,
  ShoppingBag,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* =========================================================
 * メガメニュー（Mega Menu）
 * - ヘッダーのナビ項目にホバー／クリックで、横幅いっぱいの大きなパネルを展開
 *   パネルは「カテゴリ列（アイコン＋説明付きリンク）」＋「おすすめ画像カード」の構成
 * - ホバーの開閉には少し遅延（openDelay / closeDelay）を入れ、カーソルが横切っただけで開いたり、
 *   パネルへ移動する途中で閉じたりしないようにする（タイマーは ref で管理し、イベント内でだけ操作）
 * - キーボード：トリガーは <button aria-expanded aria-controls>。Enter/Space で開閉、↓ でパネル先頭へ、
 *   ←→ で隣のトリガーへ、パネル内は ↑↓ でリンク移動、Escape で閉じてトリガーにフォーカスを戻す、
 *   Tab でパネル外へ出たら自動で閉じる
 * - スマホ（md 未満）はハンバーガー → 右からのドロワー。各カテゴリはアコーディオン（aria-expanded）
 * - prefers-reduced-motion 時はパネル・ドロワーのアニメーションを無効化（即時表示）
 * ========================================================= */

type LinkItem = { icon: LucideIcon; label: string; desc: string; href: string };
type Column = { heading: string; links: LinkItem[] };
type Featured = { image: string; tag: string; title: string; href: string };
type NavItem = { label: string; href?: string; columns?: Column[]; featured?: Featured };

const NAV: NavItem[] = [
  {
    label: 'サービス',
    columns: [
      {
        heading: '制作',
        links: [
          { icon: LayoutTemplate, label: 'Webサイト制作', desc: '企画から公開・運用までワンストップ', href: '#' },
          { icon: ShoppingBag, label: 'ECサイト構築', desc: '売れる導線設計とカート連携', href: '#' },
          { icon: Palette, label: 'ブランディング', desc: 'ロゴ・VI・トーン&マナー設計', href: '#' },
        ],
      },
      {
        heading: '運用・改善',
        links: [
          { icon: BarChart3, label: 'アクセス解析', desc: '数字から次の一手を提案', href: '#' },
          { icon: Megaphone, label: 'SNS運用支援', desc: '投稿設計と効果測定', href: '#' },
          { icon: Code2, label: '保守・更新', desc: '月額で安心のサポート', href: '#' },
        ],
      },
    ],
    featured: {
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=640&q=80',
      tag: 'NEW',
      title: '小さく始めるサイト制作プラン',
      href: '#',
    },
  },
  {
    label: '実績',
    columns: [
      {
        heading: '業種別',
        links: [
          { icon: Building2, label: 'コーポレート', desc: '信頼感を伝える企業サイト', href: '#' },
          { icon: ShoppingBag, label: '小売・EC', desc: '購入率を高めた改善事例', href: '#' },
          { icon: GraduationCap, label: '教育・スクール', desc: '問い合わせ数 2.4 倍の事例', href: '#' },
        ],
      },
      {
        heading: '種類別',
        links: [
          { icon: LayoutTemplate, label: 'LP・キャンペーン', desc: '短期で成果を出す1枚もの', href: '#' },
          { icon: Boxes, label: 'Webアプリ', desc: '業務を効率化する管理画面', href: '#' },
        ],
      },
    ],
    featured: {
      image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=640&q=80',
      tag: 'CASE',
      title: '老舗旅館のリブランディング',
      href: '#',
    },
  },
  {
    label: 'リソース',
    columns: [
      {
        heading: '学ぶ',
        links: [
          { icon: BookOpen, label: 'ブログ', desc: 'デザインと実装の小ネタ', href: '#' },
          { icon: Newspaper, label: 'お役立ち資料', desc: '発注前チェックリストなど', href: '#' },
        ],
      },
      {
        heading: 'サポート',
        links: [
          { icon: Headphones, label: 'よくある質問', desc: '料金・納期・進め方', href: '#' },
          { icon: Users, label: '無料相談会', desc: '毎月開催・オンライン', href: '#' },
        ],
      },
    ],
    featured: {
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=640&q=80',
      tag: 'GUIDE',
      title: 'はじめての Web 発注ガイド',
      href: '#',
    },
  },
  { label: '料金', href: '#' },
  { label: '会社情報', href: '#' },
];

const ACCENTS = {
  indigo: { text: 'text-indigo-600 dark:text-indigo-400', soft: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300', cta: 'bg-indigo-600 hover:bg-indigo-700', logo: 'bg-indigo-600', ring: 'focus-visible:ring-indigo-500' },
  rose: { text: 'text-rose-600 dark:text-rose-400', soft: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300', cta: 'bg-rose-600 hover:bg-rose-700', logo: 'bg-rose-600', ring: 'focus-visible:ring-rose-500' },
  emerald: { text: 'text-emerald-600 dark:text-emerald-400', soft: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300', cta: 'bg-emerald-600 hover:bg-emerald-700', logo: 'bg-emerald-600', ring: 'focus-visible:ring-emerald-500' },
  slate: { text: 'text-slate-900 dark:text-white', soft: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100', cta: 'bg-slate-900 hover:bg-black', logo: 'bg-slate-900', ring: 'focus-visible:ring-slate-500' },
} as const;

export interface MegaMenuProps {
  /** アクセント色 */
  accent?: keyof typeof ACCENTS;
  /** ホバーしてから開くまでの遅延（ms） */
  openDelay?: number;
  /** カーソルが離れてから閉じるまでの遅延（ms） */
  closeDelay?: number;
  /** パネル・ドロワーのアニメーション時間（秒） */
  duration?: number;
  /** おすすめ画像カードを表示するか */
  showFeatured?: boolean;
  /** ロゴ横のブランド名 */
  brandName?: string;
}

export function MegaMenu({
  accent = 'indigo',
  openDelay = 80,
  closeDelay = 220,
  duration = 0.22,
  showFeatured = true,
  brandName = 'Studio Hibi',
}: MegaMenuProps) {
  const ac = ACCENTS[accent];
  const reduce = useReducedMotion();
  const d = reduce ? 0 : duration;
  const uid = useId();

  const [open, setOpen] = useState<number | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(0);

  const timer = useRef<number | undefined>(undefined);
  const navRef = useRef<HTMLElement>(null);
  const triggerRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);

  const clear = () => window.clearTimeout(timer.current);
  const schedule = (fn: () => void, ms: number) => {
    clear();
    timer.current = window.setTimeout(fn, ms);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // パネル外クリックで閉じる
  useEffect(() => {
    if (open === null) return;
    const onDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // ドロワー表示中は Escape で閉じる＋背面スクロールを止める
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [drawer]);

  const panelLinks = (i: number) =>
    Array.from(document.querySelectorAll<HTMLAnchorElement>(`[data-panel="${uid}-${i}"] a[href]`));

  const focusTrigger = (i: number) => {
    const n = NAV.length;
    triggerRefs.current[(i + n) % n]?.focus();
  };

  const onTriggerKey = (e: ReactKeyboardEvent, i: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = i + (e.key === 'ArrowRight' ? 1 : -1);
      if (open !== null) setOpen(NAV[(next + NAV.length) % NAV.length].columns ? (next + NAV.length) % NAV.length : null);
      focusTrigger(next);
    } else if (e.key === 'ArrowDown' && NAV[i].columns) {
      e.preventDefault();
      clear();
      setOpen(i);
      requestAnimationFrame(() => panelLinks(i)[0]?.focus());
    } else if (e.key === 'Escape') {
      setOpen(null);
    }
  };

  const onPanelKey = (e: ReactKeyboardEvent, i: number) => {
    const links = panelLinks(i);
    const idx = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(null);
      focusTrigger(i);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = idx + (e.key === 'ArrowDown' ? 1 : -1);
      if (next < 0) focusTrigger(i);
      else links[Math.min(next, links.length - 1)]?.focus();
    }
  };

  // Tab でナビ全体の外へフォーカスが出たら閉じる
  const onNavBlur = (e: ReactFocusEvent) => {
    if (!navRef.current?.contains(e.relatedTarget as Node | null)) setOpen(null);
  };

  const active = open !== null ? NAV[open] : null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/85">
        <nav ref={navRef} aria-label="メインメニュー" onBlur={onNavBlur} onMouseLeave={() => schedule(() => setOpen(null), closeDelay)} onMouseEnter={clear}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
            <a href="#" className={`flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 ${ac.ring}`}>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md ${ac.logo}`}>
                <Sparkles className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-base font-bold text-slate-800 sm:text-lg dark:text-slate-100">{brandName}</span>
            </a>
  
            {/* PC：トップレベルのナビ */}
            <ul className="hidden items-center gap-1 md:flex">
              {NAV.map((item, i) => (
                <li key={item.label}>
                  {item.columns ? (
                    <button
                      ref={(el) => {
                        triggerRefs.current[i] = el;
                      }}
                      type="button"
                      aria-expanded={open === i}
                      aria-controls={`${uid}-panel-${i}`}
                      onClick={() => {
                        clear();
                        setOpen((o) => (o === i ? null : i));
                      }}
                      onMouseEnter={() => schedule(() => setOpen(i), open === null ? openDelay : 0)}
                      onKeyDown={(e) => onTriggerKey(e, i)}
                      className={`flex items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 ${ac.ring} ${
                        open === i ? ac.soft : 'text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      {item.label}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open === i ? 'rotate-180' : ''}`} aria-hidden />
                    </button>
                  ) : (
                    <a
                      ref={(el) => {
                        triggerRefs.current[i] = el;
                      }}
                      href={item.href}
                      onMouseEnter={() => schedule(() => setOpen(null), closeDelay)}
                      onKeyDown={(e) => onTriggerKey(e, i)}
                      className={`block rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100/80 focus-visible:outline-none focus-visible:ring-2 dark:text-slate-300 dark:hover:bg-slate-800/80 ${ac.ring}`}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
  
            <a href="#" className={`hidden items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:flex ${ac.cta} ${ac.ring}`}>
              無料相談する
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </a>
  
            <button
              type="button"
              onClick={() => setDrawer(true)}
              aria-label="メニューを開く"
              aria-expanded={drawer}
              aria-controls={`${uid}-drawer`}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 shadow-sm focus-visible:outline-none focus-visible:ring-2 md:hidden dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 ${ac.ring}`}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </div>
  
          {/* PC：メガパネル（ヘッダー直下に全幅で重ねる） */}
          <AnimatePresence>
            {active?.columns && open !== null && (
              <motion.div
                key="panel"
                id={`${uid}-panel-${open}`}
                data-panel={`${uid}-${open}`}
                role="region"
                aria-label={`${active.label}のメニュー`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: d, ease: 'easeOut' }}
                onKeyDown={(e) => onPanelKey(e, open)}
                className="absolute inset-x-0 top-full hidden border-b border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 md:block dark:border-slate-800/80 dark:bg-slate-950"
              >
                <motion.div
                  key={open}
                  initial={{ opacity: 0, x: reduce ? 0 : 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: d }}
                  className="mx-auto grid max-w-7xl gap-8 px-8 py-8"
                  style={{ gridTemplateColumns: `repeat(${active.columns.length}, minmax(0,1fr))${showFeatured && active.featured ? ' 280px' : ''}` }}
                >
                  {active.columns.map((col) => (
                    <div key={col.heading}>
                      <p className="px-3 text-[11px] font-bold tracking-[0.2em] text-slate-400">{col.heading}</p>
                      <ul className="mt-3 space-y-1">
                        {col.links.map(({ icon: Icon, label, desc, href }) => (
                          <li key={label}>
                            <a
                              href={href}
                              className={`group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 dark:hover:bg-slate-900 dark:focus-visible:bg-slate-900 ${ac.ring}`}
                            >
                              <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ac.soft}`}>
                                <Icon className="h-4.5 w-4.5" aria-hidden />
                              </span>
                              <span>
                                <span className="flex items-center gap-1 text-sm font-bold text-slate-800 dark:text-slate-100">
                                  {label}
                                  <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                                </span>
                                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{desc}</span>
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
  
                  {showFeatured && active.featured && (
                    <a
                      href={active.featured.href}
                      className={`group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-2xl bg-slate-800 p-5 text-white focus-visible:outline-none focus-visible:ring-2 ${ac.ring}`}
                    >
                      <img src={active.featured.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                      <span className="relative w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold tracking-widest backdrop-blur">{active.featured.tag}</span>
                      <span className="relative mt-2 text-base font-bold leading-snug">{active.featured.title}</span>
                      <span className="relative mt-2 flex items-center gap-1 text-xs font-semibold text-white/80">
                        詳しく見る <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                      </span>
                    </a>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* スマホ：ドロワー＋アコーディオン（header の backdrop-filter が fixed の基準になるのを避けるため header の外に置く） */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: d }}
              onClick={() => setDrawer(false)}
              className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm md:hidden"
              aria-hidden
            />
            <motion.div
              key="drawer"
              id={`${uid}-drawer`}
              role="dialog"
              aria-modal="true"
              aria-label="メニュー"
              initial={{ x: reduce ? 0 : '100%', opacity: reduce ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: reduce ? 0 : '100%', opacity: reduce ? 0 : 1 }}
              transition={{ duration: d + 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl md:hidden dark:bg-slate-950"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{brandName}</span>
                <button
                  type="button"
                  autoFocus
                  onClick={() => setDrawer(false)}
                  aria-label="メニューを閉じる"
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 dark:hover:bg-slate-800 ${ac.ring}`}
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-3">
                {NAV.map((item, i) =>
                  item.columns ? (
                    <div key={item.label} className="border-b border-slate-100 last:border-0 dark:border-slate-800/70">
                      <button
                        type="button"
                        aria-expanded={expanded === i}
                        aria-controls={`${uid}-acc-${i}`}
                        onClick={() => setExpanded((x) => (x === i ? null : i))}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-sm font-bold text-slate-800 focus-visible:outline-none focus-visible:ring-2 dark:text-slate-100 ${ac.ring}`}
                      >
                        {item.label}
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expanded === i ? 'rotate-180' : ''}`} aria-hidden />
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded === i && (
                          <motion.div
                            id={`${uid}-acc-${i}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: d }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-4 pb-4">
                              {item.columns.map((col) => (
                                <div key={col.heading}>
                                  <p className="px-3 text-[10px] font-bold tracking-[0.2em] text-slate-400">{col.heading}</p>
                                  <ul className="mt-1">
                                    {col.links.map(({ icon: Icon, label, desc, href }) => (
                                      <li key={label}>
                                        <a href={href} onClick={() => setDrawer(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 dark:hover:bg-slate-900 ${ac.ring}`}>
                                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${ac.soft}`}>
                                            <Icon className="h-4 w-4" aria-hidden />
                                          </span>
                                          <span>
                                            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
                                            <span className="block text-[11px] text-slate-500 dark:text-slate-400">{desc}</span>
                                          </span>
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <a key={item.label} href={item.href} onClick={() => setDrawer(false)} className={`block border-b border-slate-100 px-3 py-3.5 text-sm font-bold text-slate-800 last:border-0 focus-visible:outline-none focus-visible:ring-2 dark:border-slate-800/70 dark:text-slate-100 ${ac.ring}`}>
                      {item.label}
                    </a>
                  ),
                )}
              </div>

              <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                <a href="#" className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold text-white shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${ac.cta} ${ac.ring}`}>
                  無料相談する <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function MegaMenuDemo(props: MegaMenuProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <MegaMenu {...props} />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">MEGA MENU</span>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-800 sm:text-5xl dark:text-slate-100">
          情報の多いサイトも、
          <br />
          迷わせないナビゲーション。
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base dark:text-slate-400">
          「サービス」「実績」「リソース」にカーソルを乗せると大きなパネルが開きます。Tab・矢印キー・Escape でも操作できます。スマホ幅ではドロワー＋アコーディオンに切り替わります。
        </p>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {['導入実績 120 社', '平均納期 6 週間', '継続率 92%'].map((t) => (
            <div key={t} className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              {t}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return <MegaMenuDemo />;
}
