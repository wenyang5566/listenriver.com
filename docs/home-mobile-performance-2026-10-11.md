# 首頁手機效能檢測與優化（2026-10-11）

## 結果與範圍

正式站 `https://listenriver.com/` 的手機 Lighthouse 已重現 71 分。本次完成首頁圖片與精選輪播載入優化，未變更文章 URL、分類、字型或配色，第一批修正已於本輪接續部署正式站。

| 測試 | 效能分數 | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| 正式站，修改前一次 | 71 | 1.5 秒 | 6.7 秒 | 230 ms | 0 |
| 本機，修改前一次 | 74 | 1.4 秒 | 6.5 秒 | 210 ms | 0 |
| 本機，最終修改後第 1 次 | 89 | 1.4 秒 | 3.3 秒 | 210 ms | 0 |
| 本機，最終修改後第 2 次 | 82 | 1.4 秒 | 4.3 秒 | 190 ms | 0 |
| 本機，最終修改後第 3 次 | 89 | 1.4 秒 | 3.3 秒 | 190 ms | 0 |

修改後分數中位數 89，LCP 中位數 3.3 秒。正式站與本機網路環境不同，不能宣稱正式站已達 89 分；第一批部署後正式站已複測，結果見下方接續紀錄。TBT 仍約 190–210 ms，尚未達到穩定的手機效能綠色區間。

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


## 使用者授權接續：部署與第二批優化

### 第一批部署

- 來源提交 `68f0b28f`，整合遠端既有產物清理提交後，以 `117627f4` 推送 main。
- [Cloudflare Pages](https://dash.cloudflare.com/?to=/0c941e997df8a4fdd3beda8f1ad835b8/pages/view/listenriver/d618513d-e8f0-4f07-a929-944626f4bac8) 部署成功；[Hugo Build](https://github.com/wenyang5566/listenriver.com/actions/runs/38137708454) 與 [Playwright Tests](https://github.com/wenyang5566/listenriver.com/actions/runs/38137708507) 通過。
- 正式站手機三次：77 / 87 / 72 分，LCP 5.1 / 3.9 / 6.4 秒，TBT 70 / 50 / 20 ms，CLS 均 0。網路波動大，不能由先前本機 89 分推定正式站已穩定達標。

### 字型與分析腳本對照

使用同一 Hugo 0.160.1 建置、同一 Brotli 測試伺服器，交錯量測各三次：

| 方案 | 分數 | 分數中位數 | LCP 中位數 | TBT 中位數 |
| --- | --- | ---: | ---: | ---: |
| 原有字型預載 | 88 / 83 / 82 | 83 | 4.28 秒 | 190 ms |
| 取消字型預載 | 81 / 88 / 81 | 81 | 4.36 秒 | 8 ms |
| 首頁字型子集與原字型後援 | 87 / 93 / 87 | 87 | 3.67 秒 | 188 ms |
| 原有字型，封鎖 Google Analytics | 89 / 89 / 89 | 89 | 3.38 秒 | 186 ms |

採用字型子集並保留預載；取消預載未顯示穩定收益。分析腳本對照只能指出頻寬競爭的可能影響，不能把關閉分析所得分數當作部署承諾。

最初的子集試驗發生重複下載，已排除。最後以獨立字型家族與 unicode-range 分隔覆蓋範圍：467 個首頁字元使用子集，418 個其他既有字元使用原字型後援；兩者都缺少的字維持既有系統字型後援，不因檢查缺字而下載完整字型。

### 第二批來源修改

- `static/fonts/river-home.woff2`：121,964 bytes，約比原字型小 51%。保留原本 248,012 bytes 的字型與 OFL 授權。
- `scripts/subset-river-home-font.py`：從 Hugo 產生的首頁、所有輪播文字與 CSS 偽元素文字製作子集及 `assets/css/river-home-font.css`。重製方式為 `python scripts/subset-river-home-font.py public/index.html`，需 fonttools / brotli；目前生成檔作為網站字型來源資產提交，CI 不需 Python 產字型。未來文字增加會自動使用原字型後援，更新子集可重新減少下載。
- `layouts/partials/extend_head.html`：預載首頁子集，字型 CSS 與首頁 CSS 合併為同一請求。
- `layouts/partials/head.html`：首頁排除五份舊首頁、文章與分類專用樣式，使用獨立 stylesheet-home 路徑，避免與其他頁面資源互相覆寫。首頁樣式由 280,848 降至 233,245 bytes（約 17%）；非首頁仍使用原有完整樣式。
- `layouts/partials/google_analytics.html`：首頁建立分析 script 時加 `fetchPriority=low`。原有 requestIdleCallback / 互動啟動、Do Not Track、測量 ID、dataLayer 與 config 事件均保留，未另加延遲或改為僅互動才追蹤。

### 第二批驗證

- 42 項首頁、圖集、文章、分類與手機導覽測試通過；新增實際字型請求、後援字元與分析只初始化一次的驗證。
- 對照 390px / 1440px、淺色 / 深色：每組 754 個元素，矩形尺寸與位置、字級／粗細／行高、顏色、背景、內外距與圓角均無差異。字型家族名稱依設計變更，但目前文字的字形、度量與閱讀外觀維持一致。
- 最終本機三次為 81 / 89 / 87，LCP 4.5 / 3.6 / 3.6 秒，TBT 200 / 110 / 180 ms，CLS 均 0。對照基準為同版 Hugo 的原字型預載 83 分中位數；這不等於正式站達標。
- 原始資料：`.tmp/font-experiments/ranged-*.json`、`.tmp/lighthouse-production-deployed-*.json`、`.tmp/lighthouse-round-two-*.json`、`.tmp/round-two-visual/comparison.json`；不提交產物。
- Google Analytics 後台連線回覆 invalid_grant（授權已過期或撤銷），無法查核報表入庫。初始化與請求驗證不代表能證明所有快速離站都已計入統計。

- 使用全新 `.tmp/round-two-production` 目的地完成 Hugo 0.160.1 minify + Pagefind 1.5.2 建置：227 篇搜尋索引、639 個網址基準、0 新回歸（3 個既有解析問題）。預設 public 曾混入舊 localhost canonical，因此未用其網址結果作本輪部署依據。


### 第二批正式部署與複測

- 來源提交 `10bb3ec3` 已推送 main 並部署成功。[Cloudflare Pages](https://dash.cloudflare.com/?to=/0c941e997df8a4fdd3beda8f1ad835b8/pages/view/listenriver/4bc40c69-e291-4b8f-991a-614cec971090)、[Hugo Build](https://github.com/wenyang5566/listenriver.com/actions/runs/38139337828)、[Playwright Tests](https://github.com/wenyang5566/listenriver.com/actions/runs/38139337850) 全部成功。
- 正式站實際只請求 `/fonts/river-home.woff2`，encodedBodySize 121,964 bytes；使用 stylesheet-home 與合併後的首頁 CSS，無 pageerror。
- Google Analytics 的 script 使用 low 優先級；實際 `page_view` 請求收到 204。這可證明事件已送出並獲回應，不能替代已失效授權的 GA 報表入庫查核。
- 正式站手機三次為 **81 / 65 / 71**，FCP 2.5 / 2.6 / 2.7 秒，LCP 4.4 / 6.3 / 4.5 秒，TBT 40 / 240 / 240 ms，CLS 均 0。**分數中位數 71，尚未穩定提升至 90；不能宣稱本機中位數代表正式站結果。** 原本 71 分僅量測一次，樣本不足以判定分數回歸，但本輪也沒有證明正式分數已穩定改善。
- 三次實際 LCP 資源發現等待已降到約 7–23 ms；渲染等待約 528 / 2,193 / 2,216 ms。主執行緒 style/layout 約 1,183 / 740 / 725 ms，仍需關注渲染；單憑下載量不能解釋全部分數波動。
- 固定首篇、封鎖第三方的冷快取測試：手機下載由 681,075 降至 279,978 bytes（減少約 59%）；桌機由 394,155 降至 264,532 bytes（減少約 33%），CLS 均 0。最終手機 LCP 中位數 2,300 ms，桌機 552 ms；初始繪製未顯示同等幅度的改善。
- Google PageSpeed 官方 API 回覆 429（共享未驗證服務每日額度已滿），未取得新的官方服務分數；以上分數均為本機 Chrome 對正式站執行的 Lighthouse 手機模擬，應與使用者於 PageSpeed 網站看到的分數區分。
- 原始正式資料：`.tmp/lighthouse-production-final-1.json` 至 `3.json`、`.tmp/production-round-two-smoke.json`、`.tmp/round-two-first-party-results/results.json`。


### 最後的動態效果對照

同一整合版本交錯測兩次：持續動畫為 69 / 77 分，暫停所有首頁 CSS 動畫為 69 / 78 分；LCP 均分別 4.9 / 4.6 秒。暫停能降低 style/layout 時間，但沒有足夠分數或 LCP 收益，未採用動畫行為變更。保留既有河流動態效果，避免為不確定收益改變閱讀風格。原始資料為 `.tmp/motion-active-*.json` / `.tmp/motion-still-*.json`。

最後的報告提交僅更新文件，以 `[skip ci]` 前綴避免重做相同網站部署；網站程式碼仍以已通過所有檢查的 `10bb3ec3` 為上線版本。[Cloudflare 的略過文件建置指引](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/#skipping-a-build-via-a-commit-message)。

下次接續應使用 PageSpeed 網站重新取得獨立測試環境的數據，或完整追蹤首屏渲染等待；不要以先前最高一次分數當作穩定結果。GA 報表查核需恢復連線授權。

## GA 恢復後接續：第三批首頁共用 CSS

- 2026/10/11 GA MCP 已成功讀取帳戶與即時報表，Property ID 為 `362788041`（wenyang-blog）。當日核心報表可讀到 desktop 377、mobile 11 次 page_view；即時報表亦收到事件。這證明報表讀取與事件入庫可用，不是效能改善的因果證據，也不是 Web Vitals 資料。
- 開始時 main 為 `4d5888e5`，正式站仍使用第二批的 stylesheet-home。新的正式站手機 Lighthouse 為 73 分，FCP 2.7 秒、LCP 6.2 秒、TBT 10 ms、CLS 0。CSS coverage 預估共用樣式 88.2% 初始未使用；不能直接刪除，因為隱藏選單與互動仍需要樣式。
- 新增 `assets/css/home-shared.css`，首頁以此替換 `custom.css`，保留原先插入順序。其他頁面仍用完整 custom.css；所有既有網址與內容結構保留。
- `scripts/subset-home-css.mjs` 以建置後的完整首頁標記（包括隱藏輪播及導覽）與共享 JS 動態 class 作保守篩選。使用 PostCSS 保留原始宣告、vendor properties、media queries、動畫與規則順序；有可能匹配的整組 selector 保留，不只依首屏 coverage 篩選。保留 268 個規則、排除 1,274 個不適用規則。
- 子集作為來源資產提交，`--check` 模式納入 Hugo CI，避免修改共用 CSS、首頁標記或 JS class 後忘記重製。重製命令與驗證要求記錄於 CONTRIBUTING.md。OAuth JSON 與 ADC 不加入 Git。
- 首頁 stylesheet-home 從正式站約 233,239 bytes 降為 83,670 bytes（未壓縮，約減少 64%）。首頁仍為兩個 CSS 請求，不新增第三方服務。
- 320 / 390 / 820 / 1440px × light / dark 共八組，每組 754 個元素，尺寸位置、字型、色彩、邊框、陰影、顯示、溢出、grid 與其他比對屬性均無差異。42 項首頁、圖集、手機與桌機導覽、文章與分類回歸通過。Hugo 0.160.1 minify 與 Pagefind 1.5.2 建置成功，227 頁索引；639 網址基準 0 新回歸、3 個既有解析問題。
- 同一 Brotli 伺服器、Lighthouse 13.5 手機模擬，依序交錯三組：原版本 92 / 84 / 83，精簡實驗 88 / 70 / 94。第三方網路及 TBT 波動明顯；原版 LCP 中位數 3.74 秒，實驗版 2.56 秒，但不能依此承諾正式站分數。一次與測試並行的初步量測未納入比較。
- 最終保留原始跨瀏覽器宣告版本，獨立量測三次為 87 / 87 / 87，FCP 約 1.26 秒、LCP 3.63 / 3.63 / 3.67 秒、TBT 197 / 195 / 186 ms、CLS 均 0。兩份 CSS 合計傳輸量由 47,556 降至 25,523 bytes（約減少 46%，本機 Brotli5）。這是本機量測，發布後仍需正式站複測。
- 本輪產物位於 `.tmp/perf-resume-*.json`、`.tmp/perf-resume-visual/` 與 `.tmp/perf-resume-final/`，不提交建置與測量產物。

### 第三批正式部署結果

- 來源提交 `e2390a06` 已發布。[Cloudflare Pages](https://dash.cloudflare.com/?to=/0c941e997df8a4fdd3beda8f1ad835b8/pages/view/listenriver/9c42f646-102e-4c7f-a4a7-2723e565aacf)、[Hugo Build](https://github.com/wenyang5566/listenriver.com/actions/runs/38143052798)、[Playwright Tests](https://github.com/wenyang5566/listenriver.com/actions/runs/38143052787) 與 Worker check 全數通過，新增子集同步守門亦通過。
- 正式 HTML 使用 `stylesheet-home.f9ad77913d3a418987d30f56ec22413ee66529fa4fbe94b9686b199d2e60bb4f.css`，HTTP 200、解壓後 83,664 bytes（約減少 64%）；正式兩份 CSS 合計傳輸約 28.4–28.9 KB。僅下載首頁字型子集，GA page_view 回傳 204、無 pageerror。
- 正式站依序量測五次，全部保留，沒有排除低分樣本：

| 次數 | 手機分數 | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 96 | 1.32 秒 | 2.67 秒 | 46 ms | 0 |
| 2 | 94 | 1.32 秒 | 3.04 秒 | 49 ms | 0 |
| 3 | 69 | 2.58 秒 | 6.07 秒 | 156 ms | 0 |
| 4 | 69 | 2.60 秒 | 6.08 秒 | 135 ms | 0 |
| 5 | 83 | 1.31 秒 | 4.63 秒 | 74 ms | 0 |

- **五次中位數 83，LCP 中位數 4.63 秒，尚未穩定達到 90 分或 LCP 2.5 秒。** 上批正式三次中位數為 71，本批觀察到較高的分數中位數，但樣本數與測量時段不同，不把差值當作穩定提升承諾；前三次的中位數 94 已由完整五次結果取代。
- 第三次慢樣本的 HTML 約 352 ms、CSS 約 522–535 ms、字型約 565 ms 完成；LCP 圖片資源載入約 181 ms、發現等待約 11 ms，但元素渲染等待約 2,080 ms。快樣本渲染等待約 248 ms。Style/Layout 在慢樣本約 638 ms，快樣本約 914 ms，因此不能把慢樣本直接歸因於更多 CSS 執行或較慢網路；下一輪應追蹤繪製／圖片解碼與主執行緒時序，現階段原因尚未完全定位。
- 官方 PageSpeed API 再試仍回傳 429（共享專案每日額度）；所有分數均為本機 Chrome Lighthouse 13.5 對正式站的手機模擬，不是 PageSpeed 網站的新服務結果或 CrUX field data。
- GA hostname 分組顯示當日 `127.0.0.1` 381、`listenriver.com` 46、`wenyang.vercel.app` 6 次頁面瀏覽（查詢時快照）。先前裝置分組混入本機測試流量，不能當作正式訪客數；後續分析須限定 `hostName=listenriver.com`，且正式域名也可能包含 Lighthouse 測試。未在本輪變更 GA 收集行為或刪除歷史事件。
- 正式原始報告：`.tmp/perf-resume-production-1.json` 至 `5.json`；上線 smoke：`.tmp/perf-resume-production-smoke.json`。
