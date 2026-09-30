import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, HelpCircle, Settings, Bell, X, User } from 'lucide-react';

// --- 1. シンプルなツールチップ（Hoverで表示） ---
interface TooltipProps {
  text: string;
  children: React.ReactNode;
  duration?: number;
  offset?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, duration = 0.15, offset = 5 }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: offset, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: offset, scale: 0.95 }}
            transition={{ duration }}
            className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900"
          >
            {text}
            {/* 矢印（三角形） */}
            <div className="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 2. リッチなポップオーバー（Clickで表示） ---
interface PopoverProps {
  title: string;
  children: React.ReactNode;
  duration?: number;
  offset?: number;
}

export const Popover: React.FC<PopoverProps> = ({ title, children, duration = 0.2, offset = 8 }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>{children}</div>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* バックドロップ（外側クリックで閉じるための透明なレイヤー） */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            {/* ポップオーバー本体 */}
            <motion.div
              initial={{ opacity: 0, y: offset, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: offset, scale: 0.95 }}
              transition={{ duration }}
              className="absolute top-full left-1/2 mt-2 w-72 -translate-x-1/2 z-50 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {title}
                </h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                <p className="mb-3">
                  通知設定や表示オプションをここから迅速に変更できます。
                </p>
                <div className="space-y-2">
                  <button className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
                    <span className="flex items-center space-x-2">
                      <Bell className="h-3.5 w-3.5 text-indigo-500" />
                      <span>プッシュ通知</span>
                    </span>
                    <span className="text-indigo-600 font-semibold">ON</span>
                  </button>
                  <button className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
                    <span className="flex items-center space-x-2">
                      <User className="h-3.5 w-3.5 text-indigo-500" />
                      <span>プロフィール詳細</span>
                    </span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
              {/* 矢印（上向き） */}
              <div className="absolute bottom-full left-1/2 -ml-2 border-8 border-transparent border-b-white dark:border-b-slate-900" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- メインアプリケーション component ---
export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-6 text-xl font-bold text-slate-800 dark:text-slate-100 text-center">
          Floating Tooltip & Popover
        </h2>

        <div className="flex flex-col space-y-8 items-center">
          {/* デモ 1: ツールチップ (Hover) */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Hover デモ:
            </span>
            <Tooltip text="ヘルプ情報を表示中">
              <button className="flex items-center space-x-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                <HelpCircle className="h-4 w-4" />
                <span>ヘルプ</span>
              </button>
            </Tooltip>

            <Tooltip text="詳細な設定">
              <button className="rounded-xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                <Settings className="h-4 w-4" />
              </button>
            </Tooltip>
          </div>

          {/* デモ 2: ポップオーバー (Click) */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Click デモ:
            </span>
            <Popover title="クイックメニュー">
              <button className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 dark:shadow-none">
                <Info className="h-4 w-4" />
                <span>メニューを開く</span>
              </button>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}