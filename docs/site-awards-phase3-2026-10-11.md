# Awwwards／FWA 第三階段：找文與系列續讀

日期：2026-10-11。基於 `62bac453`，分支 `codex/sticky-header-refinement`。本輪完成搜尋與系列導航；Header 延用定稿。

## 已完成

- 搜尋結果呈現文章標題、一行分類／日期、正文摘要。標題、分類、標籤與系列標籤以 Pagefind metadata 保留搜尋能力；作者、閱讀時間、目錄、隱藏標題錨點和回頂端按钮不進入摘要。保留既有縮圖與系列快捷入口，延用暖色明暗模式與細線列表。
- 搜尋結果進入文章後，返回搜尋保留查詢與原來位置。記錄目前 history entry，等待被點擊的結果重新載入再還原；讀者開始鍵盤、滑鼠或觸控操作時取消待執行的還原。
- 文章尾端新增系列上一篇、下一篇與原目錄連結。取既有 `seriesLabel` 的數字順序，限定既有 clubhouse 子目錄，不以日期或字串排序，不跨系列接續。首末篇明確提示，連結在停用 JavaScript 時仍可用。
- 來源工作日誌 19 篇、實習紀錄 7 篇、工作手冊 5 篇；工作手冊 03 既有 `draft: true`，公開產物實際為 19／7／4 篇，共 30 篇。工作手冊 02 接公開的 04，未發布草稿。模板遇到重複或不合法編號會報建置錯誤。
- 移除推薦區原本以會所文章日期優先猜測續讀的分支；系列有獨立、明確的入口，其餘同書、同主題、同分類推薦保留。

來源：`layouts/partials/series-context.html`、`layouts/partials/post-series-nav.html`、`layouts/_default/single.html`、`layouts/_default/search.html`、`layouts/partials/anchored_headings.html`、`layouts/partials/post_related.html`、`assets/css/extended/zzzzz-site-editorial.css`。

Pagefind 使用 1.5.2 Extended。metadata 搜尋與排除可見文字採官方支援方式：[metadata](https://pagefind.app/docs/metadata/)、[indexing](https://pagefind.app/docs/indexing/)、[UI hooks](https://pagefind.app/docs/ui/)。UI hook 複製結果 metadata 後整理顯示，避免修改搜尋快取。

## 驗證

- Hugo 0.166.0 minified build 成功：340 pages、72 paginator pages。Pagefind 重建成功，索引 227 頁。既有 Hugo config／Language API 棄用提示仍存在。
- 原本完整回歸集加初版搜尋／系列共 **72 項全數通過**，包含 Header、文章、目錄、首頁、全部文章、關於頁、skip link、燈箱及 reduced motion。
- 畫面收尾後重跑搜尋／系列 **10 項全數通過**：逐一核對 30 篇公開文章兩側連結、首末篇、390／1440px 明暗模式、正文摘要、零結果、清除與 URL 同步、metadata 搜尋、停用 JavaScript、手機／桌機返回搜尋位置。最後字級調整另重跑 4 個明暗／尺寸案例。
- 查詢案例：正念的意義就在手中、英雄之旅、病痛經驗、工作日誌 05、正念的河流；零結果用確認不在索引的 `龘齉麤鱻`。隨機拉丁字串可能與英文詞前綴命中，不能直接假定為零結果。
- 獨立 Hugo fixture：編號 1／3／5 正確依公開順序相接；把 5 改成重複 3 時建置失敗。
- 手機／桌機明暗模式共 8 張搜尋與系列截圖核對；手機系列文字內縮 24px，無水平溢出。搜尋摘要移除隱藏 # 錨點，正文使用正常字重，標題與資訊有清楚層次。
- `git diff --check` 通過。內容、既有網址、草稿狀態均未修改。產物、fixture、截圖留在忽略的 `.tmp/`；本輪未 commit、push 或部署。

本機完整預覽：`http://127.0.0.1:1317/search/`。已將生成的 Pagefind 複製至 1315 本機預覽產物（非來源），確認 `/pagefind/pagefind.js` 回應 200。一般 Hugo 開發 server 若沒有 Pagefind 產物，搜尋測試會明確 skip；完整建置預覽的本次測試沒有 skip。

## 接續方向

下一階段依原評估第 4 項，先設計一條有內容目的的策展閱讀路線，再考慮河流意象與少量過場。效能需另做固定樣本、手機／桌機三次冷載入，本輪未給效能分數或獲獎保證。
