# 視覺抽查與 GA4 證據

日期：2026-10-13（Asia/Taipei）。來源 HEAD：`13a21caceea52549ab7a64b74e260412e5024206`，分支 `20261013-1`。

## 範圍與方法

正式站使用 Codex 瀏覽器實際導覽、螢幕截圖與 DOM 唯讀檢查；桌機 1440×1000、手機 390×844。瀏覽首頁首屏／最新／分類／作者／圖集、分類總覽、病痛經驗、長文、短文、關於、全部文章、404、會所專區及手機選單，包含淺色與深色代表樣本。這是全站頁型抽查，並非逐篇文章或完整裝置相容性驗收。

本機另由技術檢查產生十張代表截圖，位於 `.tmp/awards-audit-20261013/screenshots/`。首頁深色及閱讀筆記手機截圖已人工查看；主要構圖與正式站抽查一致。首次截圖偶爾早於圖片解碼完成，後續已確認封面載入，沒有把暫時空白列為圖片失效。

## 已觀察事實與評估

| 編號 | 已觀察事實 | 設計判斷／建議（非量測結論） | 來源 |
| --- | --- | --- | --- |
| V01 | 首頁有獨立 SVG 大字標、河流線、兔子、紙色、固定首篇精選與圖文版面 | 品牌已成立；應延伸為閱讀路徑，而非再擴大字標或填滿留白 | `layouts/partials/river-home.html:6`；`data/river-home.yaml:1` |
| V02 | 最新文章四列有人工摘要；分類五方向＋會所專區已為文字圖示入口 | 保留簡潔入口，新增策展時須有讀者動機與順序，避免另堆一組重複分類卡 | `layouts/partials/river-home.html:35` |
| V03 | 五類與會所已使用書刊列表；病痛頁有「聆聽疼痛計畫」12篇入口及個人書寫15篇 | 分流已有基礎；下一步是推薦第一篇及說明閱讀路線，不必重做分類 | 正式 `/categories/病痛經驗/`；模板細節見 content-ia.md |
| V04 | 首頁有品牌頁尾與導覽；內頁仍顯示 Hugo／PaperMod 頁尾 | 整站收尾語言與閱讀出口尚未一致，建議共用品牌頁尾並提供下一個閱讀目的地 | `layouts/partials/river-home.html:76`；`layouts/_default/baseof.html:38` |
| V05 | 正式長文主標字型序列已為 Merriweather＋中文宋體；段落18px／36px，桌機段落寬640px（post-content外框720px） | 現有正文節奏值得保留；歷史交接「尚未發布」不是現況 | 正式 `/blog/成為自己/正念的意義就在手中/` DOM；`assets/css/extended/zzzzz-article-editorial.css:75`、`:135` |
| V06 | 手機長標題在 breadcrumb 末端與主標重複；短文封面約300px高；正念長文桌機直式封面560×746.7px、開始於y≈359 | 可試簡化手機當前頁 breadcrumb、對直式封面提供文章專屬導言與高度規格；屬編輯選擇，不是溢出缺陷 | 正式長／短文；`assets/css/extended/zzzzz-article-editorial.css:138` |
| V07 | 作者頁有肖像、資歷、網站介紹與2021／2025文字；尚無由經驗通往代表文章的敘事段落 | 將作者、病痛研究與會所工作連成可讀的3–4段故事，串代表文章與原創圖像 | 正式 `/about/` |
| V08 | 圖集含兔子照片等日常影像，alt 為「首頁圖集 n」 | 用真實小標題／圖說與具體替代文字賦予內容意義；不需要把所有照片套同一濾鏡 | `layouts/partials/home-gallery.html:23`、`:33` |
| V09 | 圖集可見時每3秒切換；精選一般互動後每5秒切換；都有 hover／focus／reduced-motion 處理，無持續暫停按鈕 | 補可持續暫停或預設手動；focus離開即恢復不足以讓使用者同時讀其他內容 | `static/js/custom.js:1125`；`assets/js/river-home.js:63`、`:77`；[W3C SC2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) |
| V10 | 正式404頁主體只有巨大「404」，沒有解釋或就地搜尋／推薦 | 把錯誤頁做成可恢復的閱讀入口，保留真正404 HTTP語意 | `themes/PaperMod/layouts/404.html:1`；正式 `/404` |
| V11 | 手機選單開啟焦點移至關閉按鈕、目前會所系列展開；主分類與其他入口層級清楚 | 現有導覽可保留；新敘事入口應接上此層級，勿用拖曳地圖取代正常導覽 | 正式 `/clubhouse/` 手機抽屜 |
| V12 | 會所頁上方有分區導覽，下方有同名類型篩選，代表不同操作 | 可用「完整系列」及「篩選全部文章」標示差異，減少兩列相似選項的理解成本 | 正式 `/clubhouse/` |

## GA4

已依 AGENTS.md 僅確認現有 OAuth／ADC 檔案存在、用戶端為 installed；`get_account_summaries` 本次成功，Property `362788041`。未輸出憑證。報表期間2026-09-15～2026-10-12，均限定 `hostName EXACT listenriver.com`。下列是GA記錄，無法保證全部為自然讀者；正式站人工驗收仍可能包含在其中。

| 裝置 | Sessions | Page views | Engagement rate | Average session duration |
| --- | ---: | ---: | ---: | ---: |
| Desktop | 1,815 | 1,964 | 7.38% | 34.21秒 |
| Mobile | 266 | 355 | 43.61% | 133.28秒 |
| Tablet | 8 | 10 | 50.00% | 177.62秒 |

Page views 合計2,329。分裝置 activeUsers 不加總為去重全站人數。來源維度另記 direct 1,522 sessions／engagement 3.88%，Google organic 363／50.14%；舊 Vercel／GitHub hostname referral 各87／86、engagement皆0，另有本機 referral 2。這些支持先核對測試／轉址／流量品質，不足以斷言機器流量或把低互動率歸因於設計。

最高瀏覽文章《無恥之徒》165 views，首頁145；其他入口包括《成為一個人》46、關於25、會所22。這支持把文章入口與文末續讀納入設計；熱門表不等於 landing page 報表，不能推算有多少人直接從搜尋落到文章。

事件僅回傳 `page_view` 2,329、`session_start` 2,085、`first_visit` 1,962、`user_engagement` 596、`scroll` 516、`click` 7。沒有本次報表可見的站內搜尋、策展路線或續讀專用事件。沒有把 scroll 視為讀完、click 視為所有站內點擊。raw 回應存 `.tmp/awards-audit-20261013/ga-summary.json`。

建議只新增必要的聚合事件：`search_submit`（不傳原始自由文字）、`search_result_click`、`reading_path_start`、`continue_reading_click`。以非敏感預設案例與 path_id／position／template 量測；避免蒐集病痛或求助查詢原文。先整理正式站人工測試辨識方法，再做2–4週基線。

## 尚未驗證

真實 iOS／Android、Safari／Firefox長文操作、VoiceOver／NVDA整段流程、外部網站連結全數HTTP存活、內容圖像授權完整性、讀者任務與CrUX field data均未於本子報告完成。獎項準備須另補這些驗收，不把自動化抽樣通過宣稱為完整WCAG合規。
