# 首頁效能基準與正式站複核

日期：2026-10-11；來源分支：`codex/sticky-header-refinement`；量測來源提交：`91c08107`。

## 結論

Gallery 自動輪播、可見範圍才啟動與照片數字排序已提交。固定精選文章後，三次手機冷載入 LCP 中位數為 2.196 秒，桌機為 0.464 秒；六次初始載入觀察的 CLS 都是 0。Gallery 在首屏沒有圖片請求。

這批證據支持先保留目前版面、Header 與圖片處理。下一個效能候選是字型傳輸量；尚未證明字型是 LCP 的直接原因，應先以相同條件做對照，並確認繁體中文字形與閱讀品質。

正式站仍是舊版 8 張 Gallery，目前分支為 10 張；本輪沒有推送、合併 main 或部署。以下正式 HTTP 結果只代表當時已部署版本。

## 可重現條件

- Hugo **0.160.1 Extended**，與部署設定版本一致；獨立 minified 產物，不使用開發伺服器。
- Pagefind **1.5.2 Extended**：227 頁、13,279 詞。
- Node **26.7.0**、Edge **155.0.4283.45**；CI 的 Node 20 尚未在本機重現。
- 每次建立新的 browser context、清除並停用快取，各裝置三次。
- 手機：390×844、DPR 2、下載 1.6Mbps、上傳 0.75Mbps、延遲 150ms、CPU 4 倍降速。
- 桌機：1440×900、DPR 1、下載 10Mbps、上傳 5Mbps、延遲 40ms、CPU 不降速。
- 本機文字資源使用 Brotli quality 5；壓縮结果由伺服器快取。此設定不是 Cloudflare 傳輸實測。
- 封鎖第三方請求，固定亮色模式、精選首篇「肯認每一種聲音的存在」，DOMContentLoaded 時暫停精選輪播。
- 在 load 後再等兩秒記錄首屏，之後點擊主題切換。沒有捲動至 Gallery。

```powershell
.\.tmp\audit-tools\hugo\hugo.exe --minify --destination .tmp/perf-gallery-baseline
.\node_modules\.bin\pagefind.cmd --site .tmp/perf-gallery-baseline
node scripts/check-home-performance.mjs .tmp/perf-gallery-baseline .tmp/perf-gallery-baseline-results
```

Hugo 執行檔為本機工具路徑，其他環境應使用已安裝的 0.160.1 Extended。原始 JSON 與六張截圖位於 Git 忽略的 `.tmp/perf-gallery-baseline-results/`，不提交生成產物。

## 量測結果

| 裝置 | 第一次 LCP | 第二次 LCP | 第三次 LCP | 中位數 | CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| 手機 | 2.320s | 1.996s | 2.196s | **2.196s** | 三次皆 0 |
| 桌機 | 0.492s | 0.464s | 0.452s | **0.464s** | 三次皆 0 |

六次 LCP 元素均為固定精選文章的 WebP 封面；本次 FCP 與 LCP 時間相同。資源傳輸量包含 Resource Timing 的回報開銷，不含主文件，也不代表完整頁面捲到底的下載量。

| 初始子資源傳輸量 | 手機 | 桌機 |
| --- | ---: | ---: |
| 合計 | 681,075 bytes | 394,155 bytes |
| `river-sans.woff2` | 248,312 bytes | 248,312 bytes |
| CSS 合計 | 51,566 bytes | 51,566 bytes |
| JavaScript 合計 | 8,835 bytes | 8,835 bytes |
| 精選 LCP 封面 | 48,032 bytes | 48,032 bytes |
| Gallery 圖片請求 | **0** | **0** |

字型約占手機初始子資源傳輸量 36.5%、桌機 63%。手機還會提早載入靠近視窗的部分文章縮圖，這與瀏覽器 lazy-loading 距離判定有關；不是 Gallery 全量下載。

六次主題切換皆成功變為 dark，沒有 pageerror。互動事件與 long task 原始觀察保存在 JSON；單一主題切換不能用來宣稱全站 INP 通過。

此為受控實驗室樣本，未包含第三方服務、整頁操作、Safari 真機、正式 CDN、Lighthouse 分數或 CrUX 第 75 百分位資料。初始 CLS 為 0 不代表整個訪問的 CLS 必定為 0。Core Web Vitals 的使用者資料與判讀可參考 [LCP](https://web.dev/articles/lcp)、[CLS](https://web.dev/articles/cls)、[INP](https://web.dev/articles/inp) 官方說明。

## 建置與回歸

- 0.160.1 minified 建置成功；78 項 Playwright 測試通過，涵蓋文章、列表、搜尋／系列、導覽、手機與桌機 Gallery、明暗色及 reduced motion。
- Pagefind 必要輸出檢查通過，227 頁索引。
- 搜尋 UX 檢查通過：手機／桌機預填、Header 導向、URL 同步、清除查詢與三個完整系列入口。
- 639 個網址基準沒有新增退化；保留三項既有解析問題，未在本輪變更網址。
- 閱讀筆記遷移檢查：40 個直接 301、canonical／OG／sitemap／RSS／內部連結通過。
- 會所檢查：30 篇公開文章、1 篇保留草稿、別名與互動 key 通過；本輪未提供遷移前媒體快照，不據此宣稱完成媒體搬移對照。
- 修正 `check-clubhouse-folder-migration.py`：使用 HTMLParser 讀取互動屬性，兼容壓縮 HTML 的無引號屬性；仍要求屬性存在且每個值符合既有 interaction key。

Pagefind 輸出與搜尋 UX 原腳本的本機路徑／瀏覽器設定，透過 `.tmp/` 臨時副本指向本次產物及 Edge；原始驗證条件保留。

## 正式站只讀複核

| 項目 | 當次結果 |
| --- | --- |
| 首頁 | 瀏覽器 HTTP 200；Gallery 8 張，圖片選用 WebP，新輪播狀態尚未部署 |
| `/search/?q=英雄之旅` | HTTP 200、5 個顯示結果，首筆為《英雄之旅》閱讀心得 |
| `/categories/閱讀與筆記/` | 301 → `/categories/閱讀筆記/` → 200 |
| `/clubhouse/會所工作日誌/` | 301 → `/clubhouse/工作日誌/` → 200 |

新版部署後仍須再次驗收 10 張照片、數字順序、可見範圍自動輪播、手機／桌機與明暗色，以及正式 CDN 的下載表現。沒有寫入留言或互動 API。

## 接續範圍

1. 新版進入正式部署後，補實際網址與 Gallery 驗收，不以本機通過代替部署完成。
2. 若繼續效能優化，先做字型精簡／載入策略的可讀性與傳輸對照；保留繁體字覆蓋，不直接替換品牌字體。
3. 有新的瓶頸證據才拆 CSS 或调整文章縮圖載入，Header 維持定稿。
