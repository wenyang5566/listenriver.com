# 首頁會所文章滑動軌道：設計保留筆記

記錄日期：2026-09-29。

## 保留狀態

首頁已在提交 `a4851bb7` 移除這個區塊的呼叫，原因是會所文章與全站最新文章重複，並非否定滑動軌道設計。原本的模板、CSS、JavaScript 都仍保留在專案，可供未來重用。

使用者最新決定：六張主題大卡維持原樣；暫停六卡簡化及首頁 tag 區方案；Hero、精選也不修改。這份筆記只保存設計，不代表要恢復區塊。

## 設計構成

- 原位置：首頁六張主題卡之後、最新文章之前。
- 標頭：英文 Clubhouse Model、中文「會所模式」，右側「查看更多」連到 `/clubhouse/`。
- 內容：取會所 section 遞迴文章，依日期由新到舊，最多八篇。
- 卡片：封面、分類色標、文章標題、日期、可選閱讀時間，以及截短至 92 字元的摘要；整張卡片連到文章。標題優先使用 displayTitle，否則使用 Title。
- 圖片：沿用 cover partial，lazy loading，響應式尺寸；不另存一份封面圖片。
- 軌道：橫向 flex、原生 overflow-x 滾動、隱藏捲軸、scroll-snap proximity，兩側有前後箭頭。
- 箭頭操作：平滑捲動；依卡片寬度加 gap 計算步距，桌機大尺寸以約兩卡、中尺寸約一點五卡、小尺寸一張卡為上限基準，另限制不超過軌道寬度的九成。不是自動播放輪播。
- 起訖狀態：scroll／resize 時更新箭頭 class；起點使用 is-disabled，終點使用 is-at-end。這是既有實作描述，不代表原生 disabled 或完整鍵盤行為已驗收。
- 手機覆寫：小尺寸卡片改成左圖右文的緊湊樣式；模板為第四篇起加 mobile-extra class，另有「查看更多會所模式」按鈕，點擊加 is-expanded 並更新 aria-expanded。不同斷點另有箭頭／卡片顯隱規則，重用時需整體核對 CSS，不宜只複製基礎軌道樣式。

## 相關檔案

| 檔案 | 用途／定位方式 |
| --- | --- |
| [home-clubhouse.html](../layouts/partials/home-clubhouse.html) | 完整區塊模板，目前仍在；接收 dict 的 pages |
| [custom.css](../assets/css/extended/custom.css) | 搜尋 home-clubhouse、home-discovery-section-clubhouse、mobile-extra；含基礎卡片、軌道、箭頭、響應式及明暗樣式 |
| [home.css](../assets/css/extended/home.css) | 手機覆寫，搜尋相同 class；需與 custom.css 一起檢查 |
| [custom.js](../static/js/custom.js) | 搜尋 data-clubhouse-slider、data-mobile-clubhouse-toggle；分別為橫向捲動與手機展開 |
| [cover.html](../layouts/partials/cover.html) | 卡片封面與圖片處理依賴 |
| [reading-time.html](../layouts/partials/reading-time.html) | 閱讀時間依賴 |
| [index.html](../layouts/index.html) | 原來組裝首頁並傳入文章集合的位置；呼叫已移除 |

## 恢復原用途的方法

在首頁 main block 內、第一頁內容渲染之前準備資料：

```go-html-template
{{- $clubhouseSection := site.GetPage "section" "clubhouse" -}}
{{- $clubhousePages := slice -}}
{{- with $clubhouseSection -}}
  {{- $clubhousePages = first 8 (sort .RegularPagesRecursive "Date" "desc") -}}
{{- end -}}
```

在 `.home-discovery` 內需要的位置加入：

```go-html-template
{{- partial "home-clubhouse.html" (dict "pages" $clubhousePages) -}}
```

這些是恢復範例，本輪沒有加回。原始呼叫也可從 `a4851bb7` 的 diff 或其 parent 取得，不必整筆 revert 而撤回其他文件。

## 未來改作其他主題軌道

可保留「橫向文章卡片＋前後箭頭」形式，改由呼叫端傳入指定集合。若同頁放多組，先將標題、區塊 id、目的地與按鈕標籤參數化，避免重複 id 及殘留會所命名。樣式依賴 home-discovery 等父層，不能假定移到任意頁就有相同外觀。

恢復或重用時重新檢查：手機／桌機與斷點附近、明暗模式、觸控滑動、箭頭起訖、鍵盤焦點、減少動態效果、圖片載入，以及是否再次與最新文章大量重複。

本次為來源設計筆記，沒有新建可執行展示或重跑已移除軌道的互動驗收。
