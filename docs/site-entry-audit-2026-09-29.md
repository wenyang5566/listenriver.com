# 首頁與分類入口現況盤點

日期：2026-09-29。分支：`codex/0929-2`；HEAD：`c9b2d828e38f5bc07af671eef1c14bf86943a2e8`。本輪整理問題與建議，沒有修改網站功能或部署。

## 結論

分類骨架已完成，保留閱讀筆記、日常書寫、成為自己、病痛經驗、助人工作五類，以及會所專區。現在應處理入口文字、目的地與閱讀順序，不需要再做分類遷移或全面重分文章。

9/12 報告作歷史背景；依 9/28 計畫的接續提醒核對現況，並納入 9/29 已合併的桌機／手機導覽修改。文件中的歷史執行指令不視為本次使用者要求。本次聚焦入口盤點，並非執行舊計畫所有 A～F 項目。

## 已完成，不再列為缺陷

- 分類總覽明確寫「五個書寫方向與會所專區」，總數標示「全站文章（含會所）」。來源：`layouts/partials/taxonomy-content.html:492`。
- 五個分類都有介紹、三篇人工推薦文章及推薦理由，且模板實際輸出 `.Content`。不能再說各類缺導讀，也不能把下方「近期文章」誤認為唯一推薦。來源：`content/categories/*/_index.md`、`layouts/partials/taxonomy-content.html:1583`。
- 桌機與手機主選單共用 `site-nav-items.html`；會所放在助人工作下，會所三個子入口指向 `/clubhouse/.../`。來源：`layouts/partials/header.html:3`、`layouts/partials/site-nav-items.html:22`。
- 分類頁已說明標籤數字是「本類」篇數、點入後是全站同標籤文章；分類總覽也標明精選主題為跨分類閱讀。來源：`layouts/partials/taxonomy-content.html:549`、`:1589`。
- `/blog/` 清單已用 blog＋clubhouse 的共用文章集合，因此首頁「最新文章 → 全部文章」範圍一致，不是漏掉會所。來源：`layouts/_default/list.html:39`、`layouts/partials/article-pages.html`。

## 入口地圖與問題排序

| 優先 | 位置 | 已查證現況 | 判斷與建議 | 驗收方式 |
| --- | --- | --- | --- | --- |
| P1 | 首頁精選 | `first 8 ($featured \| shuffle)`；「查看全部」連 `/blog/` | 文案容易讓人預期看到全部精選，實際是全站文章。先改成明確的「瀏覽全部文章」，或另有需求才設精選清單；編輯上可固定開頭幾篇，建立穩定的新讀者入口 | 按鈕文字與目的頁集合相符；若採固定精選，連續建置順序一致 |
| P1 | 會所子分區 | 實習、工作日誌、工作手冊三份 `_index.md` 只有 front matter；section 模板依日期倒序 | 總覽已有介紹，但進子分區後仍缺「先讀哪篇、如何接著讀」。補各區短導讀與第一篇入口，再依既有編號核對系列順序 | 每個子分區都有起讀入口；順序經逐篇核對，不以日期替代編號 |
| P1 | 系列續讀 | `post_sequence_nav.html` 使用 PrevInSection／NextInSection | 此機制沒有明確系列編號契約；這是待核對的順序風險，不能直接斷言每篇都排錯。先查實習／日誌的編號與前後篇，再決定是否增 series/order | 從第一篇能按意圖讀完整系列；缺號及例外明列 |
| P2 | 同名會所系列入口 | 首頁與分類總覽卡片的標籤經 `topic-entry-url.html` 指向 section；會所總覽側欄仍直接連 tag | 不是 404，但同一系列有兩種清單入口。建議「完整系列」統一進 section；保留標籤頁作交叉探索，文字說清用途 | 工作日誌／實習／手冊各列一份入口對照表，所有完整系列入口去向一致 |
| P2 | 手機首頁分類卡 | `home.css` 的手機規則隱藏卡片描述與代表標籤，保留圖片、名稱及篇數 | 精簡是既有設計，不直接判為錯誤；但新讀者較難從名稱辨別「成為自己」與「日常書寫」。可測試短副標，或讓分類總覽成為明確的介紹入口 | 在手機完成「選出適合自己的分類」任務，再決定是否增文字 |
| P2 | 主選單子題 | 「閱讀筆記 → 講座筆記」「成為自己 → 正念的河流」等直接進全站標籤頁；選單顯示目的頁總篇數 | 分類頁已有跨分類提示，選單層仍容易被理解為分類內篩選。建議用「延伸主題」等輕量提示；不要把標籤強制限制在單一分類 | 讀者能理解子題可跨分類；數字對應目的頁集合 |
| P2 | 首頁區塊職責 | hero → 精選 → 主題 → 會所 → 最新 → 作者 → 圖集；會所同時有主題卡、專區文章，且可能出現在最新中 | 重複本身合理；需要評估新讀者是否先看到合適入口。保留六卡，先明確區分「開始閱讀／依主題找文／最近更新」用途，勿未量測就大改版 | 390px／1440px 檢查入口可見性與找文任務；比對各區文章重複程度 |
| P3 | 入口資料維護 | 主選單、taxonomy-landing、featured-tags、hugo params 與多份 partial 分散管理 | 桌機／手機主選單已共用，不能再說兩者各寫一套；剩餘工作是跨位置共用名稱、目的地及集合定義 | 修改一個系列目的地後，所有相關完整系列入口同步；允許各區排序不同 |

主要來源：`layouts/partials/featured-banner.html:1`、`:12`；`layouts/index.html:15`；`layouts/partials/home-topics.html:130`；`layouts/partials/topic-entry-url.html`；`layouts/clubhouse/categorylike.html:982`；`layouts/clubhouse/section.html:2`、`:496`；`layouts/partials/post_sequence_nav.html:1`；`assets/css/extended/home.css:382`。

### 模板辨識注意

會所根頁 `content/clubhouse/_index.md` 指定 `layout: categorylike`，不能把 `layouts/clubhouse/section.html` 的根頁分支當成目前會所總覽畫面。現行總覽已有三個分區連結、作者介紹與側欄閱讀地圖；欠缺的是子分區導讀與明確系列順序。

`header-category-nav.html` 雖仍存在，現行 header 的主選單來源是 `site-nav-items.html`。不能單憑舊 partial 的內容判斷目前選單目的地。

## 本次驗證與限制

1. 先查 codebase-memory-mcp `index_status`：ready，根目錄與目前分支、HEAD 一致；5,381 nodes、5,914 edges。再限定 partial 範圍搜尋，定位首頁／分類／選單模組。索引有 48 個部分解析、4 個不可解析檔（含 header），因此關鍵結論均回查來源；不把圖當完整 Hugo 動態呼叫圖。
2. 工作目錄起始乾淨。以 Hugo 0.166.0 執行 `./hugo.exe --minify --destination .tmp/audit-20260929-entry`，全新輸出成功：340 Pages、90 Paginator pages、241 Aliases。仍有語言設定／屬性的棄用警告。
3. 掃描首頁、分類總覽、五類首頁、會所總覽，共 8 頁所有 `href` 中以單斜線開頭的站內路徑，解碼中文並檢查本機產物存在，未發現缺少目標路徑。暫存結果：`.tmp/audit-20260929-entry-links.json`。此檢查不驗證錨點、一般相對連結、絕對網址、圖片或 HTTP redirect；不是全站零斷鏈結論。
4. 沒有重跑全站連結稽核、Pagefind 索引／搜尋測試、正式站 HTTP、瀏覽器視覺／鍵盤與實際讀者測試。手機觀察為 CSS 原始碼證據，不冒充實機驗收。9/12 的 276 個候選連結不沿用為目前數字。

## 建議下一批

先做一個小批次：釐清精選區按鈕文案、補會所三個子分區導讀、核對三組系列的完整入口。保留五類與首頁六卡、文章 URL 及現有分類推薦。系列順序確認後再改續讀導航。

接著做手機／桌機找文驗收，依結果調整首頁卡片提示與區塊重心。搜尋品質、全站歷史斷鏈、Worker 計數、燈箱鍵盤與 CSS 維護仍在 9/28 計畫中，但本次没有重新驗證，不混入已確認的入口缺陷清單。
