/* =========================================================
 * Notion との対応表
 * - NOTION_BASE：Notion ページの URL の頭（Web 公開した notion.site のドメインに変えてもよい）
 * - NOTION_DATABASES：一覧ページから開く 2 つのデータベース
 * - NOTION_PAGES：コンポーネント名（src/components のファイル名）→ Notion ページ ID
 *   新しいコンポーネントを足したら、ここにも 1 行追加する（無ければ「Notionで見る」は出ない）
 * ========================================================= */
export const NOTION_BASE = 'https://www.notion.so';

export const NOTION_DATABASES = [
  { label: '基本のコンポーネント', id: '91593440d30e40b3a2f5cae08bb01480' },
  { label: 'ハイエンドコンポーネント', id: '3e68191cdbc0801c80e1c836cee55319' },
] as const;

const NOTION_PAGES: Record<string, string> = {
  AnimatedAccordionList: '649bd4f20c8044758f2b9be841838d33',
  AnimatedHoverUnderline: '3298191cdbc0825398f18172a6a07d8f',
  BadgeVariant: '78b12b0728fa4a04a7954fac22254816',
  BentoGrid: '7f641e3c54704714892fe7c8ca10e74b',
  BreadcrumbItem: 'a12e1299f96b4e3488f82ac3aab9c896',
  CTAButton: '0ac0239e03224a18a17c94ce7d6ccca7',
  CardCarousel: '807e96b85ecf41219f9339d509422702',
  CircleClipMenu: '3738191cdbc083ada6fb816475e53d9d',
  ClipPathImageReveal: 'c708191cdbc0837ca24f81ac88ccf983',
  CollapsibleSidebar: '62f7bac8ba0e41b78d4d1e31f9194447',
  ContextualLabelCursor: '88a8191cdbc0838d9a390121084a7e18',
  CurtainReveal: '9bb8191cdbc08228aadf01775c753563',
  DragMomentumCarousel: 'abe8191cdbc082d28a72814dd4d8a0f6',
  DualLayerCustomCursor: '3e78191cdbc0825bb7db017d05c18f34',
  ECProductCard: 'bb62f11cf80a4243ad964f65e1ff5b9b',
  ExpandableFAB: 'b0763d63d7a042c7b4ae501cfd261aef',
  FilmGrainOverlay: 'cb78191cdbc0837c953d014f7cca6a01',
  FlipFilterGrid: '3eb8191cdbc08174b6c2f4a19db2a996',
  FloatingTooltipAndPopover: '73db57dca4ba452e9a356cb71a75bf57',
  GlassmorphismCard: 'e291d9024804477db7e62d7a5828dc38',
  GooeyBlobs: '3eb8191cdbc081dc9686d7967d440c34',
  HoverImageDistortion: '3eb8191cdbc0811c8893f95bbfd4154a',
  HoverImagePeek: '97c8191cdbc08374a9218182b1847057',
  ImageTrailCursor: '3eb8191cdbc081cdb0fad2dff62006e1',
  InfiniteScrollNewsList: 'bb5950f9f9064283b7503e90a06d6287',
  InlineNewsletterSignupBar: '5f38275d6649401398466cd6eed85ac1',
  InnerImageZoom: '1eb8191cdbc0823898fa011d6d808eef',
  Interactive3DCanvasHero: '9b98191cdbc0837ba5e881eaa6bf6763',
  InteractiveParticleNetwork: '4a28191cdbc08347b041817796a367ba',
  InteractivePricingCards: '2452eface5c94bb6b6bab732a73aa023',
  LeadFormData: '23c8d34815534f338de8e818f6981822',
  LenisSmoothScroll: '6108191cdbc0833db03481c6fc19ad9f',
  LoadingCounter: '91a8191cdbc082c49c38015e9d88bf78',
  MagicScroll: '3eb8191cdbc081f5ab0df316b5b94002',
  MagneticHoverButton: 'b8d8191cdbc083029c178138e325074a',
  ModalProps: 'c4c42e91caa74a669c3b80f169c0eab5',
  MultiColumnCorporateFooter: 'f71da3dd9591476e85f0f7424838e91e',
  MultiLayerFog: 'bd48191cdbc08224b5e8814bebd2b84d',
  NavLink: '59092e2816a0444eabec19b02af1818b',
  NumberCountUp: '3eb8191cdbc081a3b873c132d3c04280',
  OrganicMeshGradient: 'eaa8191cdbc083a8b1e3019b1167a4af',
  PaginationProps: '834d7ca27aec4063b209177528a5d13a',
  Parallax: '7b71c72116404db68305db0bde02effd',
  ParticleTextMorph: '3eb8191cdbc081489d6ec28deb4102e5',
  PinnedHorizontalScroll: '3eb8191cdbc081b9a330e87bd544743c',
  ProductViewer360: 'fb38191cdbc0838b85b401d95c402736',
  RotatingCircularText: '3eb8191cdbc0811bb743e456fcb7a521',
  SVGPathDraw: '3eb8191cdbc0817a84e4eecf35a82acb',
  SVGWaveSlanted: '0581c034b742456a8d2be19c25a42c8e',
  ScrollColorVeil: 'e188191cdbc082c8a60b81d107522bfe',
  ScrollDriven3DScene: '8a58191cdbc082f1821f81c0d83dda3f',
  ScrollImageSequence: '3eb8191cdbc081199248df2c078723cf',
  ScrollParallaxLayers: 'e0f8191cdbc0825fb4ec810a7f7c923f',
  ScrollProgressBar: '9218191cdbc082f588038186036c49ff',
  ScrollRevealFadeUp: 'bac8191cdbc0834dbbd30108b16907db',
  ScrollTextFill: '3eb8191cdbc0810d9867de5f4621c148',
  ScrollVelocityMarquee: '24e8191cdbc082409d480131c08ee965',
  ShaderGradientBackground: '3eb8191cdbc081b6a5adfc6ba8a1f9e4',
  SharedElementTransition: '3eb8191cdbc081bca0f3c70e2e19591e',
  ShimmerSkeletonNewsCard: '5ac98a0962c342988a837bf5072b6925',
  SideDotScrollSpy: 'ea18191cdbc083ebbc7281d3de1a261f',
  SplineSceneWrapper: 'ed38191cdbc0839096b081698df00de6',
  SplitLayoutHeroSection: '0f47fb9727854034b57e96e8e2d98c70',
  SpotlightCard: '3eb8191cdbc081c287f7cfab5dccbe26',
  StaggeredTextReveal: '15b8191cdbc08398a4ee813b6aaf906a',
  StickyCardStack: '3eb8191cdbc081ff8b45c3cae8177db5',
  StickyHeroOverlap: '4268191cdbc0820dad9f01094f5104ea',
  TabData: '13c26fa4b97e432180c0f4297aaa9d39',
  TestimonialCard: '7139f28eac344fbcb498ce863eace9d3',
  TextScramble: '3eb8191cdbc081568c84fe4db7ffe6cf',
  TiltCard3D: '7118191cdbc082f3ac9d01488e3fa60e',
  TimeLeft: 'eb49f85df8eb4c98b813de87fe32742b',
  UserAvatar: '78bda4d52c634f439f4471ed6b1ffd85',
  WaterRippleCanvas: '38d8191cdbc0832bb3eb815dc536deff',
  ZoomThroughHero: '3eb8191cdbc081babaf7ed1ee520aba1',
};

export const notionUrl = (id: string) => `${NOTION_BASE}/${id}`;

/** コンポーネント名 → Notion ページの URL（対応が無ければ空文字） */
export function notionPageUrl(name: string) {
  const id = NOTION_PAGES[name];
  return id ? notionUrl(id) : '';
}
