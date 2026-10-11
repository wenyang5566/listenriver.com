# 首頁手機效能檢測與優化（2026-10-11）

## 結果與範圍

正式站 `https://listenriver.com/` 的手機 Lighthouse 已重現 71 分。本次完成首頁圖片與精選輪播載入優化，未變更文章 URL、分類、字型或配色，也未部署正式站。

| 測試 | 效能分數 | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| 正式站，修改前一次 | 71 | 1.5 秒 | 6.7 秒 | 230 ms | 0 |
| 本機，修改前一次 | 74 | 1.4 秒 | 6.5 秒 | 210 ms | 0 |
| 本機，最終修改後第 1 次 | 89 | 1.4 秒 | 3.3 秒 | 210 ms | 0 |
| 本機，最終修改後第 2 次 | 82 | 1.4 秒 | 4.3 秒 | 190 ms | 0 |
| 本機，最終修改後第 3 次 | 89 | 1.4 秒 | 3.3 秒 | 190 ms | 0 |

修改後分數中位數 89，LCP 中位數 3.3 秒。正式站與本機網路環境不同，不能宣稱正式站已達 89 分；部署後必須重新執行 PageSpeed。TBT 仍約 190–210 ms，尚未達到穩定的手機效能綠色區間。

## 已查證的瓶頸與修正

1. 首屏圖片延後下載：`river-home.js` 在初始化時隨機顯示另一篇文章，原本為隱藏圖片的 `loading=lazy`、`fetchpriority=auto` 變成首屏 LCP。正式站 Lighthouse 的 LCP discovery 明確指出這兩項問題。首次造訪改為使用 HTML 已提供的第一張高優先圖片；再次造訪仍避開上次文章，選中圖片會切換成 eager/high。
2. 隱藏輪播圖片仍下載：手機 CSS 將所有輪播文章放在同一 grid cell，以 `visibility:hidden` 保留最高文章的高度，瀏覽器仍會下載接近視窗的 lazy 圖片。為其他輪播文章使用 `data-src` / `data-srcset`，在選中時才還原圖片來源，維持高度預留與無 JS 的第一篇閱讀入口。共用圖片模板的新 `defer` 選項預設關閉。
3. 載入時自動換圖：原本五秒計時器在載入後自行啟動，會更換讀者正在看的首屏內容與 LCP 候選。改為第一次點擊、觸控、滾輪或鍵盤操作後才啟動計時；保留五秒換圖、播放按鈕、閱讀暫停、減少動態效果及鍵盤控制。初始顯示播放圖示。
4. 作者肖像過大：原圖 960×958、131,704 bytes，用於 80px / 140px 的顯示區域。Hugo 產生 160w / 280w WebP，分別 6,990 / 17,964 bytes，以 srcset 選擇；原圖網址保留。

關鍵來源：`assets/js/river-home.js`、`layouts/partials/river-home.html`、`layouts/partials/river-thumbnail.html`、`layouts/partials/optimized-image.html`。手機預留高度規則位於 `assets/css/river-home.css`，本輪保留它。

## 量測條件與限制

- 工作基準：`main`，`d13fb9ce31a898015f36a7a5373e41bd6bc65dcc`，開始時工作目錄乾淨。
- 關係圖索引根目錄與分支已核對；Hugo 模板有解析缺口，以上結論另以目前來源及實際網路請求查證。
- 前後 Lighthouse 建置使用相同 Hugo 0.166.0、`--minify`，Lighthouse 13.5.0 預設手機模擬與 headless Chrome。本機同一靜態伺服器，文字資源以 Brotli quality 5 壓縮。測試保留 Google Analytics 等第三方請求，因此仍有網路波動。
- 最終三次 Lighthouse 連續執行，未同時跑瀏覽器回歸測試。中間修正階段的測量不作最終比較。
- 另沿用 `scripts/check-home-performance.mjs`：390×844、DPR2、1.6Mbps、150ms、CPU4x；桌機 1440×900、DPR1、10Mbps、40ms、CPU1x。三次冷快取，封鎖第三方、固定首篇、載入後 2 秒取樣，因此這組結果不能與 Lighthouse 模擬數據混用。
- 固定首篇的手機首方下載量由 681,075 降至 409,825 bytes，減少 271,250 bytes（約 40%）。這組手機 LCP 中位數由 2,064 到 2,256 ms，未觀察到初始繪製速度提升；改善主要反映在減少不必要下載及完整 Lighthouse 測量。桌機下載量約 394 KB，基本不變。兩端 CLS 均為 0、無 pageerror。
- 字型仍為 248,012 bytes、font-display:swap，未移除品牌字型或變更字型顯示策略。全站 CSS 仍約 280 KB 未壓縮，另有 Google Analytics 的下載與執行負擔；兩者可作後續評估，不在缺乏充分回歸驗證時直接刪除。

## 驗證與接續

- CI 使用的 Hugo 0.160.1 extended：`hugo --destination public-build-check` 通過；效能比較本身前後均使用 0.166.0。
- `python scripts/url-guard.py check --site public-build-check --moves docs/taxonomy-url-moves.json`：639 個基準網址，0 個新增回歸，3 個既有解析問題。
- `npx playwright test --config .tmp/perf-tests.config.mjs`：18 項全數通過。首頁與圖集測試涵蓋手機／桌機、淺色／深色、320–1440px、再次造訪、五秒輪播、初始靜止、播放按鈕的滑鼠／鍵盤操作、無 JS、減少動態效果；另新增手機隱藏圖片不得提前發出請求與切換後正常載入驗證。
- 原始報告與截圖保存在被忽略的 `.tmp/`：`lighthouse-production-before.json`、`lighthouse-local-before.json`、`lighthouse-optimized-1.json` 至 `3.json`、`perf-mobile-before-results/`、`perf-mobile-optimized-results/`。這些建置與量測產物不提交。
- 部署後重新跑正式站手機 PageSpeed 三次，確認分數／LCP／TBT 與第三方影響；不能把本機測試當作已部署結果。
