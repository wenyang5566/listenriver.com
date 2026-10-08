# 新 Logo 融入首頁

2026-10-08。基準：PR #59、`codex/hero-flow-evaluation`、`1a842675`。本輪是本機設計試版，尚未提交、推送、合併或部署。

## 設計與接入

### 放大 Logo 與主副標整合（現行試版）

Hero Logo 由構圖寬度的 14.3% 放大為 24%（桌面約 80 → 134px，放大約 68%）。主標及副標共用 28% 左側起點，形成左側圖形、右側兩行文字的品牌組合。保留整個開場原有高度，兔子位置與尺寸不變。

出口延伸改為填色帶狀曲線，從放大後 Logo 的出口粗度連續收至 2.4 單位，解決原先粗線突然接細線的斷層。小分岔亦採 2.4 單位，移除淡色第三條線。主線兩秒揭露，分岔稍後展開；支援減少動態。此節取代下方歷史試版的線寬與位置描述。

### 原稿延伸試版

依使用者提供的手繪原稿，在 Logo 出口附近以獨立曲線接應，主線沿主標下緣起伏，在「聽」與「的」之間向上分出小回旋，再於「流」字右下收尾。取代第一版獨立的雙線底線，讓圖形與字標形成連續構圖。`river-brand-flow.html` 獨立管理這組線條，原有字形及定稿 Logo 均保留。

河線兩秒展開，分岔與淡色副線依序出現；支援 hover 的裝置在主標上停留時，小分岔以兩度幅度輕轉並回復。減少動態模式顯示靜態完整圖形。手機使用同一套等比例構圖，不依賴 hover。兔子 partial、樣式、座標及尺寸均維持原版。

以已審定的陶土耳廓 × 河青河線為品牌識別，首頁完整圖形與既有端正 SVG 字標並列；字標下方改為細河青雙線。保留定位副標、開場與精選的銜接、兔子及背景水流。沒有為 Logo 加入旋轉、循環或形變動畫。字標河線維持首次展開與 reduced motion 行為。

共用頁首以小尺寸定稿 Logo 取代舊耳朵，因此首頁與內頁使用相同識別。`brand-logo.html` 於建置時讀取正式彩色 SVG，保留全部 path、線寬與 64×64 viewBox，透過 CSS 變數切換審定的深色配色。輔助技術讀取既有品牌連結及 h1 文字，旁邊的圖形隱藏，移除 SVG title id 避免重複。

## 修改範圍

- `layouts/partials/brand-logo.html`：正式 SVG 共用入口。
- `layouts/partials/listen-mark.html`：頁首沿用既有呼叫位置。
- `layouts/partials/river-wordmark.html` 與 `scripts/build-river-wordmark.py`：首頁構圖及製作來源同步。
- `assets/css/extended/zz-publication-header.css`：正方形 Logo 尺寸及深色配色。
- `assets/css/river-home.css`：Logo 與字標比例、明暗配色、細河線。
- `static/images/brand/listenriver-logo.svg`：建置依賴的定稿來源，後續提交必須包含。

原有定稿單色／深色檔仍保留。歷史版本、Hero 生長插畫與獨立試排頁不作為網站接入來源。未修改 favicon、兔子 partial、兔子 CSS、文章內容或網址。

## 驗證

- Hugo 0.160.1 extended 執行 `--destination public-build-check` 成功。
- Edge／Playwright 檢視 320、390、768、1440px 明暗模式，無橫向溢出。
- 八組明暗畫面中的兔子 x／y／width／height 與修改前完全相同，首頁開場高度也相同。
- 既有 14 項 Playwright 回歸全部通過：輪播切換、五秒自動播放與暫停、鍵盤、手機 sticky／選單、明暗與減少動態、無 JavaScript、文章與分類版型。

畫面、尺寸資料與本輪測試設定保存在 Git 忽略的 `.tmp/audit-logo/`；不提交建置或測試產物。本機預覽為 `http://127.0.0.1:14145/`，不是遠端部署網址。
