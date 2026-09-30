import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';

// ==========================================
// 1. 型定義とサイズ・ステータススタイル設定
// ==========================================
type AvatarSize = 'sm' | 'md' | 'lg';
type UserStatus = 'online' | 'away' | 'busy' | 'offline';

interface UserAvatarProps {
  src?: string;
  alt?: string;
  fallbackText?: string;
  size?: AvatarSize;
  status?: UserStatus;
  showStatus?: boolean;
}

const sizeStyles: Record<AvatarSize, { outer: string; inner: string; text: string; dot: string }> = {
  sm: { outer: 'w-10 h-10', inner: 'w-8 h-8', text: 'text-xs', dot: 'w-2.5 h-2.5' },
  md: { outer: 'w-14 h-14', inner: 'w-12 h-12', text: 'text-sm', dot: 'w-3.5 h-3.5' },
  lg: { outer: 'w-18 h-18', inner: 'w-16 h-16', text: 'text-base', dot: 'w-4 h-4' },
};

const statusColors: Record<UserStatus, string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-500',
  busy: 'bg-rose-500',
  offline: 'bg-slate-400',
};

// ==========================================
// 2. ライトモード向けアバターコンポーネント本体
// ==========================================
export const UserAvatarLight: React.FC<UserAvatarProps> = ({
  src,
  alt = 'User Avatar',
  fallbackText,
  size = 'md',
  status = 'online',
  showStatus = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const sizeStyle = sizeStyles[size];
  const isOnline = status === 'online';

  return (
    <div className="relative inline-block">
      {/* 枠線ラッパー：オンライン時のみ「グリーン〜ホワイト〜イエロー」グラデーションを表示 */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        className={`rounded-full p-0.5 flex items-center justify-center transition-all shadow-sm ${
          isOnline
            ? 'bg-gradient-to-tr from-emerald-400 via-white to-amber-300 shadow-emerald-500/20 shadow-md'
            : 'bg-slate-200'
        } ${sizeStyle.outer}`}
      >
        {/* アバター画像 / フォールバック表示 */}
        <div
          className={`relative rounded-full overflow-hidden bg-slate-100 border border-white flex items-center justify-center text-slate-700 font-bold select-none ${sizeStyle.inner}`}
        >
          {src && !hasError ? (
            <img
              src={src}
              alt={alt}
              onError={() => setHasError(true)}
              className="w-full h-full object-cover"
            />
          ) : fallbackText ? (
            <span className={`tracking-wider ${sizeStyle.text}`}>{fallbackText}</span>
          ) : (
            <User className="w-1/2 h-1/2 text-slate-400" />
          )}
        </div>
      </motion.div>

      {/* ステータスインジケーター（右下静的ドット） */}
      {showStatus && (
        <div className="absolute bottom-0.5 right-0.5 flex items-center justify-center">
          <span
            className={`block rounded-full border-2 border-white shadow-sm ${sizeStyle.dot} ${statusColors[status]}`}
          />
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. 動作確認・一覧表示用メインアプリケーション（ライトモード）
// ==========================================
export default function App() {
  const avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 space-y-10">
      {/* ヘッダー */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          User Avatar Showcase
        </h2>
        <p className="text-sm text-slate-500">
          オンライン時にグラデーション境界線がつくアバター
        </p>
      </div>

      {/* カードコンテナ（ライトモード仕様） */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xl space-y-8 max-w-md w-full">
        
        {/* セクション1: サイズバリエーション */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sizes (Sm / Md / Lg)</h3>
          <div className="flex items-end gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 justify-around">
            <UserAvatarLight size="sm" src={avatarUrl} status="online" />
            <UserAvatarLight size="md" src={avatarUrl} status="online" />
            <UserAvatarLight size="lg" src={avatarUrl} status="online" />
          </div>
        </div>

        {/* セクション2: ステータスバリエーション（オンライン時のみ枠線がグラデーション化） */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statuses (Online gets Gradient Border)</h3>
          <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 justify-around">
            <UserAvatarLight size="md" src={avatarUrl} status="online" />
            <UserAvatarLight size="md" src={avatarUrl} status="away" />
            <UserAvatarLight size="md" src={avatarUrl} status="busy" />
            <UserAvatarLight size="md" src={avatarUrl} status="offline" />
          </div>
        </div>

        {/* セクション3: フォールバック（画像なし） */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fallback (Initials / Icon)</h3>
          <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 justify-around">
            <UserAvatarLight size="md" fallbackText="JD" status="online" />
            <UserAvatarLight size="md" fallbackText="AK" status="away" />
            <UserAvatarLight size="md" status="offline" />
          </div>
        </div>

      </div>
    </div>
  );
}