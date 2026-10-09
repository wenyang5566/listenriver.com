# 會所文章標籤改名計畫

日期：2026-10-09。查證基準：`codex/mobile-hero-title-center`／`d0a83d95`。已依後續要求實作，結果見文末；尚未提交或部署。

## 規則與已查證現況

| 舊 tag | 新 tag | 會所文章數 |
| --- | --- | --- |
| 會所工作日誌 | 工作日誌 | 19 |
| 會所實習 | 實習紀錄 | 7 |
| 會所工作手冊 | 工作手冊 | 5 |

31 篇 `content/clubhouse/**/index.md` 全部已有「會所模式」tag，應保留並去重，不需再重複加入。兩篇文章另有「成為一個人」，亦保留。不得對全文做名稱取代；只處理 front matter 的 tags，文章標題、seriesLabel、正文、圖片、categories、slug、url、aliases 與資料夾路徑維持原樣。

codebase-memory-mcp index_status 已確認專案根目錄、目前分支與 HEAD，並查圖定位 topic-entry-url；Hugo 動態 partial 關係有解析缺口，以下關鍵結論由原始碼確認：

- `content/tags/會所工作日誌/_index.md`、`會所實習/_index.md`、`會所工作手冊/_index.md` 已有 robotsNoIndex 與 canonicalURL，canonical 指向各 `/clubhouse/…/` 分區。
- `data/taxonomy-landing.yaml` 的 topicDestinations 將舊 tag 導向會所分區；`layouts/partials/topic-entry-url.html` 依此解析入口。
- `layouts/partials/taxonomy-content.html` 的會所總覽篩選以三個舊 tag 取文章，須同步改名，否則篩選會空白。
- `data/featured-tags.yaml`、`hugo.yaml` 的 homeTagAxes 也引用舊 tag；`scripts/check-search-ux.mjs` 有三個舊名稱的驗證預期。
- 目前建置產物：工作日誌 tag 有第 2 頁，其餘兩個僅有 page/1 別名；三者皆有 RSS。會所模式 tag 有第 2、3 頁，保留原名稱不遷移。
- 目前未見新 tag 的內容頁定義；正式執行前仍須檢查全站 front matter 是否已使用同名 tag，避免意外合併其他文章。

## 建議實作

1. 以全新 Hugo 產物建立此次改名前網址與文章集合基準，保存三個舊 tag 的 HTML、分頁、RSS 與 canonical。保留既有網址守門基準，不覆寫。
2. 僅更新 31 篇文章的 tags；確保每篇保有一次「會所模式」，並保留其他標籤及原順序。
3. 將三個 tag 內容頁移至新 tag 路徑，更新 title／description，保留 noindex 與指向原會所分區的 canonical。分區網址及名稱不是本批遷移範圍。
4. 同步更新資料中的 tag 名稱、topicDestinations 的 key、會所篩選及搜尋驗證預期。目的地仍為既有 `/clubhouse/會所工作日誌/`、`/clubhouse/會所實習/`、`/clubhouse/會所工作手冊/`。逐筆辨識用途，不替換以舊名稱命名的 section 路徑、標題正規表示式或歷史遷移腳本。
5. 確認 tags 總覽、文章 tag 連結、相關主題與搜尋系列入口使用新名稱，三個集合仍分別為 19／7／5，會所模式集合仍為 31。

## 清單顯示名稱的注意事項

使用者補充：清單目前有將舊名稱顯示為「工作日誌」的特別設定；本批直接更新 Markdown tags 後，不再需要這種舊 tag → 短顯示名稱的轉換。實作時找出並移除僅為三個舊 tag 縮名的映射或替換，清單直接使用新的 tag 名稱「工作日誌／實習紀錄／工作手冊」。顯示文字、篩選值、文章 tags 與 tag 連結需一致，不保留「畫面是新名稱、資料仍是舊名稱」的雙重規則。

目前讀到的會所總覽篩選直接輸出 `$name`，尚未在該處定位到上述短名設定，需繼續核對使用者所指的清單位置，不能假設所有短名稱都是 tag 轉換。已確認 `site-nav-items.html` 有分區導覽短名，其中「實習日誌」與新 tag「實習紀錄」不同；這是分區導覽標籤，不應直接當成 tag 映射刪除。同步評估是否統一顯示為「實習紀錄」，但保留原分區 URL。

文章的 `displayTitle`／`seriesLabel` 是文章標題與系列編號用途，不屬於本次 tag 顯示縮名，保留。舊名稱僅可留在必要的歷史網址、aliases、轉址與不在本批範圍的分區識別中。

## aliases 與網址相容性（實作規則）

Hugo 欄位名稱是 `aliases`。它產生 HTML 跳轉頁，不能單獨保護 RSS，也不能保證所有歷史分頁仍存在。

建議使用精確 `_redirects` 301 為主要相容機制，新 tag 頁的 aliases 可作靜態環境備援，但不能同時保留舊 tag 的正常內容頁，造成重複或輸出衝突。

- 舊 HTML 首頁（無尾斜線、尾斜線、index.html）直接導向原會所分區，延續原 canonical，避免先到新 tag 再導向分區的多段跳轉。
- 舊 HTML 分頁以實際基準逐一對應：page/1 回分區首頁；工作日誌 page/2 的文章目前可在分區列表續載，導向該分區首頁，不假設分區 page/2 存在。各形式使用精確規則。
- 舊 `index.xml` 直接導向新 tag 的 `index.xml`，保留訂閱集合；RSS 與 HTML 的目的地可不同，不將 XML 導到 HTML。
- 新 tag 保留既有 noindex／分區 canonical 策略，不把三個重複列表當成新的索引入口。
- 既有文章 aliases、`/blog/會所模式/*` 與退休分頁轉址保留，不覆蓋、不新增整片 wildcard。
- 實作前核對中文與百分比編碼路徑，確認精確規則順序、無循環、無不存在的目標。一般本機 Hugo 預覽不執行 Cloudflare `_redirects`，只能驗證 alias HTML 與規則解析；正式 301／Location 待部署後 HTTP 檢查。

## 驗收與交付

- 新 tag 篇數 19／7／5；31 篇會所文章皆有一次會所模式；會所範圍內不再使用三個舊 tag；其他 tag 保留。
- 31 篇文章 URL、canonical、既有 aliases 與正文不變，三個會所分區網址不變。
- 所有舊 tag 首頁、已有分頁、RSS 可解析至有效目標；與改名前及既有 URL guard 基準比較，無新增退化。遷移 mapping 按舊 canonical 與 HTML／XML 分別審核，不把單一名稱對照直接套到所有網址。
- 全新 Hugo 建置、Pagefind 索引與搜尋 UX 驗證；檢查標籤總覽、新 tag、會所總覽篩選、文章頁主題入口，涵蓋手機／桌機及明暗模式。
- 來源提交包含文章 tags、tag 內容頁、資料／模板必要更新、精確轉址及遷移驗證紀錄；不提交建置產物。本輪已有未提交 `scripts/check-reading-migration.py`，執行前辨識其用途並保留，不混入本批。

回復以整批來源變更為單位，同步回復 tags、入口與轉址；不要只回復文章，留下篩選名稱不一致。

## 實作結果與證據

- 31 份文章 tags 已改名，全部保留一次會所模式；兩篇的成為一個人也保留。逐篇與改名前來源快照比對：正文與 tags 以外 front matter 相同，tag 順序只作名稱替換。
- 其中工作手冊「03負面教材」為既有 `draft: true`。來源篇數為 19／7／5，共 31；一般建置公布集合為 19／7／4，共 30，未發布草稿。
- 三個 tag 內容頁移至新名稱，加入舊 tag 首頁 aliases，保留既有 noindex 與會所分區 canonical。補上 24 條精確 301，涵蓋三種 HTML 首頁形式、已有分頁與 RSS。
- 資料、會所總覽篩選與搜尋顯示新 tag。搜尋另以分區原標題與「會所模式」作關鍵字，保留舊查詢及「會所」查詢，不以舊 tag 取文章。
- 清單篩選目前直接顯示 tag 名稱，未發現可移除的舊 tag 縮名映射；導覽短名屬於 section label，文章 displayTitle／seriesLabel 屬於標題用途，保留。歷史 `layouts/clubhouse/list.html` 以 CurrentSection.LinkTitle 分組，並非 tags，亦保留其分區 key。
- `docs/clubhouse-tag-url-moves.json` 記錄此次三個 RSS 遷移；`docs/taxonomy-url-moves.json` 合併既有閱讀筆記對照及本次遷移，npm check:urls 與 Hugo CI 已改用合併檔。既有閱讀遷移檔與腳本保留。

驗證使用全新 `.tmp/audit-clubhouse-tag-verified`：Hugo 0.166.0 通過；Pagefind 1.5.2 Extended 索引 227 頁；8 個既有 URL guard 單元測試通過；`git diff --check` 通過。建置保留既有語言設定棄用警告。

網址守門：此次改名前 631 routes → 0 回歸、1 既有問題；歷史 639 routes → 0 回歸、3 既有問題。既有文章與分區網址不變；三個 RSS 的 item URL 集合與改名前相同。指令：

```powershell
python scripts/url-guard.py check --site .tmp/audit-clubhouse-tag-verified --moves docs/taxonomy-url-moves.json
python -m unittest discover -s tests -p test_url_guard.py
```

瀏覽器：390px 實習紀錄篩選顯示 7／7；1440px 工作手冊篩選顯示 4／4。新舊六種系列查詢皆指向對應分區，「會所」顯示三個新名稱入口；新工作日誌 tag 標題、canonical 與 robots 正確。手機亮色／桌機暗色抽查無水平溢出，截圖保存於忽略的 audit 路徑。

限制：完整 `check-search-ux.mjs` 未跑完，因本機缺少其指定 Playwright Chromium；上述瀏覽器檢查不代表該整套測試通過。正式 Cloudflare 301／Location 待部署後 HTTP 驗證，本機 Python／Hugo 伺服器不執行 `_redirects`。未送出留言、喜歡或其他正式互動。
