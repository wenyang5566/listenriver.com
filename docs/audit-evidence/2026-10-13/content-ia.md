# 全站評估證據：內容、資訊架構、搜尋與品牌敘事

日期：2026-10-13。這是全站 Awwwards／FWA 目標評估的內容子報告，未修改網站來源或發布。

## 方法與界線

- 先讀接續計畫、文章閱讀交接與 CONTRIBUTING。主代理確認目前分支 `20261013-1`、HEAD `13a21cac`，關係圖索引 ready，54 檔 partial、4 檔 unusable；本子任務以精簡 `search_graph` 定位 search、series-context、post-series-nav、site-nav-items，再直接讀來源確認。Hugo 動態模板關係不能只靠圖判定。
- 全站數量取技術代理的乾淨 Hugo 0.160.1 建置、Pagefind 1.5.2 產物；逐筆核對 index.json 及文章的 Pagefind metadata。這是 metadata 全量盤點、模板閱讀與代表內容抽查，不是逐字審讀 226 篇文章。
- 本機 Pagefind API 查 16 組詞，每組取完全部 results.data；另以 UI 重現 3 組重大案例。正式站使用 CUA IAB 的可見 UI 重現同 3 組。Shell headless 讀正式站遭環境 `ERR_NETWORK_ACCESS_DENIED`，並未將此限制算作網站故障。
- 原始結果與重製腳本位於 Git 忽略目錄 `.tmp/awards-audit-20261013/content-ia-results.json`、`content-ia-live-results.json`、`content-ia-probe.mjs`、`content-ia-live-probe.mjs`。本報告保存可持續閱讀的關鍵結果；`.tmp` 不列入來源提交。
- 下文「觀察」為來源／產物／UI 直接證據；「判斷」為設計與產品推論；「建議」需後續實作與讀者驗收，並非已驗證可得獎的保證。

## 全量盤點

| 指標 | 本次觀察 | 解讀 |
| --- | --- | --- |
| 已建置文章 | 226：blog 196、clubhouse 30 | Pagefind 共 227 頁，另 1 頁為關於；不能把 Hugo 的 340 Pages 當文章數。共用集合來源：`layouts/partials/article-pages.html:1-2`。 |
| 五類 | 閱讀筆記 91、助人工作 56、成為自己 27、病痛經驗 27、日常書寫 26 | 合計 227 是因〈課堂報告小結〉同屬病痛經驗／助人工作，並非總數錯誤；不應為數量平均而重分。 |
| 標籤 | 41 個，7 個只有 1 篇 | 標籤可作細粒度探索；單篇標籤不自動等於內容錯誤。電影心得 32／電影 30 的重疊角色、Shamless 的英文拼字需內容維護時核對，不宜直接全站合併。 |
| 有編號標示的系列 | 工作日誌 19、實習紀錄 7、工作手冊 4、素描 13 | 前三組已有數字排序續讀；工作手冊公開篇號為 01、02、04、05，03 為草稿，不能以缺號要求發布。素描 13 篇有 seriesLabel，但目前未進入相同續讀機制。 |
| 文章 description | 來源 226 篇中 12 篇沒有手寫 description，建置皆有 fallback description | 這是編輯品質機會，不是「SEO 描述全站缺失」。fallback：`layouts/partials/head.html:29-31`。 |

已完成項目需保留：首頁精選不再 shuffle；固定 lead 加最新 featured（`layouts/partials/river-featured-pool.html:1-6`、`data/river-home.yaml:1-5`）。五類均已採 editorial archive（`layouts/partials/taxonomy-content.html:6`、`:1571`）；文章有 skip link（`layouts/_default/baseof.html:25`）；會所已有 series-context 依明確數字排序並提供目錄／上下一篇（`layouts/partials/series-context.html:4-33`、`layouts/partials/post-series-nav.html:2-13`）。不再將這些列為待修的舊缺口。

## 發現與建議

### C1 — P0：標題與系列檢索存在實際召回斷點

**觀察：** 以下三組本機乾淨索引與正式站 UI 同樣失敗。正式站驗證於 2026-10-13；工作手冊案例已按「載入更多」查看全部 9 筆。

| 查詢 | 已存在且預期應可找的內容 | 本機／正式 UI 實際結果 |
| --- | --- | --- |
| 肯認每一種聲音的存在 | 首頁主精選〈開放式對話：肯認每一種聲音的存在〉 | 0，顯示「找不到相關內容」。 |
| 工作手冊 05 | 〈工作手冊 05｜沉住氣的重要〉 | 9，包含實習紀錄、疼痛計畫與書摘，目標文章不在全部結果。上方完整「工作手冊（4 篇）」快捷目錄正常出現。 |
| 聆聽疼痛計畫 | 12 篇標題都包含該字串 | 4：成果發表、近況分享、撿拾疼痛的碎片、貝西氏症。另 8 篇未召回，也沒有此專案的完整入口。 |

本機擴充案例：`工作日誌` 回傳 40 篇但僅召回標題 19 篇中的部分，前三筆為實習紀錄；`工作日誌 01` 首筆正確，`工作日誌 1` 回傳 38 筆且目標未召回；`會所實習` 全文只有 1 筆。相對地 `正念的意義就在手中`、`最大的自由是承擔`、`媽的多重宇宙`、`EEAAO`、`強迫症` 都能找到預期內容。這是具體案例集，不代表全站搜尋都失效。

來源：主精選選取 `data/river-home.yaml:2-5`；真實標題 `content/blog/開放式對話/肯認每一種聲音的存在/index.md:2`；標題／tags／series metadata 及 header ignore `layouts/_default/single.html:5-10`、`:33-43`；三個會所快捷入口的範圍 `data/taxonomy-landing.yaml:98-102`、`layouts/_default/search.html:20-24`、`:83-94`。

**判斷：** 能看見首頁選題卻無法用標題找回，是得獎目標之前就應先修好的基本閱讀體驗。會所快捷入口能避開部分漏找，但無法替代全文結果的準確性。索引頁數正確與既有「英雄」測試通過不足以驗收搜尋品質。

**建議／驗收：** 先固定 20–30 組精確標題、專案名、數字補零／不補零、舊稱與零結果案例。最低標準為已知完整標題 100% 可召回、目標 top 3；完整專案集合可全部到達；命中數與快捷目錄的關係可理解。先診斷 body／metadata 的實際索引與中文字詞解析，再選 title 可搜尋索引、明確系列查詢處理、別名或 ranking 調整；本輪未把 `zh-tw` stemming 提示定為根因。Pagefind 官方目前說明 metadata 可以搜尋，ignore 預設排除 index 但保留 metadata，因此不能只看 header 的 ignore 就斷言原因：[索引規則](https://pagefind.app/docs/indexing/)、[Metadata](https://pagefind.app/docs/metadata/)。

### C2 — P1：作者差異化成立，但品牌主張仍未變成閱讀路線

**觀察：** 作者 bio 明確連結社工所、蟹足腫病痛經驗論文與會所工作（`data/author.yaml:1-4`）。關於頁談自我病痛、工作與「聆聽是一條河流」（`content/about/index.md:10-25`）；首頁也展示作者、肖像与理念（`layouts/partials/river-home.html:56-72`）。五類各有第一人稱導讀與手選三篇，不缺導讀內容，例如 `content/categories/病痛經驗/_index.md:12-20`、`content/categories/助人工作/_index.md:12-20`。

**觀察：** 五類手選三篇藏於預設收合的「閱讀這個分類的介紹」（`layouts/partials/taxonomy-content.html:1595-1600`）；初始主體仍是依日期展開的文章。首頁 lead 是人工選題，其餘精選按 featured 日期入池（`layouts/partials/river-featured-pool.html:1-6`）；`data/river-home.yaml:6-14` 的兩篇 selected 並未由現行 `river-home.html` 迴圈輸出。首頁與關於頁都長述同一河流理念，但關於頁沒有「從這裡開始」的閱讀下一步（`layouts/about/single.html:18-25`、`content/about/index.md:10-25`）。

**判斷：** 內容的競爭力不是一般心理／閱讀部落格，而是「身體經驗、研究、助人現場與書寫」由同一個人連起來。現況能證明作者，但新讀者仍需自己跨分類拼出這個觀點；editorial 視覺成立，editorial 選題與閱讀路徑尚未充分顯現。

**建議／驗收：** 保留五類＋會所專區與既有 URL，新增一個人工策展層，不重分全站文章。先做三條各 3–5 篇的明確路線：從「說出自己的疼痛」進入他人病痛的聆聽；從「信任自己的體驗」進入關係與正念；從「閱讀助人理論」進入會所的具體共同行動。每條有導讀、選文原因、順序與下一篇。分類現有三篇推薦可直接作內容起點；將「從哪篇開始」移到首屏可見區，長篇自述仍可收合。用 3–5 位新讀者驗收：60 秒內能說出本站特殊觀點並選到第一篇，讀完一篇後能找到同一路線的下一篇；數字為後續產品驗收建議，非本輪實測。

### C3 — P1：強內容專案仍以一般標籤承載

**觀察：** 聆聽疼痛計畫已有 12 篇、素描已有 13 篇；tag 說明仍是泛用「整理站內與…相關…」一句（`content/tags/聆聽疼痛計畫/_index.md:2-4`、`content/tags/素描/_index.md:2-4`）。series-context 只處理 clubhouse 的數字標示（`layouts/partials/series-context.html:3-9`）；素描文章明確有 seriesLabel（`content/blog/素描/01盲畫/index.md:2-4`、`content/blog/素描/13實在感/index.md:2-4`）。標籤預設按日期排序／分頁（`layouts/partials/taxonomy-content.html:4`、`:2031-2035`）；聆聽疼痛計畫也未加入搜尋快捷目錄。

**判斷：** 這兩组是最適合承載本站獨特互動或數位敘事的內容，卻仍共享通用 tag 展示。廣義「接著讀」按同標籤、同類及日期選文章（`layouts/partials/post_related.html:15-22`），能供探索，但無法解釋這篇如何接到下一章。

**建議／驗收：** 為聆聽疼痛計畫先建立策展專頁：說明緣起、閱讀順序、12 篇的主題關係、可見入口與搜尋快捷目錄；原 tag 與文章 URL 保留。素描可沿用既有數字 seriesLabel，補 01→13 續讀、原作與筆觸細節的選看方式。若要 awards 級互動，讓「看見／聽見一個經驗」成為內容理解工具，例如讀者選一句疼痛的比喻看到相連的訪談片段，再進全文；需有鍵盤与 reduced motion 路徑，不把單篇長文全部強制轉為動畫體驗。

### C4 — P2：SEO 基礎已有，應精選旗艦內容而非全開索引

**觀察：** 已有 canonical（`layouts/partials/head.html:33-37`）、WebSite／breadcrumb／BlogPosting／AboutPage schema 與 sameAs fallback（`layouts/partials/templates/schema_json.html:12-37`、`:39-54`、`:84-89`、`:108-136`）；sitemap 包含 blog、clubhouse、系列子區與 categories（`layouts/sitemap.xml:8-15`）。這不是缺 SEO 骨架。

**觀察：** 即使 tag front matter 寫 `robotsNoIndex: false`，全站規則仍將 tags 設成 `noindex, follow`（`layouts/partials/head.html:7-10`），sitemap 也不收錄 tags。個人作者網站 publisherType 未設定時為 Organization（`layouts/partials/templates/schema_json.html:1`、`:25-34`）。關於頁 description 為泛用「網站介紹與個人簡介」（`content/about/index.md:8`）。部分文章摘要較像正文段落，且 12 篇無手寫 description，會落到 Summary fallback。

**判斷／建議：** 先把旗艦專案變成有原創導讀、選文與完整關係的可索引 hub，並以 Search Console 與實際搜尋需求核定其優先順序；不將全部 41 個 tag 打開索引。集中整理約 12–20 篇 flagship 的唯一摘要、原始資料來源與封面說明；關於頁增加清楚的作者／研究／工作介紹与可點的代表閱讀路線。設定個人 publisher 與 author URL 是語義整理，不能直接宣稱帶來排名或 rich result 提升。

### C5 — P2：錯誤頁仍缺可讀的回流內容

**觀察：** 專案沒有 local layouts/404.html，沿用 PaperMod：main 只有「404」（`themes/PaperMod/layouts/404.html:1-3`）。頁首可導覽，但主體缺少錯誤原因、搜尋／首頁／代表文章。正式視覺與 HTTP 狀態由主代理另行核對，不由此模板推定正式 unknown path 的 HTTP code。

**建議／驗收：** 為錯誤頁提供一句作者語氣的解釋、可操作搜尋及首頁／一條策展閱讀入口。必要資訊先清楚，河流意象只作點綴；保留真正的 HTTP 404，測試舊 alias、無效深層文章與手機鍵盤流程。

## 建議排序

1. **先修可靠找回：** 標題與系列搜尋案例、專案快捷入口。單靠畫面美化仍會讓新讀者在重要內容上失去信任。
2. **再做作者策展：** 一個首屏可理解的觀點＋三條手選閱讀路線，讓分類內現有導讀與文章連成旅程。
3. **選一個代表作專案：** 優先聆聽疼痛計畫，保留安靜閱讀；在專案入口嘗試能幫助理解內容的互動。這是朝 awards 級辨識度的內容基礎，並非建議整站重写。
4. **補可測的治理：** 數字系列／別名／精選文章有明確資料契約；旗艦摘要與 SEO hub 有編輯負責；以找文成功、續讀任務及策展入口使用驗收，不以文章數或動畫數當成果。
