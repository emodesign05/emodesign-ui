import { motion, useReducedMotion } from 'framer-motion';
import { AtSign, Globe, Mail } from 'lucide-react';
import type { CSSProperties } from 'react';

/* =========================================================
 * スタッフ／チーム紹介カード（Team Member Cards）
 * - 写真・役職・名前・ひとことのカードをグリッドで並べる（列数は columns で 2〜4）
 * - ホバー（またはキーボードでカード内にフォーカス）で、写真がモノクロ → カラーへ変化し少しズーム、
 *   下から SNS リンクがスライドして出現する（CSS の grayscale フィルター＋ group-hover / group-focus-within）
 * - ホバーできない端末（スマホ等）では最初からカラー＋SNS リンク表示（@media (hover: none)）
 * - SNS は特定サービスの公式ロゴを使わず、lucide の汎用アイコン（AtSign / Globe / Mail）＋ aria-label
 * - 人物名・役職はすべて架空
 * - prefers-reduced-motion 時はズームと登場アニメーションを止め、色の変化だけ残す
 * ========================================================= */

export type Member = {
  name: string;
  kana: string;
  role: string;
  comment: string;
  image: string;
};

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&h=750&q=80`;

const MEMBERS: Member[] = [
  { name: 'ハナ・リー', kana: 'HANA LEE', role: '代表 / アートディレクター', comment: '余白にこそ、ブランドの声が宿ると信じています。', image: img('photo-1534528741775-53994a69daeb') },
  { name: 'ダニエル・クルス', kana: 'DANIEL CRUZ', role: 'フロントエンドエンジニア', comment: '0.1 秒の気持ちよさを、コードで積み上げます。', image: img('photo-1507003211169-0a1dd7228f2d') },
  { name: 'エマ・ウィルソン', kana: 'EMMA WILSON', role: 'UI / UX デザイナー', comment: '迷わない画面は、やさしい画面だと思う。', image: img('photo-1494790108377-be9c29b29330') },
  { name: 'ルーカス・マルタン', kana: 'LUCAS MARTIN', role: 'ディレクター', comment: '「伝わる」までを一緒に考える担当です。', image: img('photo-1500648767791-00dcc994a43e') },
  { name: 'オリビア・ブラウン', kana: 'OLIVIA BROWN', role: 'グラフィックデザイナー', comment: '紙もWebも、手ざわりのあるデザインを。', image: img('photo-1438761681033-6461ffad8d80') },
  { name: 'トーマス・ベッカー', kana: 'THOMAS BECKER', role: 'バックエンドエンジニア', comment: '見えない部分ほど丁寧に作ります。', image: img('photo-1472099645785-5658abf4ff4e') },
  { name: 'ソフィー・ローラン', kana: 'SOPHIE LAURENT', role: 'コピーライター', comment: '一行で心が動く言葉を探しています。', image: img('photo-1544005313-94ddf0286df2') },
  { name: 'ノア・アンデルセン', kana: 'NOAH ANDERSEN', role: 'マーケター', comment: '数字の向こうにいる「人」を見ます。', image: img('photo-1506794778202-cad84cf45f1d') },
];

const COLS = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
} as const;

const RADIUS = { none: 'rounded-none', md: 'rounded-xl', lg: 'rounded-3xl' } as const;

export interface TeamMemberCardsProps {
  /** 列数（PC 幅での列数。スマホでは自動で減る） */
  columns?: 2 | 3 | 4;
  /** モノクロ → カラーに変わる時間（秒） */
  duration?: number;
  /** 初期状態をモノクロにするか（false なら常にカラー） */
  grayscale?: boolean;
  /** ホバーで SNS リンクを表示するか */
  showSocial?: boolean;
  /** カードの角丸 */
  radius?: keyof typeof RADIUS;
  /** 表示するメンバー（省略時は架空の 8 名） */
  members?: Member[];
}

export function TeamMemberCards({
  columns = 4,
  duration = 0.6,
  grayscale = true,
  showSocial = true,
  radius = 'lg',
  members = MEMBERS,
}: TeamMemberCardsProps) {
  const reduce = useReducedMotion();
  const r = RADIUS[radius];
  const t = { transitionDuration: `${duration}s` } as CSSProperties;

  return (
    <ul className={`grid gap-x-5 gap-y-10 ${COLS[columns]}`}>
      {members.map((m, i) => (
        <motion.li
          key={m.name}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: (i % columns) * 0.08, ease: 'easeOut' }}
        >
          <article className="group">
            <div className={`relative aspect-[4/5] overflow-hidden bg-slate-200 dark:bg-slate-800 ${r}`}>
              <img
                src={m.image}
                alt={`${m.name}の写真`}
                loading="lazy"
                style={t}
                className={`h-full w-full object-cover transition-[filter,transform] ease-out group-hover:scale-105 group-focus-within:scale-105 motion-reduce:group-hover:scale-100 ${
                  grayscale ? 'grayscale group-hover:grayscale-0 group-focus-within:grayscale-0 [@media(hover:none)]:grayscale-0' : ''
                }`}
              />
              {showSocial && (
                <div
                  style={t}
                  className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-gradient-to-t from-slate-950/70 to-transparent px-3 pb-4 pt-10 opacity-0 transition-all ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 motion-reduce:translate-y-0 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
                >
                  {[
                    { icon: AtSign, label: 'SNS' },
                    { icon: Globe, label: 'ポートフォリオ' },
                    { icon: Mail, label: 'メール' },
                  ].map(({ icon: Icon, label }) => (
                    <a
                      key={label}
                      href="#"
                      aria-label={`${m.name}の${label}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-sm transition-colors hover:bg-white hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 px-1">
              <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">{m.role}</p>
              <h3 className="mt-1 text-base font-bold text-slate-800 sm:text-lg dark:text-slate-100">{m.name}</h3>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400">{m.kana}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-slate-400">{m.comment}</p>
            </div>
          </article>
        </motion.li>
      ))}
    </ul>
  );
}

export function TeamMemberCardsDemo(props: TeamMemberCardsProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 sm:py-24 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">OUR TEAM</span>
          <h2 className="mt-3 text-2xl font-bold text-slate-800 sm:text-4xl dark:text-slate-100"><span className="inline-block">つくる人たちを、</span><span className="inline-block">ご紹介します。</span></h2>
          <p className="mt-3 text-xs text-slate-500 sm:text-sm dark:text-slate-400">写真にカーソルを乗せると、カラーになって SNS リンクが現れます。</p>
        </div>
        <TeamMemberCards {...props} />
      </div>
    </main>
  );
}

export default function App() {
  return <TeamMemberCardsDemo />;
}
