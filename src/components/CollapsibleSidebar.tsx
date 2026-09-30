import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart2,
  Users,
  Settings,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  TrendingUp,
  DollarSign,
  Activity,
  CheckCircle2,
} from 'lucide-react';

// --- ナビゲーションメニュー項目の型定義 ---
interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { id: 'analytics', label: 'アナリティクス', icon: BarChart2 },
  { id: 'users', label: 'ユーザー管理', icon: Users },
  { id: 'notifications', label: 'お知らせ', icon: Bell, badge: '9+' },
  { id: 'settings', label: '設定・環境構築', icon: Settings },
];

// --- メインコンテンツ領域（画面切替デモ用） ---
const MainContentArea = memo(({ activeId }: { activeId: string }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeId}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        {/* 1. ダッシュボード画面 */}
        {activeId === 'dashboard' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-800 sm:text-2xl dark:text-slate-100">
                  ダッシュボード概要
                </h1>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                  本日のシステム稼働状況と主要KPI指標のリアルタイムデータです。
                </p>
              </div>
              <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>システム正常稼働中</span>
              </span>
            </div>

            {/* KPI統計カード */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">総ユーザー数</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-extrabold text-slate-800 dark:text-slate-100">12,480 人</p>
                <div className="mt-2 flex items-center space-x-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>前月比 +12.5% 増加</span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">今月のMRR（売上）</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-extrabold text-slate-800 dark:text-slate-100">¥3,450,000</p>
                <div className="mt-2 flex items-center space-x-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>前月比 +8.2% 増加</span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">アクティブ率</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-extrabold text-slate-800 dark:text-slate-100">88.4 %</p>
                <div className="mt-2 flex items-center space-x-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <span>高エンゲージメント維持</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 2. アナリティクス画面 */}
        {activeId === 'analytics' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">アナリティクス解析</h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              アクセス分析およびコンバージョン率の推移レポートです。
            </p>
            <div className="mt-6 flex h-48 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs font-bold text-slate-400">グラフエリア（Analytics Chart Placeholder）</span>
            </div>
          </div>
        )}

        {/* 3. ユーザー管理画面 */}
        {activeId === 'users' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">ユーザー管理</h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              登録ユーザーのアカウント権限およびステータス管理です。
            </p>
            <div className="mt-6 space-y-2">
              {['山田 太郎 (管理者)', '佐藤 美咲 (デザイナー)', '鈴木 健太 (エンジニア)'].map((name, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <span>{name}</span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">アクティブ</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. お知らせ画面 */}
        {activeId === 'notifications' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">お知らせ・通知</h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              システム更新情報および重要なお知らせリストです。
            </p>
            <p className="mt-4 text-xs text-indigo-600 dark:text-indigo-400 font-bold">・新コンポーネントライブラリがアップデートされました（V2.4）</p>
          </div>
        )}

        {/* 5. 設定画面 */}
        {activeId === 'settings' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">設定・環境構築</h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              アカウントプロファイルおよびAPIキーの設定項目です。
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});

MainContentArea.displayName = 'MainContentArea';

const ACCENTS = {
  indigo: { active: 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none', logo: 'bg-indigo-600' },
  rose: { active: 'bg-rose-600 text-white shadow-md shadow-rose-200 dark:shadow-none', logo: 'bg-rose-600' },
  emerald: { active: 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none', logo: 'bg-emerald-600' },
  slate: { active: 'bg-slate-800 text-white shadow-md shadow-slate-300 dark:shadow-none', logo: 'bg-slate-800' },
} as const;

export interface SidebarProps {
  accent?: keyof typeof ACCENTS;
  expandedWidth?: number;
  collapsedWidth?: number;
  stiffness?: number;
  damping?: number;
}

// --- サイドバー ＋ メイン領域 一体化コンポーネント ---
export function CollapsibleSidebar({
  accent = 'indigo',
  expandedWidth = 256,
  collapsedWidth = 80,
  stiffness = 300,
  damping = 30,
}: SidebarProps) {
  const ac = ACCENTS[accent];
  const [activeId, setActiveId] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false); // PC用折りたたみ
  const [isMobileOpen, setIsMobileOpen] = useState(false); // スマホ用ドロワー

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* 1. スマホ用ヘッダー */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4 md:hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-6 w-6" />
          <span className="font-bold text-slate-800 dark:text-slate-100">AI Dashboard</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="メニューを開く"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* 2. スマホ用ドロワー */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness, damping }}
              className="fixed bottom-0 left-0 top-0 z-10 flex w-72 flex-col border-r border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-6 w-6" />
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-100">AI Dashboard</span>
                </div>
                <button onClick={() => setIsMobileOpen(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-6 flex-1 space-y-1.5">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === activeId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveId(item.id);
                        setIsMobileOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                        isActive
                          ? ac.active
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 3. PC用レスポンシブ伸縮サイドバー */}
      <motion.aside
        animate={{ width: isCollapsed ? collapsedWidth : expandedWidth }}
        transition={{ type: 'spring', stiffness, damping }}
        className="hidden md:flex fixed bottom-0 left-0 top-0 z-30 flex-col border-r border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-md dark:shadow-none ${ac.logo}`}>
              <Sparkles className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <span className="whitespace-nowrap text-base font-bold text-slate-800 dark:text-slate-100">
                AI Dashboard
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="mt-6 flex-1 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`relative flex w-full items-center rounded-2xl p-3 text-sm font-semibold transition-colors ${
                  isCollapsed ? 'justify-center' : 'justify-between'
                } ${
                  isActive
                    ? ac.active
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </div>
                {item.badge && !isCollapsed && (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
                {item.badge && isCollapsed && (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center space-x-3 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="ユーザー"
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
              {!isCollapsed && (
                <div className="overflow-hidden whitespace-nowrap">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">山田 太郎</p>
                  <p className="truncate text-[11px] text-slate-400">admin@example.com</p>
                </div>
              )}
            </div>
            {!isCollapsed && <LogOut className="h-4 w-4 shrink-0 text-slate-400 hover:text-rose-500 cursor-pointer" />}
          </div>
        </div>
      </motion.aside>

      {/* 4. メインコンテンツエリア（サイドバーの幅に応じて動的に左余白が変化） */}
      <motion.main
        animate={{ paddingLeft: (isCollapsed ? collapsedWidth : expandedWidth) + 16 }}
        transition={{ type: 'spring', stiffness, damping }}
        className="p-6 transition-all hidden md:block"
      >
        <div className="mx-auto max-w-5xl">
          <MainContentArea activeId={activeId} />
        </div>
      </motion.main>

      {/* スマホ用メインエリア */}
      <main className="p-4 md:hidden">
        <MainContentArea activeId={activeId} />
      </main>
    </div>
  );
}

export default function App() {
  return <CollapsibleSidebar />;
}
