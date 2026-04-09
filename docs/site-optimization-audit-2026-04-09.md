# listenriver.com 優化評估（2026-04-09）

> 評估範圍：首頁資訊架構、SEO/索引、效能、可用性與內容營運。

## 觀察摘要（Evidence）

1. 網站使用 Hugo + PaperMod，自訂首頁分區輪播（精選、閱讀筆記、電影筆記、社會工作、自我成長、日常書寫、Clubhouse、最新文章）。
2. 已啟用 `enableRobotsTXT: true`、GA4、JSON 輸出、RSS、Open Graph / Twitter Card / Schema 模板。
3. 站內存在非常大的動圖與媒體檔（例如 `static/images/mao_6.gif` 約 12.6MB、`mao_1.gif` 約 6.9MB）。
4. 關鍵導覽目前以「首頁 / 最新文章 / Clubhouse / 主題總覽 / 關於我」為主，首頁大量依賴輪播互動。
5. 自訂 sitemap 僅收錄有限路徑（首頁、幾個主要清單頁、`/blog/*`、`/categories/*`），未包含 `/tags/*`。

## 優先優化清單（依影響力排序）

### P0（建議 1–2 週內）

1. **首頁第一屏內容「去輪播依賴化」**
   - 問題：首頁多區塊採水平輪播，重要內容對鍵盤/讀者模式與低互動裝置較不友善。
   - 建議：每區至少保留 3–4 張「直接可見卡片」，輪播作為增強而非唯一入口。
   - 成效指標：首頁文章點擊率（CTR）提升、行動端停留時間提升。

2. **大檔媒體治理（尤其 GIF）**
   - 問題：目前資產中有 MB 等級 GIF；即使未必全部載入，仍提高誤用風險與維運成本。
   - 建議：
     - 優先改為 MP4/WebM + poster 圖（保留 GIF 僅必要情境）。
     - 建立「上稿前壓縮規範」：封面圖目標 < 250KB、內文圖 < 350KB。
   - 成效指標：LCP、首頁總傳輸量、CDN 流量成本。

3. **搜尋入口強化**
   - 問題：站內內容量大，但主選單未給明顯「主題/標籤探索」策略（目前偏輪播瀏覽）。
   - 建議：
     - 導覽列加入「熱門標籤」或「主題索引」。
     - 首頁新增「快速入口（新訪客常看）」模組（如：助人工作、閱讀心得、病痛書寫）。
   - 成效指標：站內搜尋使用率、每次工作階段頁數、跳出率。

### P1（建議 1 個月內）

4. **sitemap 收錄範圍擴充**
   - 問題：目前 sitemap 邏輯未收錄 `/tags/*`，不利標籤頁索引與長尾查詢曝光。
   - 建議：在 `layouts/sitemap.xml` 納入重要 tags 頁（可排除分頁頁碼）。

5. **結構化資料完整度提升**
   - 問題：已具備 schema 模板，但建議補齊作者社群 `sameAs` 與出版者資訊，以利搜尋引擎實體辨識。
   - 建議：在站點參數中補齊 `params.schema.sameAs`（Facebook、可能的 Medium/GitHub/IG）。

6. **內文圖片一致採 responsive pipeline**
   - 問題：雖已有 `optimized-image` 與 render-image 邏輯，但歷史文章仍可能混用原圖格式。
   - 建議：
     - 定義內容編輯規範：優先 WebP、標準寬度（例如 1200px）。
     - 對歷史熱門文章批次重製封面與首圖。

### P2（持續優化）

7. **內容更新節奏可視化**
   - 問題：目前各主題更新頻率差異較大，首頁可能被特定欄目主導。
   - 建議：
     - 新增「本月更新」模組，顯示最近 30 天新增篇數（依分類）。
     - 建立季度內容節奏表（閱讀/社工/電影比例）。

8. **可及性（A11y）檢查與修補**
   - 建議重點：
     - 輪播控制按鈕加上 `aria-controls` 對應容器。
     - 確認鍵盤焦點可完整進出輪播與手機側欄。
     - 補充 `skip to content` 連結，降低重複導覽成本。

## 可直接執行的「本週 Quick Wins」

1. sitemap 納入 tags 頁。
2. 設定 schema `sameAs`。
3. 建一份圖片上稿規範（含尺寸與檔案大小上限）。
4. 首頁每個分類區塊先固定顯示 3 張卡，再提供「查看全部」。

## 本次檢查使用到的命令

- `rg --files | head -n 80`
- `sed -n '1,260p' hugo.yaml`
- `find static/images content -type f \( -name '*.jpg' -o -name '*.png' -o -name '*.gif' -o -name '*.webp' -o -name '*.webm' \) -printf '%s %p\n' | sort -nr | head -n 20`
- `rg -n "loading=|lazy|webp|srcset|schema|json-ld|og:|twitter:" layouts themes -g '*.html'`
- `sed -n '1,220p' layouts/partials/header.html`
- `sed -n '1,260p' layouts/index.html`
- `sed -n '1,220p' layouts/sitemap.xml`

## 補充

- 嘗試以 `curl` 直接抓取線上站台時，於本環境遇到 `403`，因此線上檢視主要改以瀏覽工具讀取頁面文字結構。
