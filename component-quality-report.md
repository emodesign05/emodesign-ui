# コンポーネント品質監査レポート

対象: `src/components/*.tsx`（28ファイル、`aaa.tsx` は空のため除外）
前提: React 19 / TypeScript 6 / Tailwind v4 / framer-motion 13 / lucide-react 1.47

補足:
- lucide-react 1.x は `aria-label` などがないアイコンに自動で `aria-hidden="true"` を付けます。そのため、装飾目的のアイコンは指摘していません。
- Tailwind v4 の `dark:` は、既定で `prefers-color-scheme` に従います。
- `tsc -b` と `eslint` を実行済みです。実際に出たエラーは【ビルド】と記載しています。
- ダークモード評価: ○ = 両モードで一貫 / △ = 暗色背景に固定、または一部のコントラスト不足 / × = `dark:` 指定なし

## サマリー

| コンポーネント | a11y 重要度 | ダークモード | 主な問題 |
|---|---|---|---|
| AnimatedAccordionList | 中 | ○ | aria-controls/パネルidがない、reduced-motion 未対応、focus リングがない |
| BadgeVariant | 低 | △ | 暗色背景専用の配色（ライト背景では読めない）、live ドットが無限アニメ |
| BentoGrid | 低 | △ | 見出し階層が逆転、クリックできそうな見た目なのに操作できない |
| BreadcrumbItem | 中 | ○ | 【ビルド】ref の型エラー、Escape で閉じない、aria-controls がない |
| CTAButton | 低 | △ | ほぼ良好（reduced-motion 対応済み）。暗色固定のみ |
| CardCarousel | 高 | ○ | 画面外スライドにもフォーカスが入る、矢印キーがない、現在位置が伝わらない |
| CollapsibleSidebar | 高 | ○ | ドロワーが dialog になっていない（Esc・フォーカストラップなし）、アイコンのみのボタンに名前がない、LogOut がボタンでない |
| ECProductCard | 中 | × | `dark:` なし、お気に入りボタンに aria-pressed がない |
| ExpandableFAB | 中 | ○ | Esc で閉じない、ラベルが開閉で固定、amber ボタンのコントラスト不足 |
| FloatingTooltipAndPopover | 高 | △ | ツールチップがホバー専用、トリガーが div の onClick、名前のないボタン |
| GlassmorphismCard | 低 | × | ライト専用、reduced-motion 未対応 |
| InfiniteScrollNewsList | 中 | ○ | 読み込みが止まることがある、リセット時に key が重複、aria-live がない |
| InlineNewsletterSignupBar | 高 | △ | input にラベルがない、エラーが読み上げられない、完了後にフォーカスが失われる |
| InteractivePricingCards | 中 | ○ | トグルに role="switch"/aria-checked がない、補足文字のコントラスト不足 |
| LeadFormData | 中 | ○ | select/textarea にラベルがない、進捗バーのロールがない、ステップ切替でフォーカスが移らない |
| ModalProps | 中 | ○ | aria-labelledby・初期フォーカス・フォーカストラップ・フォーカス返却がない |
| MultiColumnCorporateFooter | 中 | △ | メール input にラベルがない、下部テキストのコントラスト不足 |
| NavLink | 中 | ○ | モバイルメニューの aria-controls/Esc がない、nav に名前がない、`relative sticky` の重複 |
| PaginationProps | 中 | ○ | aria-current がない、nav ランドマークがない、layoutId が全体で共有されている |
| Parallax | 中 | △ | reduced-motion 未対応、背景画像に意味のある alt が付いている、見えないボタンにフォーカスが入る |
| Point3D | 中 | △ | 【lint】prefer-const、無限 rAF が reduced-motion 未対応、canvas が DPR 非対応 |
| SVGWaveSlanted | 低 | × | ディバイダー上部に灰色の帯が出る（表示バグ）、`preserve-3d` は v4 に存在しない |
| ShimmerSkeletonNewsCard | 低 | ○ | 【ビルド】React の未使用 import、スケルトンに読み込み中の通知がない |
| SplitLayoutHeroSection | 低 | △ | 無限浮遊アニメ、ダーク時のグラデ文字のコントラスト不足、10px の slate-400 |
| TabData | 高 | ○ | tablist/tab/tabpanel ロールと矢印キー操作が全くない |
| TestimonialCard | 低 | ○ | 見出しが h2→h4 に飛ぶ、alt が名前と重複、星評価に説明がない |
| TimeLeft | 中 | ○ | タイマーの意味が伝わらない、`animate-bounce` 等が reduced-motion 未対応 |
| UserAvatar | 中 | × | ステータスが色だけで伝わる、src を変えても hasError がリセットされない、ライト専用 |

## AnimatedAccordionList
**問題**
- L50-54: `aria-expanded` はあるが `aria-controls` がなく、パネル（L73）に `id`/`role="region"` がない
- L61-83: `useReducedMotion` に対応していない
- L17: 誤字「クレジッ表示」

**修正案**
- `` const panelId = `faq-panel-${item.id}` ``。ボタンに `` id={`faq-btn-${item.id}`} aria-controls={panelId} `` を付け、パネルに `` id={panelId} role="region" aria-labelledby={`faq-btn-${item.id}`} `` を付ける
- `const reduce = useReducedMotion()` → `transition={{ duration: reduce ? 0 : 0.3 }}`
- L17 を「クレジット表示」に修正

## BadgeVariant
**問題**
- L16-56: テキストが `text-*-400`/`text-purple-300` の固定値。ライト背景に置くとコントラスト約 2:1 で読めない（再利用する前提なら問題）
- L70: 操作できないバッジに `whileHover` scale がかかっている（クリックできそうに見える）

**修正案**
- 各 variant を `text-emerald-700 dark:text-emerald-400` のように light/dark 両方で指定する（border/bg も同様）
- `whileHover` を削除する

## BentoGrid
**問題**
- L13-18: `h2` が小さなラベル、`p` が本当の見出しになっていて、見出しの意味と見た目が逆
- L24-103: `ArrowUpRight` とホバーで浮く演出があり、リンクのように見えるが、フォーカスもクリックもできない
- 全体が `bg-slate-950` 固定で `dark:` がない（暗色専用デザイン）

**修正案**
- L13 を `<p>`、L16 を `<h2>` に入れ替える
- リンクにするなら `motion.a href=... className="... focus-visible:ring-2"`、飾りにするなら ArrowUpRight とホバー演出を外す
- ライトでも使うなら `bg-white dark:bg-slate-900/80`、`text-slate-900 dark:text-white` を追加する

## BreadcrumbItem
**問題**
- 【ビルド】L24/L63: `useRef<HTMLDivElement>` を `<li ref>` に渡しているため TS2322 エラー
- L64-71: `aria-controls` がない。L76 のポップオーバーに `id` がない。Escape で閉じない。閉じたときにフォーカスがトリガーに戻らない

**修正案**
- `useRef<HTMLLIElement>(null)`
- ボタンに `aria-controls="breadcrumb-menu"`、ポップオーバーに `id="breadcrumb-menu"` を付ける。useEffect に `keydown` を追加し、`Escape` で `setIsDropdownOpen(false); buttonRef.current?.focus()` を実行する

## CTAButton
**問題**
- 大きな a11y 問題はない（`useReducedMotion`、`focus-visible`、`aria-hidden` まで対応済み）
- L77: `bg-slate-950` 固定で、ライトテーマに置くと浮く

**修正案**
- `bg-slate-50 dark:bg-slate-950` として、カード本体のグラデーションだけ固定にする

## CardCarousel
**問題**
- L91-133: 画面外のスライドの「詳細を見る」ボタン（L126）にも Tab でフォーカスが入る
- カルーセル全体に `role="region" aria-roledescription="carousel"` とラベルがなく、スライドに「n / 4」の情報もない。切替も読み上げられない
- 左右キーで操作できない。ドット（L143）に `aria-current` がない
- L82-89: `drag="x"` と `animate` の translateX（x のエイリアス）が同じ値を取り合う。閾値未満のドラッグで位置が戻らない可能性がある（要動作確認）

**修正案**
- 各スライドのラッパーに `inert={index !== currentIndex}` `aria-hidden={index !== currentIndex}` を付ける（React 19 は `inert` を boolean で渡せる）
- 外枠に `role="region" aria-roledescription="carousel" aria-label="おすすめ商品"`、スライドに `` role="group" aria-roledescription="slide" aria-label={`${i+1} / ${len}`} `` を付ける。`<p className="sr-only" aria-live="polite">` で現在位置を通知する
- 外枠に `tabIndex={0} onKeyDown={e => e.key==='ArrowLeft' ? handlePrev() : e.key==='ArrowRight' && handleNext()}` を付ける。ドットに `aria-current={index===currentIndex ? 'true' : undefined}` を付ける
- ドラッグは内側の要素に `dragSnapToOrigin` を付け、外側の translate アニメーションと分ける

## CollapsibleSidebar
**問題**
- L197-253: モバイルドロワーに `role="dialog"`/`aria-modal`/ラベルがない。Escape で閉じない。フォーカストラップも閉じたときのフォーカス返却もない
- L217: 閉じるボタン（X のみ）に `aria-label` がない
- L274-279: 折りたたみボタンに `aria-label`/`aria-expanded` がない
- L287-311: 折りたたみ時はラベルが `title` だけなので、スクリーンリーダーでは名前がない。L308 の未読ドットも伝わらない
- L227/L287: アクティブ項目に `aria-current="page"` がない。nav（L222/L282）に `aria-label` がない
- L331: `LogOut` が SVG に `cursor-pointer` を付けただけで、キーボードでもスクリーンリーダーでも操作できない
- L121/L327: `text-slate-400` と白背景のコントラストが 2.6:1 で不足
- L337-340: framer の `paddingLeft` アニメーションと Tailwind の `transition-all` が二重にかかっている

**修正案**
- L205 の aside に `role="dialog" aria-modal="true" aria-label="メインメニュー"` を付ける。`useEffect` で Esc キーを監視し、開いたら先頭ボタンへ、閉じたらメニューボタンへフォーカスを移す（`focus-trap-react` などの利用も可）
- L217 に `aria-label="メニューを閉じる"`
- L274 に `aria-label={isCollapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'} aria-expanded={!isCollapsed}`
- L287 に `aria-label={item.label}`、L308 のドット内に `<span className="sr-only">未読あり</span>`
- `aria-current={isActive ? 'page' : undefined}`、`<nav aria-label="メイン">`
- L331 を `<button aria-label="ログアウト" className="... focus-visible:ring-2"><LogOut/></button>` にする
- `text-slate-500 dark:text-slate-400`。L340 の `transition-all` を削除する

## ECProductCard
**問題**
- `dark:` の指定がない（L35 `bg-white`、L80 `text-slate-800`、L89 `text-slate-900`、L100 `bg-slate-900` など）
- L58-68: トグルなのに `aria-pressed` がなく、ラベルも固定の「追加」
- L75/L93: `text-slate-400` のコントラスト不足。L93 の打ち消し線価格は読み上げで意味が伝わらない
- L92: `originalPrice && ...` は 0 のとき「0」を描画してしまう

**修正案**
- `bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800`、`text-slate-800 dark:text-slate-100`、`bg-slate-900 dark:bg-indigo-600` などを追加する
- `aria-pressed={isLiked} aria-label={isLiked ? 'お気に入りから削除' : 'お気に入りに追加'}`
- `text-slate-500 dark:text-slate-400`。L93 に `<span className="sr-only">通常価格</span>` を補う
- `originalPrice != null && originalPrice > price && (...)`

## ExpandableFAB
**問題**
- L108-113: `aria-label` が開いていても「開く」のまま。`aria-controls` がない。Escape で閉じない
- L69: サブメニューのコンテナに `id`/`role` がない
- L41: `bg-amber-500` と白アイコンのコントラストが 2.15:1 で、非テキストに求められる 3:1 に届かない

**修正案**
- `aria-label={isOpen ? 'アクションメニューを閉じる' : 'アクションメニューを開く'} aria-controls="fab-actions"`。L69 に `id="fab-actions" role="group" aria-label="クイックアクション"`
- `useEffect` で Esc キーを監視し、閉じたらトリガーにフォーカスを戻す
- `bg-amber-600 hover:bg-amber-700`（3.2:1）

## FloatingTooltipAndPopover
**問題**
- L15-19: ツールチップがマウス専用。`onFocus`/`onBlur` も `role="tooltip"`/`aria-describedby` もなく、Escape でも閉じない
- L133-135: 設定ボタンがアイコンのみで名前がない（ツールチップはスクリーンリーダーに届かない）
- L51: トリガーが `<div onClick>` のラッパーで、子ボタンに `aria-expanded`/`aria-haspopup`/`aria-controls` を付けられない
- L56-59: 透明なバックドロップで閉じるだけ。Escape で閉じず、フォーカスも移動・返却されない。ポップオーバーに `role="dialog"` とラベルがない
- L72-77: 閉じるボタン（X のみ）に `aria-label` がない。`dark:hover:text-*` もない
- L84-90: ON/OFF を表示しているのにトグルになっていない。L89 の `text-indigo-600` はダークの slate-800 上で約 2.3:1

**修正案**
- Tooltip に `onFocus`/`onBlur` を追加し、`useId()` で作った id を `role="tooltip" id={id}` に付け、子を `cloneElement(children, { 'aria-describedby': id })` にする
- L133 に `aria-label="詳細な設定"`。L72 に `aria-label="閉じる"`
- Popover は `trigger` を render prop にして `<button aria-expanded={isOpen} aria-haspopup="dialog" aria-controls={id}>` を直接描画する
- 本体に `role="dialog" aria-labelledby={titleId}`。Esc で閉じてトリガーへフォーカスを戻す
- L84 に `role="switch" aria-checked={on}`、L89 に `dark:text-indigo-400`

## GlassmorphismCard
**問題**
- ライトモード専用の設計（L10 `bg-slate-50`、L23 `bg-white/50`、L43 `text-slate-800`）で `dark:` がない

**修正案**
- ダーク版として `dark:bg-slate-900/40 dark:border-white/10 dark:text-slate-100` などを追加するか、「Light 専用」とドキュメントに明記する

## InfiniteScrollNewsList
**問題**
- L126-147: IntersectionObserver は「交差状態が変わったとき」にしか発火しない。読み込み後もローダーが見えたままだと（縦長の画面など）追加の読み込みが止まる。TestimonialCard のような補填処理がない
- L150-158: 読み込み中にリセットすると、前回の `setTimeout`（L94）が後から実行され、同じ id が追加されて key が重複し、ページ番号もずれる。アンマウント時もタイマーを止めていない
- L183/L190: `aria-live`/`aria-busy` がなく、追加の読み込みや完了が伝わらない。スケルトンに読み込み中の通知がない
- L36/L199: `text-slate-400` のコントラスト不足（2.6:1）

**修正案**
- `timerRef = useRef<number>()` で `clearTimeout` し、リセットと unmount で必ず止める
- 読み込み完了後に `if (loaderRef.current && loaderRef.current.getBoundingClientRect().top < innerHeight) loadMoreItems()` を実行する。または `isLoading` を依存にして observer を張り直す
- リストに `role="feed" aria-busy={isLoading}`、ステータスに `<p role="status" className="sr-only">` を置く。スケルトンは `aria-hidden="true"`
- `text-slate-500 dark:text-slate-400`

## InlineNewsletterSignupBar
**問題**
- L70-77: input にラベルがない（placeholder だけ）
- L100-102: エラーに `role="alert"` がない。input にも `aria-invalid`/`aria-describedby` がない
- L37-131: 送信に成功するとフォームごと消えてフォーカスが body に落ち、完了も読み上げられない
- L71: `type="email"` に `noValidate` がないため、「abc」などではブラウザ標準の検証が先に出て、独自のメッセージと二重になる
- `bg-slate-900` 固定の暗色専用で、`dark:` がない

**修正案**
- `<label htmlFor="newsletter-email" className="sr-only">メールアドレス</label>`、input に `id="newsletter-email"`
- `aria-invalid={!!errorMessage} aria-describedby={errorMessage ? 'newsletter-error' : undefined}`、エラーに `id="newsletter-error" role="alert"`
- 完了見出し（L117）に `tabIndex={-1}` と ref を付け、表示後に `focus()`。または外側に `aria-live="polite"`
- `<form noValidate>`

## InteractivePricingCards
**問題**
- L89-99: トグルに `role="switch"`/`aria-checked` がなく、ラベルも状態を表していない。両脇の「月払い/年払い」（L80/L102）をクリックしても切り替わらない
- L153-164: 価格の変化が読み上げられない
- L165: `text-slate-400` と白背景のコントラスト不足
- L111: 「20% OFF」と表示しているが、実際の割引率は Enterprise が 23%（12800→9800）で表示と合わない

**修正案**
- `<button role="switch" aria-checked={isYearly} aria-label="年払いに切り替え">`。ラベル span を `<button onClick={() => setIsYearly(false)}>` にする
- 価格の親に `aria-live="polite"`。`text-slate-500 dark:text-slate-400`

## LeadFormData
**問題**
- L205-215: select に `id`/ラベルがない
- L238-245: textarea にラベルがない（placeholder だけ）
- L91-98: 進捗バーに `role="progressbar"`/`aria-valuenow` がない。L82 の「STEP n / 3」も切り替わったことが伝わらない
- L104-248: ステップを切り替えても、フォーカスが消えたボタンに残ったまま
- L130 など: `outline-none` と ring 2px/20% の組み合わせで、フォーカスが見えにくい

**修正案**
- select に `id="timeline" aria-label="導入検討時期"`、textarea に `aria-label="ご相談内容"`（または sr-only の label）
- `<div role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step} aria-label="入力の進捗">`
- 各ステップの h3 に `tabIndex={-1}` と ref を付け、`useEffect(() => headingRef.current?.focus(), [step])`
- `focus:ring-indigo-600/40` 以上に濃くする

## ModalProps
**問題**
- L58-66: `role="dialog"`/`aria-modal` はあるが `aria-labelledby` がない（L103 の h3 に id がない）
- 開いたときのフォーカス移動、Tab のトラップ、閉じたときのトリガーへのフォーカス返却がない
- L24/L29: `overflow = 'unset'` で、元の値を上書きしてしまう
- L36-39: `setTimeout` を止めていないため、先に閉じても 1.2 秒後に `onClose` が再び呼ばれる
- L94-101: 星 5 つに「5 段階中 4.9」の情報がない。L100/L111 の `text-slate-400` はコントラスト不足。L193 の `bg-slate-100` に `dark:` がない

**修正案**
- h3 に `id="modal-title"`、ダイアログに `aria-labelledby="modal-title"`
- 開いたら閉じるボタンに `focus()`。トリガーは `useRef` で保持し、閉じたら `focus()` で戻す。Tab/Shift+Tab を先頭と末尾で循環させる（または `<dialog>` 要素と `showModal()` を使う）
- `const prev = document.body.style.overflow; ... return () => { document.body.style.overflow = prev }`
- timerRef を用意し、cleanup と close で `clearTimeout`
- 星の親に `role="img" aria-label="5段階中4.9の評価"`。L193 は `dark:bg-slate-800`

## MultiColumnCorporateFooter
**問題**
- L114-121: input にラベルがない。L131-139: 登録完了メッセージが読み上げられない
- L149/L156: `text-slate-500` と `bg-slate-950` のコントラストが約 3.9:1 で、12px の文字では不足
- L149-153: 「Crafted with ♥」のハートは自動で aria-hidden になるため、読み上げでは文が欠ける
- 暗色固定で `dark:` がない（フッターとしては許容範囲）

**修正案**
- `<label htmlFor="footer-email" className="sr-only">メールアドレス</label>`。完了表示を `<p role="status">` にする
- `text-slate-400`
- ハートを `<Heart aria-label="love" role="img" />` にするか、`<span className="sr-only">love</span>` を補う

## NavLink
**問題**
- L25: `relative sticky` で position が重複している（`sticky` だけで absolute の子の基準になる）
- L39: `<nav>` に `aria-label` がない。L76 のモバイルメニューが `<nav>` でない
- L63-70: ラベルが「開く」のまま。`aria-controls` がなく、Escape で閉じない
- L41: 現在のページに `aria-current` がない

**修正案**
- `relative` を削除する
- `<nav aria-label="グローバル">`。モバイルメニューを `<motion.nav id="mobile-menu" aria-label="モバイルメニュー">` にする
- `aria-label={isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'} aria-controls="mobile-menu"`。Esc で閉じてボタンにフォーカスを戻す
- `aria-current={isCurrent ? 'page' : undefined}`

## PaginationProps
**問題**
- L54: `<nav aria-label>` で包まれていない
- L92-110: 現在のページに `aria-current="page"` がなく、番号ボタンに「ページ n」の名前もない
- L80-86: 「•••」がそのまま読み上げられる
- L104: `layoutId="activePagination"` がグローバル。同じページに 2 つ置くとアニメーションが混ざる
- L186: 状態テキストが `text-slate-400`（コントラスト不足）で、`aria-live` もない

**修正案**
- `<nav aria-label="ページネーション">` で包む
- `` aria-current={isCurrent ? 'page' : undefined} aria-label={`${page}ページ目`} ``
- dots を `aria-hidden="true"` にする。`<LayoutGroup id={useId()}>` で包む
- `role="status"` と `text-slate-500 dark:text-slate-400`

## Parallax
**問題**
- L24-40: パララックスと、スクロールに連動する opacity/scale が reduced-motion 未対応
- L55: 装飾の背景画像に `alt="Parallax Background"` が付いている
- L67-94: スクロール位置によっては opacity 0 の不可視ボタン（L89）にフォーカスが入る
- L98: `animate-bounce` が reduced-motion 未対応。L97 の `text-slate-500`（on slate-950）はコントラスト 3.9:1

**修正案**
- `const reduce = useReducedMotion()`。reduce のときは `style={reduce ? undefined : { y: yBg }}` とし、テキストは opacity 1 に固定する
- `alt=""`
- `motion-safe:animate-bounce`、`text-slate-400`

## Point3D
**問題**
- 【lint】L91/L95: `let x`/`let y` は再代入がないため `prefer-const` エラー
- L71-140: rAF の無限ループが reduced-motion 未対応。画面外でも回り続ける
- L28-31: `devicePixelRatio` を考慮していないため Retina でぼやける。親要素のリサイズ（ウィンドウ以外）も検知しない
- L152-155: 装飾用の canvas に `aria-hidden` がない
- L175: コンポーネント内に `h1` があり、App の `h2`（L227）より後に来るため見出し順が逆転している

**修正案**
- `const x`/`const y` にする。`<canvas aria-hidden="true">`
- `matchMedia('(prefers-reduced-motion: reduce)').matches` なら 1 フレームだけ描画して終了する。IntersectionObserver で画面外なら `cancelAnimationFrame`
- `canvas.width = w * dpr; ctx.setTransform(dpr,0,0,dpr,0,0)`。`ResizeObserver(canvas.parentElement)` でサイズ変更を検知する
- デモの見出しを `p` にするか、コンポーネント側を `h2` にする

## SVGWaveSlanted
**問題**
- L95: ディバイダーがヒーロー（グラデーション）の外にあり、SVG の透明部分から親の `bg-slate-100`（L61）が見える。その結果、上のセクションとの間に灰色の帯が出る（「濃い色から白へつなぐ」が成立していない）
- L41: `preserve-3d` は Tailwind v4 のクラスではない（`transform-3d` が正しい）ため効いていない。不要
- L36-49: 装飾用の SVG に `aria-hidden`/`focusable="false"` がない
- L79-89: 選択中のボタンに `aria-pressed` がない

**修正案**
- ディバイダーのラッパーに上のセクションと同じ背景を付ける（例: `className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600"`）。または divider を `<section>` の最下部に入れる
- `preserve-3d` を削除する。`aria-pressed={activeType === type}`
- `<motion.svg aria-hidden="true" focusable="false">`
- `fillColor="text-white dark:text-slate-900"` と、下のセクションに `dark:bg-slate-900` を指定する

## ShimmerSkeletonNewsCard
**問題**
- 【ビルド】L1: `import React` が未使用で、`noUnusedLocals` により TS6133 エラー（`tsc -b` が失敗する）
- L28-69: スケルトンに `aria-hidden` がなく、「読み込み中」も通知されない
- L150-159: トグルボタンに `aria-pressed` がない

**修正案**
- `import { useState } from 'react'`
- スケルトンの外側に `role="status" aria-label="記事を読み込み中"`、中身は `aria-hidden="true"`

## SplitLayoutHeroSection
**問題**
- L33: グラデーション文字 `from-indigo-600 via-purple-600 to-rose-600` は、ダーク（slate-900）上で約 2.8:1
- L99/L119/L127: `text-slate-400`（10〜12px）は白背景でコントラスト 2.6:1

**修正案**
- `dark:from-indigo-400 dark:via-purple-400 dark:to-rose-400`
- `text-slate-500 dark:text-slate-400`。`text-[10px]` は `text-xs` にする

## TabData
**問題**
- L95-124: `role="tablist"`/`role="tab"`/`aria-selected`/`aria-controls` がない
- L127-139: パネルに `role="tabpanel"`/`aria-labelledby`/`tabIndex={0}` がない
- 左右キー・Home・End で操作できず、roving tabindex もない
- L116: `layoutId="activeTabUnderline"` がグローバル
- L21/L36/L74: パネル内が `h4` から始まり、ページの h2 から見出しレベルが飛ぶ

**修正案**
- 親に `role="tablist" aria-label="商品情報"`。各ボタンに `` role="tab" id={`tab-${id}`} aria-selected={isActive} aria-controls={`panel-${id}`} tabIndex={isActive ? 0 : -1} ``
- パネルに `` role="tabpanel" id={`panel-${activeTab.id}`} aria-labelledby={`tab-${activeTab.id}`} tabIndex={0} ``
- `onKeyDown` で ArrowLeft/Right/Home/End を処理し、次のタブを `setActiveTabId` にしてから `focus()`
- `<LayoutGroup id={useId()}>`、h4 → h3、`<div role="img" aria-label="5段階中4.9">`

## TestimonialCard
**問題**
- L73: `h4` で、ページの h2（L176）から見出しレベルが飛ぶ
- L67-71: `alt={item.name}` が直後の名前と重複して 2 回読まれる
- L51-55: 星評価に「5段階中5」の情報がない
- L197-210: 読み込み状態に `role="status"` がない。L206 の `text-slate-400` はコントラスト不足

**修正案**
- `h4` → `h3`。`alt=""`
- 星の親に `` role="img" aria-label={`5段階中${item.rating}`} ``
- ローダーの領域を `role="status" aria-live="polite"` にし、`text-slate-500 dark:text-slate-400`

## TimeLeft
**問題**
- L112-130: `role="timer"` もラベルもなく、何の残り時間か伝わらない（毎秒の読み上げは不要だが、意味は伝えるべき）
- L116/L118/L120: 区切りの「:」が読み上げられる（修正: `aria-hidden="true"`）
- L97: `animate-bounce`、L23-28: 数字のめくりアニメが reduced-motion 未対応
- L54: 初期値が全部 0 のため、初回描画で「00:00:00:00」が一瞬表示される

**修正案**
- `` <div role="timer" aria-live="off" aria-label={`セール終了まで残り${d}日${h}時間${m}分`}> `` として、中の数字は `aria-hidden`
- `motion-safe:animate-bounce`。`useReducedMotion()` のときは `initial={false}`
- `useState(() => calc(targetDate))` で初期値を計算する

## UserAvatar
**問題**
- L80-86: ステータスが色だけで伝わる（WCAG 1.4.1 違反）
- L44/L64-68: `hasError` が `src` の変更でリセットされず、一度失敗すると別の画像を表示できない
- L71-75: フォールバック（イニシャル・アイコン）にアクセシブルな名前がない
- `dark:` がない（L62 `bg-slate-100`/`border-white`、L83 `border-white`）。L115/L125/L136 の `text-slate-400` はコントラスト不足

**修正案**
- ドットに `role="img" aria-label={statusLabel[status]}`（例: `{online:'オンライン',...}`）を付けるか、`<span className="sr-only">`
- `useEffect(() => setHasError(false), [src])`。または親で `<UserAvatarLight key={src} />`
- フォールバックのラッパーに `role="img" aria-label={alt}`
- `dark:bg-slate-800 dark:border-slate-900 dark:text-slate-200`、ドットに `dark:border-slate-900`

## 共通の改善提案

1. **reduced-motion を一括で対応する**（25/28 ファイルが未対応）。アプリ全体を `<MotionConfig reducedMotion="user">` で包めば、framer-motion の transform/layout アニメーションはまとめて止まる。`repeat: Infinity`、`animate-bounce`/`animate-spin`/`animate-ping`、canvas の rAF は個別に `useReducedMotion()` か `motion-safe:` で止める。
2. **フォーカスリングを共通化する**。`focus-visible:` の指定は CTAButton 以外にほぼない。index.css に `@layer base { :where(button,a,[tabindex]):focus-visible { @apply outline-2 outline-offset-2 outline-indigo-500; } }` を 1 つ置けば全体が改善する（各ファイルでの個別の指摘は省略）。
3. **開閉 UI の定型パターン**（Breadcrumb / FAB / NavLink / Popover / Sidebar / Modal）。`aria-expanded`・`aria-controls`・開閉で変わる `aria-label`・Esc で閉じる・閉じたらトリガーへフォーカスを戻す、をセットにする。これを `useDisclosure()` フックに切り出すと実装が揃う。モーダル・ドロワーはネイティブの `<dialog>` と `showModal()` にすると、フォーカストラップと Esc が標準で手に入る。
4. **ライト背景の本文に `text-slate-400` を使わない**。白背景では 2.6:1 で AA に届かない（12 ファイル）。`text-slate-500 dark:text-slate-400` を標準にし、暗色背景では `text-slate-400` 以上を使う。
5. **ダークモードの方針を揃える**。暗色固定（Badge / Bento / CTA / Newsletter / Footer / Parallax / Point3D）とライト専用（ECProductCard / Glassmorphism / SVGWave / UserAvatar）が混在している。配布するなら `bg-white dark:bg-slate-900` のように対で指定するか、「Light/Dark 専用」を名前や説明に明記する。
6. **フォームの input にラベルを付ける**。placeholder だけの input が 4 箇所ある（Newsletter L70、Footer L114、LeadForm L205/L238）。`sr-only` の `<label>` と `aria-invalid`/`aria-describedby`/`role="alert"` をセットにする。
7. **`setTimeout` を後片付けする**。Newsletter / LeadForm / Modal / Footer / InfiniteScroll / Testimonial は、unmount 時やリセット時にタイマーを止めていない。`useRef` で ID を保持し、cleanup で `clearTimeout` する。
8. **`layoutId` をスコープ化する**。Pagination・TabData は、複数置くとアニメーションが別のインスタンスへ飛ぶ。`<LayoutGroup id={useId()}>` で包む。
9. **星評価に情報を持たせる**。lucide の星は自動で aria-hidden になるため、CardCarousel / Modal / TabData / Testimonial では評価が読み上げられない。親に `role="img" aria-label="5段階中4.9"` を付けるパターンに統一する。
10. **ビルドを通す**。`tsc -b` のエラー 2 件（BreadcrumbItem L63、ShimmerSkeleton L1）と eslint のエラー 2 件（Point3D L91/L95）は、どれも 1 行で直る。
