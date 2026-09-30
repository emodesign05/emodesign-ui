/* =========================================================
 * コンポーネント一覧用のメタ情報（日本語名 / 英語名 / カテゴリ）
 * - キーは src/components のファイル名（拡張子なし）
 * - ここに無いファイルは「未分類」としてファイル名で表示されます
 * - Notion「基本のコンポーネント」「ハイエンドコンポーネント」DB の名称・カテゴリに準拠
 * ========================================================= */

export type Category =
  | '基本レイアウト'
  | 'リッチ・表示'
  | 'デザイン・装飾'
  | 'CTA・コンバージョン'
  | '動き・演出'
  | '3D・高度表現'
  | '未分類';

export type ComponentMeta = { ja: string; en: string; category: Category; legacy?: boolean };

/** 表示順と配色（ドット・チップ） */
export const CATEGORIES: { name: Category; en: string; group: '基本' | 'ハイエンド' | 'その他'; dot: string }[] = [
  { name: '基本レイアウト', en: 'Layout', group: '基本', dot: 'bg-emerald-500' },
  { name: 'リッチ・表示', en: 'Rich Display', group: '基本', dot: 'bg-violet-500' },
  { name: 'デザイン・装飾', en: 'Decoration', group: '基本', dot: 'bg-pink-500' },
  { name: 'CTA・コンバージョン', en: 'Conversion', group: '基本', dot: 'bg-orange-500' },
  { name: '動き・演出', en: 'Motion', group: 'ハイエンド', dot: 'bg-sky-500' },
  { name: '3D・高度表現', en: '3D / WebGL', group: 'ハイエンド', dot: 'bg-rose-500' },
  { name: '未分類', en: 'Uncategorized', group: 'その他', dot: 'bg-slate-400' },
];

export const META: Record<string, ComponentMeta> = {
  /* ---------- 基本のコンポーネント ---------- */
  SplitLayoutHeroSection: { ja: 'ヒーローセクション', en: 'Split Layout Hero Section', category: '基本レイアウト' },
  NavLink: { ja: 'ヘッダー / ナビゲーションバー', en: 'Responsive Glassmorphism Header', category: '基本レイアウト' },
  CollapsibleSidebar: { ja: 'サイドバー / ドロワー', en: 'Collapsible Sidebar', category: '基本レイアウト' },
  PaginationProps: { ja: 'ページネーション', en: 'Interactive Pagination', category: '基本レイアウト' },
  BreadcrumbItem: { ja: 'パンくずリスト', en: 'Accessible Breadcrumbs', category: '基本レイアウト' },
  MultiColumnCorporateFooter: { ja: 'フッター', en: 'Multi-Column Corporate Footer', category: '基本レイアウト' },

  TabData: { ja: 'タブ切り替え', en: 'Animated Underline Tabs', category: 'リッチ・表示' },
  ShimmerSkeletonNewsCard: { ja: 'スケルトンローダー', en: 'Shimmer Skeleton UI', category: 'リッチ・表示' },
  AnimatedAccordionList: { ja: 'アコーディオン', en: 'Animated Accordion List', category: 'リッチ・表示' },
  FloatingTooltipAndPopover: { ja: 'ツールチップ / ポップオーバー', en: 'Floating Tooltip & Popover', category: 'リッチ・表示' },
  CardCarousel: { ja: 'カルーセル / スライダー', en: 'Touch-Enabled Card Carousel', category: 'リッチ・表示' },
  InfiniteScrollNewsList: { ja: '無限スクロールリスト', en: 'Infinite Scroll Loader', category: 'リッチ・表示' },
  ModalProps: { ja: 'モーダル / ダイアログ', en: 'Accessible Modal Dialog', category: 'リッチ・表示' },

  SVGWaveSlanted: { ja: 'ディバイダー', en: 'SVG Wave & Slanted Divider', category: 'デザイン・装飾' },
  BadgeVariant: { ja: 'バッジ / タグ', en: 'Multi-variant Status Badge', category: 'デザイン・装飾' },
  UserAvatar: { ja: 'アバター', en: 'User Avatar with Status', category: 'デザイン・装飾' },
  Parallax: { ja: 'パララックスセクション', en: 'Parallax Background Section', category: 'デザイン・装飾' },
  BentoGrid: { ja: 'ベントーグリッド', en: 'Bento Grid Feature Section', category: 'デザイン・装飾' },
  ECProductCard: { ja: 'カード', en: 'Article / Product Card', category: 'デザイン・装飾' },
  GlassmorphismCard: { ja: 'グラスモーフィズムコンテナ', en: 'Glassmorphism Card Wrapper', category: 'デザイン・装飾' },

  CTAButton: { ja: 'CTAバナー', en: 'High-Conversion CTA Banner', category: 'CTA・コンバージョン' },
  LeadFormData: { ja: 'リード獲得フォーム', en: 'Multi-Step Lead Form', category: 'CTA・コンバージョン' },
  InteractivePricingCards: { ja: '料金プラン表', en: 'Interactive Pricing Cards', category: 'CTA・コンバージョン' },
  InlineNewsletterSignupBar: { ja: 'メルマガ登録フォーム', en: 'Inline Newsletter Signup', category: 'CTA・コンバージョン' },
  TestimonialCard: { ja: 'お客様の声', en: 'Testimonial Masonry Grid', category: 'CTA・コンバージョン' },
  ExpandableFAB: { ja: 'フローティングアクションボタン', en: 'Expandable FAB', category: 'CTA・コンバージョン' },
  TimeLeft: { ja: 'カウントダウンタイマー', en: 'Campaign Countdown Timer', category: 'CTA・コンバージョン' },

  /* ---------- ハイエンドコンポーネント：動き・演出 ---------- */
  LoadingCounter: { ja: 'プリローダー', en: 'Loading Counter', category: '動き・演出' },
  CurtainReveal: { ja: 'カーテンリビール', en: 'Curtain Reveal', category: '動き・演出' },
  StaggeredTextReveal: { ja: '文字スタガーアニメーション', en: 'Staggered Text Reveal', category: '動き・演出' },
  ScrollVelocityMarquee: { ja: '速度連動無限マーキー', en: 'Scroll Velocity Marquee', category: '動き・演出' },
  DualLayerCustomCursor: { ja: 'カスタムカーソル', en: 'Dual-Layer Custom Cursor', category: '動き・演出' },
  ContextualLabelCursor: { ja: 'コンテキストカーソルラベル', en: 'Contextual Label Cursor', category: '動き・演出' },
  MagneticHoverButton: { ja: 'マグネティックボタン', en: 'Magnetic Hover Button', category: '動き・演出' },
  InnerImageZoom: { ja: 'イメージズーム', en: 'Inner Image Zoom', category: '動き・演出' },
  AnimatedHoverUnderline: { ja: 'アンダーラインスイープ', en: 'Animated Hover Underline', category: '動き・演出' },
  HoverImagePeek: { ja: 'ホバーピーク', en: 'Hover Image Peek', category: '動き・演出' },
  TiltCard3D: { ja: '3Dチルトカード', en: '3D Tilt Card', category: '動き・演出' },
  CircleClipMenu: { ja: 'サークルクリップメニュー', en: 'Circle Clip-Path Menu', category: '動き・演出' },
  DragMomentumCarousel: { ja: 'ドラッグスクロール＋慣性', en: 'Drag Momentum Carousel', category: '動き・演出' },
  LenisSmoothScroll: { ja: 'スムーススクロール', en: 'Smooth Scroll (Lenis)', category: '動き・演出' },
  ScrollRevealFadeUp: { ja: 'スクロールリビール', en: 'Scroll Reveal / Fade Up', category: '動き・演出' },
  ScrollParallaxLayers: { ja: 'パララックス', en: 'Scroll Parallax Layer', category: '動き・演出' },
  StickyHeroOverlap: { ja: 'ヒーローピン＋オーバーラップ', en: 'Sticky Hero Overlap', category: '動き・演出' },
  ClipPathImageReveal: { ja: 'イメージクリップリビール', en: 'Clip-path Image Reveal', category: '動き・演出' },
  ScrollProgressBar: { ja: 'プログレスバー', en: 'Top Scroll Progress Bar', category: '動き・演出' },
  SideDotScrollSpy: { ja: 'セクションインジケーター', en: 'Side Dot ScrollSpy', category: '動き・演出' },
  ScrollColorVeil: { ja: 'ナイトベール', en: 'Scroll-Driven Color Veil', category: '動き・演出' },
  OrganicMeshGradient: { ja: 'メッシュグラデーション', en: 'Organic Mesh Gradient', category: '動き・演出' },
  MultiLayerFog: { ja: 'フォグレイヤー', en: 'Multi-Layered Animated Fog', category: '動き・演出' },
  FilmGrainOverlay: { ja: 'フィルムグレイン', en: 'SVG Film Grain Overlay', category: '動き・演出' },
  WaterRippleCanvas: { ja: 'ウォーターリップル', en: 'Canvas Water Ripple', category: '動き・演出' },
  MagicScroll: { ja: 'マジックスクロール', en: 'Scroll-Pinned Storytelling', category: '動き・演出' },
  PinnedHorizontalScroll: { ja: '横スクロールセクション', en: 'Pinned Horizontal Scroll', category: '動き・演出' },
  ScrollImageSequence: { ja: 'スクロール連動の連番画像', en: 'Scroll-Scrubbed Image Sequence', category: '動き・演出' },
  StickyCardStack: { ja: 'スティッキーカードスタック', en: 'Sticky Stacking Cards', category: '動き・演出' },
  ZoomThroughHero: { ja: 'ズームスルーヒーロー', en: 'Scroll Zoom-Through Hero', category: '動き・演出' },
  ScrollTextFill: { ja: 'スクロール文字塗り', en: 'Scroll Text Fill', category: '動き・演出' },
  TextScramble: { ja: 'テキストスクランブル', en: 'Text Scramble / Decode', category: '動き・演出' },
  NumberCountUp: { ja: '数値カウントアップ', en: 'Number Count Up', category: '動き・演出' },
  SVGPathDraw: { ja: 'SVGラインドローイング', en: 'SVG Path Draw', category: '動き・演出' },
  ImageTrailCursor: { ja: '画像トレイル', en: 'Image Trail Cursor', category: '動き・演出' },
  SpotlightCard: { ja: 'スポットライトカード', en: 'Spotlight Glow Card', category: '動き・演出' },
  FlipFilterGrid: { ja: '並び替えアニメーション', en: 'FLIP Filter Grid', category: '動き・演出' },
  RotatingCircularText: { ja: '回転テキストバッジ', en: 'Circular Rotating Text', category: '動き・演出' },
  SharedElementTransition: { ja: 'ページ遷移（共有要素）', en: 'Shared Element Transition', category: '動き・演出' },
  GooeyBlobs: { ja: 'グーイー', en: 'Gooey Liquid Blobs', category: '動き・演出' },

  /* ---------- ハイエンドコンポーネント：3D・高度表現 ---------- */
  Interactive3DCanvasHero: { ja: '3Dヒーローシーン', en: 'Interactive 3D Canvas Hero', category: '3D・高度表現' },
  ScrollDriven3DScene: { ja: 'スクロール連動3D演出', en: 'Scroll-Driven 3D Scene', category: '3D・高度表現' },
  ProductViewer360: { ja: '360度3D商品ビューワー', en: 'Interactive 3D Product Viewer', category: '3D・高度表現' },
  SplineSceneWrapper: { ja: 'Spline 3D埋め込み', en: 'Spline Scene Wrapper', category: '3D・高度表現' },
  InteractiveParticleNetwork: { ja: 'パーティクル背景', en: 'Canvas Particle Network', category: '3D・高度表現' },
  HoverImageDistortion: { ja: 'ホバー画像ディストーション', en: 'WebGL Hover Distortion', category: '3D・高度表現' },
  ShaderGradientBackground: { ja: 'シェーダーグラデーション背景', en: 'Shader Gradient Background', category: '3D・高度表現' },
  ParticleTextMorph: { ja: 'パーティクル文字', en: 'Particle Text Morph', category: '3D・高度表現' },
};

export function getMeta(file: string): ComponentMeta {
  return META[file] ?? { ja: file, en: file, category: '未分類' };
}
