# 會所名稱與資料夾整理計畫

2026-10-09。已依使用者要求分階段實作；下方保留方案討論，最新成果與限制見文末。

## 最新範圍釐清（優先於下方方案比較）

使用者所指的是三個父分區資料夾改名，文章子資料夾已經有名稱，不改子資料夾。已逐一列出確認：工作日誌有 19 個、實習有 7 個、手冊有 5 個具名 bundle，子資料夾本來就不含系列前綴底線。

本批應以公開分區 URL 一併改名的方案 B 規劃：`/clubhouse/會所工作手冊/<既有子路徑>/` → `/clubhouse/工作手冊/<既有子路徑>/`，另兩類同理，改為工作日誌與實習紀錄。不得順便將 leaf bundle 名稱改成 title；例如手冊 05 子資料夾仍保留「05忍不住、氣不過、沉住氣」，其文章 displayTitle 為「沉住氣的重要」，兩者差異本來就存在。

相容性以每個已發布文章／分區的精確 301 為主，文章與分區新增舊 URL aliases 作 HTML 備援；保留既有 aliases。另對已存在分頁、RSS 與實際被引用媒體建立對照，不僅做三個分區首頁的轉址。前一批舊 tag 301 與新 tag canonical 要直接更新至新分區，不留下中繼舊分區。留言、閱讀量與喜歡沿用舊路徑識別的方案需一併設計驗證。

### title 要不要保留系列名稱

建議資料中的 title 保留完整格式，例如「工作手冊 05｜沉住氣的重要」；閱讀介面採「工作手冊 05」小標＋「沉住氣的重要」主標，避免同一頁重複顯示系列名稱。displayTitle 保留純文章題目，seriesLabel 改為新系列名稱加編號。

已確認 `layouts/_default/single.html` 的 H1 使用 displayTitle 優先、seriesLabel 另外顯示；因此前文「文章頁顯示完整 title」的概括不適用目前模板。現行會所清單由 taxonomy-content.html 輸出 `.Title`，並未統一優先使用 displayTitle；若採簡短清單，需明確改該會所清單的顯示邏輯，不能只改 Markdown 後聲稱清單自然變短。

建議會所內部清單顯示「05｜沉住氣的重要」（分區頁已有工作手冊上下文）；跨分區或全站列表可顯示完整 title 以辨識來源。這是待使用者選定的呈現方向，不在討論階段修改模板。搜尋、瀏覽器標題與 RSS 的實際 title 使用位置在實作時分別驗證。

## 顯示名稱定案

三個分區名稱改為工作日誌、實習紀錄、工作手冊。文章 Markdown title 採「工作日誌 19｜身心狀態留下的痕跡」，seriesLabel 採「工作日誌 19」，保留簡短 displayTitle。兩位數編號保留，底線替換為分隔符號；不要將這種顯示格式直接用作網址或資料夾名稱。

## 一起改資料夾：兩種方案

| 方案 | 原始碼資料夾 | 公開 URL | 投入與風險 |
| --- | --- | --- | --- |
| A（建議） | 三個分區資料夾改名 | 明確固定舊 URL | 中等：需核對 Hugo URL、圖片與 GetPage 引用；文章外部入口、互動識別可維持 |
| B | 三個分區資料夾改名 | 公開 URL 同時改名 | 較高：另需文章、媒體、RSS、分頁轉址與留言／計數識別相容 |

資料夾對照：`content/clubhouse/會所工作日誌/` → `content/clubhouse/工作日誌/`；會所實習 → 實習紀錄；會所工作手冊 → 工作手冊。文章 leaf bundle 子資料夾暫保留既有編號與名稱，`index.md` 與 `_index.md` 檔名不變。若希望連文章子資料夾也整理，另外列出逐篇新舊路徑表，不依 title 自動改檔名。

建議 A：清楚的來源資料夾名稱可以與穩定的公開網址分開管理。先改顯示名稱，再移動分區資料夾，固定每篇文章與分區的舊公開 URL。不要假設只設定父分區 url 就一定能固定子文章 URL；需逐篇確認產物，必要時使用明確 url／對應 permalink 設定。

## 查證與影響

已查 codebase-memory-mcp：根目錄、分支 `codex/mobile-hero-title-center`、HEAD `d0a83d95` 符合專案；查圖定位 normalizeSlug，再讀來源確認。Hugo 動態 partial 圖有缺口，以下依目前程式碼。

- 會所文章目前未見明確 slug／url；更動父資料夾後可能改變公開 URL，需以 Hugo 實際建置確認。
- 部分圖片使用 `content/clubhouse/會所工作日誌/...` 路徑，移動來源即須更新；只含圖片檔名的 bundle 相對引用通常可隨 bundle 移動，仍要驗證。
- layouts、資料與導覽有 `/clubhouse/舊分區/` 及 GetPage 引用。需區分來源邏輯路徑與公開 URL：方案 A 改前者、保留後者。
- 舊 tag 的 canonical、topicDestinations、前一批 redirects 指向原分區。方案 A 保留目的地；方案 B 全部指向新最終位置，避免多段跳轉。
- `static/js/custom.js` 的互動功能使用 data post path／location.pathname；Worker normalizeSlug 與 D1 以 slug 作識別。`layouts/partials/comments.html` 將 RelPermalink 正規化後作 Waline path。URL 改變可能讓閱讀量、喜歡與留言分成兩筆；301 不會自動合併資料。
- 來源 31 篇含 1 篇既有草稿；遷移清單涵蓋草稿，但公開建置驗收按已發布 30 篇處理。

## 執行順序

1. 收尾前一批 tag 改名，建立新的乾淨來源／URL／RSS／媒體與 aliases 基準，避免兩批變更難以分辨。
2. 保存 31 篇來源路徑、舊 URL、title、seriesLabel、displayTitle、draft、aliases 的對照；另保存三個分區與所有已存在分頁／RSS。
3. 改文章 title、seriesLabel、分區 title；同步導覽文字、依 CurrentSection.LinkTitle 分組的模板及標題 fallback 正規表示式。搜尋顯示新名稱，但保留舊名稱查詢關鍵字。
4. 按選定方案移動三個分區 bundle，更新來源圖片引用、GetPage、lead／精選資料等命中項目；不對全文盲目替換舊名稱。
5. 方案 A 逐篇固定舊 URL，確認 bundle 媒體公開路徑亦保持；若媒體路徑無法保留，須額外建立相容機制，不能只驗 HTML。
6. 方案 B 建立明確新 URL 對照，精確 301 及 aliases 備援涵蓋文章、分區、既有分頁與 RSS；圖片等媒體逐項處理。閱讀量／喜歡與 Waline 須保留舊穩定識別或規劃資料遷移，實作前先查服務既有資料，不假設可直接搬移。
7. 全新 Hugo／Pagefind 建置、URL guard、站內來源／輸出連結與圖片檢查；檢查標題、麵包屑、系列、搜尋、推薦、分區續載，涵蓋手機／桌機與明暗模式。

## 驗收與難度

方案 A：文章、分區、RSS、媒體與 aliases 公開 URL 全部保持基準，留言與計數 path 不變；來源路徑引用無失效，標題無底線，編號正確。來源資料夾改名是可控的中等整理，不是單純換三個資料夾名稱即可。

方案 B：每個舊入口可到達正確新目標，無循環／無多段跳轉，canonical／sitemap／RSS／站內連結一致；留言與計數能延續。這是完整網址遷移，工作重點在相容與資料識別，建議獨立一批，不與顯示名稱混做。正式 HTTP 轉址待部署後驗證。

估計 A 約半天至一天、B 約一至兩天以上，為含驗證的規劃量級，非承諾；實際依媒體引用與互動資料相容需求調整。只提交來源，不提交建置產物。回復要同步回復內容路徑、模板引用、URL 與轉址；若 B 已遷移外部資料，需另外準備資料回復方案。

## 階段完成紀錄

1. Tag 改名已獨立提交 `6cae0d97`。既有未提交的 `scripts/check-reading-migration.py` 與本機產物未納入。
2. 三個父分區資料夾與公開 URL 改名，31 個文章子資料夾與圖片檔名保留。Markdown title、seriesLabel、分區 title 與導覽同步更新；單一分區列表使用編號＋displayTitle，會所總覽／其他列表保留完整 title。
3. 更新圖片來源引用與模板查找，舊文章／分區保留 aliases。原有精確規則順序與重複歷史項目保留；轉址目的地依遷移表直接更新到新位置。對原建置的 700 個 bundle 媒體新增精確相容轉址；總規則數仍低於 2,000，未新增 wildcard。既有 `/blog/會所模式/*` 保留，可接續至新網址，歷史通配入口可能仍需多段轉址，未宣稱全部歷史入口皆為單跳。
4. 每篇新增 interactionKey，從改名前實際 HTML 擷取舊 data-post-path，避免 Hugo urlize 移除標點造成誤判。互動、Waline 與留言計數模板皆使用該 key，其他文章 fallback 仍為 RelPermalink；新文章網址、分享與 canonical 使用新 URL。未移動或刪除外部資料，也未發送測試留言／喜歡。
5. 新增 `docs/clubhouse-folder-migration-manifest.json` 與 `scripts/check-clubhouse-folder-migration.py`，CI 納入驗證。網址守門只允許已審核 moves 中的既有轉址目的地更新，任意改動仍拒絕；快取轉址正規表示式，避免大量媒體規則使檢查反覆編譯。

驗證基準為 `.tmp/audit-clubhouse-tag-verified`，全新結果為 `.tmp/audit-clubhouse-folders-final`：

- Hugo 0.166.0 建置通過，Pagefind 1.5.2 Extended 索引 227 頁，既有語言棄用警告保留。
- 歷史 639 routes：0 新增退化、3 原有問題；分區搬移前基準：0 新增退化、1 原有問題。
- 30 篇發布文章：新舊 URL 對照、aliases 與全部互動／留言 key 通過；1 篇草稿仍未發布。
- 700 個舊媒體：精確轉址存在、新目標存在、檔案內容逐位元相同。
- 10 個 URL guard 單元測試與 `git diff --check` 通過。
- 390px／1440px 搜尋新名稱與舊會所實習名稱均到新分區，「會所」仍顯示三個系列。工作手冊分區顯示編號＋簡短題目，文章 H1、系列小標與 canonical／舊互動 key 正確；會所總覽顯示完整新標題。

可重跑：

```powershell
python scripts/url-guard.py check --site .tmp/audit-clubhouse-folders-final --moves docs/taxonomy-url-moves.json
python scripts/check-clubhouse-folder-migration.py --site .tmp/audit-clubhouse-folders-final --before .tmp/audit-clubhouse-tag-verified
python -m unittest discover -s tests -p test_url_guard.py
```

正式 Cloudflare HTTP 301／Location 待部署後驗證；本機伺服器不執行 `_redirects`。完整搜尋自動套件仍因缺少指定 Playwright Chromium 未完成，已以可用瀏覽器驗證上述案例。未推送或部署。留言是否原本存在未查遠端資料；保留歷史 key 不依賴留言為空的假設。
