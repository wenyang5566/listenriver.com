# Header 暗色模式診斷

日期：2026-10-11。分支 `codex/sticky-header-refinement`；捲動調整提交 `61477541`。本文件為提交後的診斷，尚未修改暗色樣式。

## 結論

桌機與手機都存在同一個問題：頁面頂端的 Header 是書刊暖棕，捲動後 `.is-scrolled` 讓舊暗色樣式覆蓋新色票，顯示冷黑。不是 theme 切換失效，也不是手機獨有問題。

## 證據

先用 codebase-memory-mcp index_status 確認專案根目錄與索引 ready，search_graph 定位 `zz-publication-header.css`、`zzz-publication-site.css` 與 `header-navigation.css`；關鍵結論以目前原始碼和 Edge computed style 確認。

本機 1315，抽查 `/blog/成為自己/正念的意義就在手中/`，390／1440 × 900、暗色模式。先讀頂端樣式，再捲至 200px，以既有 `navigation:reveal` 事件顯示 Header，檢查捲動後狀態與搜尋面板；手機另開 drawer。

| 可見元件 | 頂端 | 捲動後顯示 |
| --- | --- | --- |
| 手機 Header 上層 | `rgb(52,44,40)` | `rgba(13,17,23,.98)` |
| 桌機 Header 上層／分類列 | `rgb(52,44,40)` | `rgba(13,17,23,.98)` |
| 正文背景 | `rgb(52,44,40)` | 同左 |
| 搜尋框 | `rgb(52,44,40)` | 同左 |
| 390px 手機 drawer | `rgb(52,44,40)` | 同左 |

暖棕為 `#342c28`，冷黑為近 `#0d1117`。桌機 Header 外殼為透明；判斷可見底色須檢查內層 `.header-top-shell`／`.header-nav-shell`，不能只看 `#site-header`。

## CSS 根因

- `static/js/custom.js:60` 在 y > 8 時加上 `.is-scrolled`。
- `assets/css/extended/custom.css:8412` 的 `[data-theme="dark"] .personal-header.is-scrolled .header-top-shell` 及 nav 對應規則，設定 `rgba(13,17,23,.98)`；specificity 為 0,4,0。
- `assets/css/extended/zz-publication-header.css:5` 的 `.publication-header.personal-header .header-top-shell`／nav 規則設定 `var(--pub-paper)`，specificity 為 0,3,0。雖較晚載入，仍被上述較高優先序規則覆蓋。
- `assets/css/extended/zzz-publication-site.css` 已將 `--pub-paper` 接到暗色 `--river-paper: #342c28`；computed style 確认變數值正確，問題在背景屬性的競爭。

## 建議下一批修復

在書刊 Header 的共用樣式中明確涵蓋 `.is-scrolled` 上下兩層，使用共用色票並提供足夠 specificity；限定 publication header，保留原有定位、分段收合、透明外殼與事件邏輯。避免全站用 `!important` 壓過所有舊樣式。

驗收應涵蓋亮／暗模式、頂端／捲動後／精簡恢復、搜尋、桌機 dropdown、手機 drawer 與 820px 中間斷點。此次 390px 的 drawer 與搜尋框未重現冷黑，1440px 不可見 drawer 的 computed 背景仍為旧冷黑，不能把它當桌機可見缺陷；820px 的實際 drawer 仍待檢查。

截圖與原始 CSS 命中規則留在忽略的 `.tmp/sticky-audit/header-dark-*`。未修改 Header CSS、未部署、未驗證實機 Safari；此診斷文件尚未提交。

## 後續實作

依使用者要求移除舊冷黑色：將 `custom.css` 中 personal header、捲動後上下層及 dropdown 的舊背景改為 `var(--pub-paper, var(--theme))`，直接修正問題規則，未新增 `!important`。`header-navigation.css` 的 drawer 改用同一色票；publication drawer 的文字與背景規則由 640px 擴至 860px，涵蓋 820px 中間尺寸。另移除亮色 dropdown 的舊純白 important 背景選擇器，讓選單使用書刊紙色。

新增六種尺寸／明暗模式組合的色票驗證，涵蓋頂端、隱藏後恢復、桌機精簡、搜尋、dropdown 和 drawer。暗色 computed style 與修正後截圖確認上下層維持 `rgb(52,44,40)`，與正文一致；原始診斷腳本重跑後 `.tmp/sticky-audit/header-dark-*` 已更新為修正後證據。捲動門檻與 JS 未變更。工具列既有测试補上保護期等待，避免在 400ms 保護期內測新的向下收合。
