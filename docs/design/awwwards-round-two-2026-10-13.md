# 第二輪：操作與互動品質

日期：2026-10-13。分支 `codex/awwwards-phased`，與第一輪使用同一獨立 worktree。
預覽 <http://127.0.0.1:1341/>；網站與 Worker 均尚未發布。

## 完成項目

- 精選輪播增加「暫停動態／繼續動態」控制，同時停止河流等重複裝飾動畫。移開滑鼠、焦點、手動換篇或從 About 返回都不解除讀者暫停；同一分頁 session 保留偏好。暫停偏好下重新載入，一次性的字標進場動畫直接顯示完成狀態，避免圖案停在被裁切的初始狀態。減少動態時停播，控制顯示「已減少動態」。既有五秒週期、滑動與鍵盤換篇保留。
- 圖集仍是小圓點外觀；手機按鈕 28×44px、桌機 44×44px。窄至 320px 可容納全部按鈕，active 圓點以 pseudo-element 呈現。
- 文章統計離線狀態不再降低文字透明度；手機工具列文字改為實色。深色作者連結加文字底線，辨識不只靠顏色。
- 留言／喜歡按鈕使用可見文字與計數構成名稱；字級名稱含可見 Aa／字級及目前狀態。按讚失敗提供可見、可讀出的重試提示，成功清除錯誤，等待期間忽略重複點擊。互動 key、留言服務與重複按讚的既有語意保留。
- 正念文章六個直接接在 H1 後的 H3 調整為 H2；段落原文與標題文字不變，原標題錨點保持相同。
- 404 改為中文標題、說明、搜尋與首頁／所有文章／分類出口；HTML title 中文，robots 為 noindex, follow。
- Header 診斷後只修測試採樣：在同一次 browser evaluate 內切換狀態、建立並暫停 transition、固定 140ms，再讀 computed style。增加動畫確實存在的斷言，保留原透明度與位移斷言；產品 CSS 動畫未改。
- Worker 修正新列首筆 views／likes 為 1。執行期檢查 JSON 物件、post 字串、合法路徑與長度；錯誤回 400／413，DB 錯誤回一般 500 訊息。既有編碼 interaction key 保留，upsert 仍為原子增量。

## 維護與建置

同步 `home-shared.css`（270 條保留規則）與首頁字型子集（120,440 bytes）。Worker 原 `wrangler check` 只顯示子命令說明，改為 TypeScript 檢查＋Wrangler dry run；補齊 tsconfig 所需型別、本機 D1 測試與 lockfile。Worker CI 改 Node 22、npm ci，執行真正檢查與測試；網站 CI 的 Node 20 保持原設定。

本機 Node 為 Windows ARM；已取得官方 Windows x64 workerd 並確認相容模式能執行，僅放於忽略的本機相依與 `.tmp`，沒有把二進位加入來源。

## 驗證

96／96 既有 Playwright 測試通過（1.8 分鐘）。5／5 新操作案例通過：錯誤重試與重複點擊、320／390／1440px 圖集及 404 找文、返回頁面後持續暫停。Header 舊失敗已可重現地通過，沒有放寬斷言。

Worker TypeScript＋dry-run 通過；本機 Miniflare D1 測試通過，覆蓋首筆增量、stats 初始化、35 個無效請求、10 次並行 likes、編碼 key 與一般 500 回應。不操作正式 DB，也不將本機結果寫成正式服務通過。

390px 首頁、代表文章、404 的明／暗共六組，axe 4.14 的 color-contrast／target-size／label-content-name-mismatch／heading-order 未回報 violation。color-contrast 仍有 incomplete（背景／非可見範圍需人工判讀），不能宣稱整站 WCAG 驗證完成；另量測指定小字與連結前景／紙色、透明度合成後對比，並檢視代表畫面。

最終 Hugo 0.160.1 extended 建置、Pagefind、27／27 搜尋案例與首頁 CSS 子集檢查通過；639 條網址基準沒有新增回歸，3 個歷史解析問題保留。指定文章小字對比：淺色 5.52:1、深色 7.59:1；手機工具列合成透明度後為 8.74:1／7.38:1。最後補正後再跑 9／9 相關案例通過，含重新載入後暫停仍保留且字標完全顯示，以及 404 中文 title／noindex。原始 JSON、測試 log、截圖都存 `.tmp/phase-one/`，不提交產物。

依據：[W3C 持續暫停說明](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)、[Cloudflare D1 SQL 語意](https://developers.cloudflare.com/d1/best-practices/query-d1/)。

## 下一輪

第 3 輪開始閱讀河流局部原型：自身病痛 → 閱讀理解 → 對話 → 工作現場，先連起首頁入口、導讀與文末一個主要下一篇，再比較手機／桌機的效果。真機 Safari、讀屏與新讀者任務仍待取得，後續分開記錄。
