import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, Sparkles } from 'lucide-react';

// ==========================================
// 1. バッジの型定義とスタイル設定
// ==========================================
type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'live';

interface StatusBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: boolean;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  warning: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  error: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  info: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/20',
    icon: <Info className="w-3.5 h-3.5" />,
  },
  live: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
    icon: (
      <span className="relative flex h-2 w-2 mr-0.5">
        <motion.span
          animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inline-flex h-full w-full rounded-full bg-purple-400"
        />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
      </span>
    ),
  },
};

// ==========================================
// 2. バッジコンポーネント本体
// ==========================================
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'info',
  children,
  icon = true,
}) => {
  const style = variantStyles[variant];

  return (
    <motion.span
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md transition-colors cursor-default ${style.bg} ${style.text} ${style.border}`}
    >
      {icon && style.icon}
      <span>{children}</span>
    </motion.span>
  );
};

// ==========================================
// 3. 動作確認・一覧表示用メインアプリケーション
// ==========================================
export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-8">
      {/* タイトル表示 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Status Badge Showcase
        </h2>
        <p className="text-sm text-slate-400">
          マルチバリエーション対応のステータスバッジセット
        </p>
      </div>

      {/* バッジ一覧（カード枠の中に並べて表示） */}
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-wrap gap-4 items-center justify-center max-w-lg shadow-2xl">
        <StatusBadge variant="success">アクティブ</StatusBadge>
        <StatusBadge variant="warning">要確認</StatusBadge>
        <StatusBadge variant="error">停止中</StatusBadge>
        <StatusBadge variant="info">アップデート v2.0</StatusBadge>
        <StatusBadge variant="live">LIVE 配信中</StatusBadge>
      </div>
    </div>
  );
}