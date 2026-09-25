# 分類系統第一階段修正交接報告

日期：2026-09-25  
目的：以低風險方式修正已確認的文章總覽、會所排序、明顯錯誤標題與失效歷史入口。分類名稱、tag 合併、header 改版和 category 是否退場，均留給後續階段。

## 本輪完成內容

### 階段 1：統一全站文章集合

新增 `layouts/partials/article-pages.html`，將 `blog` 和 `clubhouse` 兩個 section 的已發布文章合成一個去重集合，按日期新到舊排列。這個共同集合目前用在：

- 首頁的最新文章與首頁分頁。
- `/blog/` 的全部文章列表。
- 全部文章 RSS。
- 分類總覽的全站文章數。

結果：全站已發布文章從只計 blog 的 196 篇改為 226 篇，其中包含 30 篇會所文章。`/blog/` 目前 23 頁；文章網址與 canonical 未改變。

### 階段 2：會所列表與錯誤標題

- `layouts/clubhouse/categorylike.html` 改為直接按日期新到舊，不再先倒序再反轉。
- `content/clubhouse/會所工作日誌/17將言語視為符號/index.md` 的 front matter `title` 從錯誤的「會所工作手冊」改成「會所工作日誌17_將言語視為符號」。`displayTitle`、`seriesLabel`、分類、tag 和網址均保留。

結果：會所總覽 30 篇跨 4 頁連續按新到舊排列，最新文章位於第 1 頁；日誌 17 在會所列表中顯示正確名稱。

### 階段 3：修復已證實的舊 404 入口

`static/_redirects` 在原有規則前新增兩條精確規則，讓 Cloudflare Pages 優先導向有效的 `/categories/助人工作/`；原有兩條規則暫時保留在後面，作為歷史基準與回復記錄：

- `/blog/邁向助人工作`
- `/blog/邁向助人工作/`

原有兩條舊精確規則和 `/blog/邁向助人工作/*` 萬用規則都保留；本輪沒有把所有舊文章路徑粗略導到分類頁。Cloudflare Pages 會採用前面的精確規則，後面的舊規則則讓 URL guard 繼續保護歷史記錄。

## 驗證結果

使用全新 Hugo 輸出目錄，避免舊 `public` 內容掩蓋問題。

| 驗證 | 結果 |
| --- | --- |
| 階段 1 文章集合 | 通過：226 個唯一文章網址，包含 30 篇 clubhouse；首頁最新、`/blog/`、RSS 一致 |
| 階段 1 URL 保護 | 通過：639 個既有基準路徑，0 個新增回歸；仍列出原本 3 個基準疑點 |
| 階段 2 會所 | 通過：30 篇按日期新到舊，最新文章在第 1 頁，日誌 17 標題正確 |
| 文章 canonical | 通過：226 篇文章的 canonical 與既有 permalink 相同 |
| 階段 3 轉址 | 建置後確認兩條精確舊入口最後到 `/categories/助人工作/`；舊 wildcard 文章入口仍可到個別文章 |
| 完整 site build | 通過：Hugo、Pagefind 皆完成；Pagefind 輸出 278 個索引頁、0 個 filter |

目前未部署，也未修改外部 Cloudflare 設定。`_redirects` 由 Cloudflare Pages 從 `static/` 複製到部署輸出並解析；精確規則放在 wildcard 以前，避免被較寬的規則先攔截。參考 [Cloudflare Pages redirects](https://developers.cloudflare.com/pages/configuration/redirects/)。

`npm run check:urls` 若直接對工作區既有的 `public/` 執行，可能讀到 Hugo server 以前寫入的 localhost canonical 和 livereload 內容；本輪以乾淨 `.tmp/audit-step1-stage3` 輸出驗證 URL guard。`npm run check:search-ux` 在本機因 Playwright Chromium 回報 `spawn EPERM` 未能啟動，與 Hugo／Pagefind build 無關；先前同一套瀏覽器檢查已在正式站完成，且本輪沒有改搜尋版型。

## 保留的既有基準疑點

URL guard 仍會報告下列歷史基準問題。階段 3 以規則優先順序修正線上目的地，但沒有覆蓋舊基準；要在建置基準中消除這些記錄，必須另行更新基準或加入明確 migration mapping，不能偷偷忽略：

- `/404.html` 的舊解析路徑。
- 舊 `/blog/邁向助人工作` 來源在原基準中記錄為導向 `/blog/助人工作/`。

下一輪應重新 capture 一份「階段 1–3 後」本機基準，並以人工核准的 move mapping 說明這兩個預期變更。這不是刪除既有基準的理由。

## 本輪刻意沒有做的事情

- 沒有把「閱讀與筆記」改成「閱讀與觀看」的 URL。
- 沒有刪除 category，也沒有把所有 category 改成 tag。
- 沒有合併「電影／電影心得」「聆聽疼痛／聆聽疼痛計畫」或任何其他 tag。
- 沒有移動文章資料夾、圖片 bundle、既有文章 URL、alias 或 comments／互動識別。
- 沒有重新設計 header，沒有把 41 個 tag 全部塞進選單。
- 沒有改 sitemap 的 taxonomy 收錄策略或 Search Console 設定。

## 後續工作建議

### 下一個低風險批次

先做「入口文字與集合說明」而不改 URL：

1. 把「六大主題分類」改成「五大分類＋會所專區」或同等清楚的文案。
2. 把 196、257 等容易誤解的數字改成明確統計口徑；會所不再和五類相加。
3. 修正首頁分類卡片的跨類 tag 文案，標示「跨分類主題」或顯示本類／全站數字。
4. 病痛頁將「全部文章」改成「個人病痛書寫」並清楚列出聆聽疼痛計畫 12 篇。

這一批不需要搬文章，也不必新增 alias。

### 再下一批：決定分類模型

在正式改名或移除 category 前，先完成：

- 15–20 篇跨界文章的人工試分。
- 41 個 tag 的保留、合併候選與只供串連字典。
- 會所 section 與同名 tag 的主要入口決定。
- 「保留 category」與「只用 tag」兩種 header 預覽。

若選擇只用 tag，建議將 header 簡化為「全部文章／主題瀏覽／關於／搜尋」，而不是把 41 個 tag 平鋪。category 舊頁先保留為相容入口，待所有舊 URL、RSS、分頁和文章互動識別核對後，再做 redirect。

## 重要檔案

- [完整分類稽核](README.md)
- [41 項 tag 字典](tag-dictionary.md)
- [文章清單](article-inventory.csv)
- [網址狀態清單](route-checks.csv)
- [來源統計](source-summary.json)
- [桌機／手機檢查](browser-checks.json)
- [搜尋與手機選單檢查](search-and-menu.json)

## 接續時第一個動作

先檢查工作樹與本報告，再建立新的乾淨建置目錄，執行：

```powershell
hugo --minify --destination .tmp/audit-taxonomy-next --cacheDir C:/Hugo/listenriver.com/.hugo_cache
python .tmp/audit-taxonomy-20260925/verify_step1.py .tmp/audit-taxonomy-next 3
python scripts/url-guard.py check --site .tmp/audit-taxonomy-next
```

確認階段 1–3 沒有回歸後，才開始下一個入口文案批次。任何 taxonomy 名稱或 URL 改動都應先另存 mapping，再跑 URL guard，不要直接批次移動內容。
