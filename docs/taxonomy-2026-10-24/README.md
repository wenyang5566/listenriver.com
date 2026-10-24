# 日常札記與展覽心得整理（2026-10-24）

分支：codex/home-carousel-navigation。基準：ff2998a7。本批已完成本機驗收，依使用者授權準備 commit 並 push 此分支；尚未發布正式站。

## 實作

- 日常書寫分類改名日常札記；26 篇原文章保留資料夾、網址、正文與 categories/tags 以外的 front matter。
- 20 篇留在日常札記：素描 13、觀察反思 6、數位生活 1。保留素描03的正念的河流與時間文章的時間 tag。
- 4 篇移入閱讀筆記，其中洪瑞麟與人間出口新增展覽心得；另 1 篇移到成為自己、1 篇移到助人工作。Clubhouse 兩篇只掛觀察反思。
- 閱讀筆記簡介加入看展，分類頁新增展覽心得篩選。講座心得與講座筆記是不同 tag，各自保留；Header 僅保留書摘、閱讀心得、講座筆記、電影心得四個主要子題，講座心得與展覽心得放在分類頁篩選與文章 tag，避免抽屜過滿。
- 手機分類列整列為展開／收合按鈕，不直接跳頁；由展開後的「全部文章」進分類。桌機維持名稱連結與獨立箭頭。此追加調整通過16項手機／桌機明暗、鍵盤、抽屜與圖集相關驗證。
- 分類頁篩選順序改由 data/taxonomy-landing.yaml 的 filters 設定，避免單篇數位生活被自動篩選規則隱藏；不重寫整套導覽架構。
- 分類簡介保留原三篇作者推薦連結，介紹正文與 description 使用新文案，首頁卡片使用精簡版。
- 正式部署依 DEPLOYMENT.md：Cloudflare Pages 使用 static/_redirects。16 條舊分類首頁、RSS、page/1～4 路由直接301到新分類／feed；新分類20篇恰好一頁，因此舊分頁收斂到首頁。Hugo aliases 提供首頁與page/1、page/2的本機靜態後備，不宣稱它是HTTP301。
- 保留文章／圖片路徑、內文、歷史紀錄、aliases 與轉址來源中的日常書寫。About 內的日常書寫是作者正文，保持原樣。
- 因新導覽文字觸發完整字型後援，更新既有首頁字型子集（119,344 bytes），未增加字型種類。首頁 CSS 子集重新產生後無內容差異。

## 驗證

- Hugo 0.160.1 extended：348 Pages、69 Paginator pages，成功；Pagefind 重建成功。
- 公開篇數：日常札記20、閱讀筆記95、成為自己28、助人工作57、病痛經驗28；會所專區30不變。草稿排除，會所與助人工作不是互斥集合。
- 65 項相關 Playwright 案例均通過；首輪63項通過，2項在修正無JS標題斷言與首頁字型子集後重測通過。涵蓋分類、無JS、篩選、手機／桌機明暗、搜尋、Header、輪播與Gallery。
- 原26篇文章以HTTP200與canonical逐篇確認；全站231篇文章的Hugo permalink也與改前一致。
- 639條歷史網址基準零新增回歸；保留3個既有解析問題。16條直接301、RSS、canonical、robots與sitemap另行核對。
- 616個HTML掃描，排除redirect頁後，無連往舊分類的內部href。
- 測試從data-count讀取篩選篇數，未將本輪分類總數永久寫死；26篇歷史網址快照用於後續相容回歸。
- 本機不代表正式Cloudflare HTTP已驗證；發布後仍需抽查分類301、feed與文章頁。
- 收尾補驗：既有閱讀筆記遷移檢查通過（40條直接301、canonical、Open Graph、sitemap、RSS與內部連結）；Pagefind必要產物齊全且索引229頁；26篇正文再次比對未變；git diff --check通過。已更新完整58個來源路徑清單。
- 提交前舊名稱清查：所有文章 categories、有效模板、分類資料與 hugo.yaml 均已移除舊名稱；16條舊分類路由直接導到新分類或feed，沒有再導回舊分類。舊字樣僅保留於文章／資源歷史路徑、aliases、轉址來源、作者原文及歷史紀錄，不做全repo盲目替換。
- PR #72 首輪完整CI為129項通過、2項桌機提示色測試失敗：舊測試仍在展開按鈕內找已拆出的分類連結。已更新定位並修正CSS，維持展開／鍵盤焦點時連結的提示色；明暗兩項本機重測通過，隨PR重新執行完整CI。

## 預覽

本機伺服器：http://127.0.0.1:1347/ 。分類：/categories/日常札記/；展覽：/tags/展覽心得/。依賴本機伺服器執行。

## 修改檔案

分類簡介由日常書寫移至日常札記；文章資料夾沒有移動。完整來源變更：

- `assets/css/extended/zzzzzzz-mobile-directory.css`
- `assets/css/river-home-font.css`
- `assets/css/extended/zzzzzzzz-desktop-directory.css`
- `content/blog/_index.md`
- `content/blog/日常書寫/clubhouse的密室/index.md`
- `content/blog/日常書寫/clubhouse的療癒空間/index.md`
- `content/blog/日常書寫/一種抵達經驗的方式/index.md`
- `content/blog/日常書寫/人間出口：性和慾望的詮釋/index.md`
- `content/blog/日常書寫/來自異次元的騷擾：腦控受害者/index.md`
- `content/blog/日常書寫/如何理解時間的存在/index.md`
- `content/blog/日常書寫/如何看待暴力/index.md`
- `content/blog/日常書寫/掘光而行/index.md`
- `content/blog/日常書寫/整理書櫃有感/index.md`
- `content/blog/日常書寫/網頁架設學習歷程/index.md`
- `content/blog/日常書寫/美好的事物終將灰飛煙滅/index.md`
- `content/blog/日常書寫/蜷縮、停滯、暗之惡魔/index.md`
- `content/blog/日常書寫/關於語言的反思/index.md`
- `content/blog/素描/01盲畫/index.md`
- `content/blog/素描/02負形/index.md`
- `content/blog/素描/03繼續負形/index.md`
- `content/blog/素描/04立體感是一種深度的錯覺/index.md`
- `content/blog/素描/05亮暗面、光影、色階/index.md`
- `content/blog/素描/06繼續光影、色階/index.md`
- `content/blog/素描/07形準、比例感、切圓術/index.md`
- `content/blog/素描/08透視、塞尚、矩形/index.md`
- `content/blog/素描/09捏陶的素描/index.md`
- `content/blog/素描/10編織的素描/index.md`
- `content/blog/素描/11補捉場景/index.md`
- `content/blog/素描/12人臉/index.md`
- `content/blog/素描/13實在感/index.md`
- `content/categories/_index.md`
- `content/categories/日常書寫/_index.md`
- `content/categories/日常札記/_index.md`
- `content/categories/閱讀筆記/_index.md`
- `content/tags/展覽心得/_index.md`
- `content/tags/數位生活/_index.md`
- `content/tags/觀察反思/_index.md`
- `data/featured-tags.yaml`
- `data/taxonomy-landing.yaml`
- `docs/taxonomy-2026-10-24/README.md`
- `docs/taxonomy-2026-10-24/article-urls.json`
- `docs/taxonomy-2026-10-24/url-moves.json`
- `docs/taxonomy-url-moves.json`
- `hugo.yaml`
- `layouts/partials/category-data.html`
- `layouts/partials/featured-banner.html`
- `layouts/partials/header-category-nav.html`
- `layouts/partials/header.html`
- `layouts/partials/home-clubhouse.html`
- `layouts/partials/home-featured.html`
- `layouts/partials/home-latest.html`
- `layouts/partials/site-nav-items.html`
- `layouts/partials/taxonomy-content.html`
- `static/_redirects`
- `static/fonts/river-home.woff2`
- `tests/daily-taxonomy.spec.js`
- `tests/home-controls.spec.js`
- `tests/mobile-directory.spec.js`
- `tests/simplified-site.spec.js`
- `tests/scroll-navigation.spec.js`
