# Header 字體與桌機選單優化計畫

日期：2026-10-11；基準 main 137f5337。此輪只計畫，不修改樣式、不發布。

## 已查證

- 關係圖索引 ready、根目錄正確；header.html 解析不完整，結論以 CSS 來源補查。
- 字標宋體 21px/600，導覽沿用黑體；桌機主導覽受 header-navigation.css 覆寫為 1rem，子項 15px/400。
- zz-publication-header.css 第一層 dropdown 有 0 12px 28px #40352f12 陰影；header-navigation.css 側開次層有 0 18px 42px rgba(15,23,42,.12) 陰影。
- zzzzzzzz-desktop-directory.css 將子項 hover 和 is-active 合併，背景使用 pub-rule（淺色 #e4d5c5、深色 #685346），邊線色兼作整列背景造成偏重。
- 手機 sub-link hover 既有淺底 #f4f1eb，另有不同明暗覆寫；實作前以 computed styles 核對最終結果。
- 報導者首頁最新導覽實測：Roboto Slab、Noto Sans TC 後援序列，18px/400；hover 文字 #404040 → #c40d23，連結背景保持透明。品牌圖形與導覽文字須分開看，不將 logo 判定為一般網頁字型。

## 建議分階段

1. 桌機視覺優先：第一層與側開次層陰影移除，保留紙色背景與 1px 細框；主導覽 hover 只改本站陶土色，子項 hover 採極淡洗色，參考手機輕量感。hover 與目前所在頁拆開，目前頁以文字色及細標記表達，鍵盤 focus 保留清楚外框。明暗分別定義 hover 色，不沿用邊線色。
2. 字體與密度：保留宋體字標、黑體導覽。先固定主導覽約 15px/500、子項 15px/400，移除不一致覆寫；不新增 Header 字型下載。調整視覺 padding 與分隔間距但保持至少 44px 可操作高度。製作現況／新版對照，包含首頁與文章頁。
3. 行為驗收：390/820/900/1440px 明暗模式；桌機 hover 進入、跨到側開選單不意外關閉、點擊、Tab、Enter、Escape、點擊外部；確認所在頁與 hover 可區分、手機展開與捲動鎖不退化、縮放及 reduced motion。Hugo 建置、既有導覽／版面測試、首頁 CSS 子集同步檢查。
4. 驗收後 commit；推送發布另依使用者指示，正式站再核對樣式。

## 來源位置

- assets/css/extended/zz-publication-header.css
- assets/css/extended/header-navigation.css
- assets/css/extended/zzzzzzzz-desktop-directory.css
- assets/css/extended/custom.css
- layouts/partials/header.html
- 參考：https://www.twreporter.org/（本次瀏覽器實測，非僅憑外觀推定字體）

## 實作與驗收

使用者已授權實作。桌機主導覽 15px/500，全部文章與分類層級 600，普通子項 400；目前頁用 600 與細底線區分。第一層外框、內層及側開選單陰影均移除，保留紙色細框；淺色 hover #f6f1ea、深色 #3c332e，主選單保持透明。手機樣式未改，保留宋體字標；不增加字型下載。reduced motion 下停用新增 transition。

Hugo 建置、首頁 CSS 子集同步检查與首輪 42 項測試通過（41.8 秒）；補修內層陰影後重跑導覽測試。首頁／文章 × 390／820／900／1440 × 明暗共 16 組無橫向溢出；桌機計算樣式確認外層與內層 shadow=none、主導覽字重 500。已查看淺色截圖，預覽 http://127.0.0.1:1333/。此為本機結果，尚未 push／發布。
- 最終修正後 13 項導覽測試全部通過（32.3 秒）。
