# Awwwards／FWA 優化第一批：操作與產物完整性

日期：2026-10-11。分支：`codex/sticky-header-refinement`，來源基準：`4b73bb14`。

## 已實作

- 燈箱開啟後聚焦關閉按鈕；Tab／Shift+Tab 留在視窗內，左右方向鍵換圖、Escape 關閉。背景元素暫設 inert，關閉時復原原有狀態並回到原始觸發圖片；換圖不改變返回目標。
- 修正 visibility 過場阻擋首次聚焦：開啟時立即可操作，保留 opacity 淡入。
- 全站提供第一個 Tab 即可到達的「跳至閱讀內容」，包含首頁、列表、關於與文章頁；啟用後聚焦 main，正文標題不被 Header 擋住。共用樣式包含明暗模式。
- 頁首改用現有 200×200 品牌 PNG 與單色 SVG；16／32 尺寸宣告僅在有明確設定時輸出，移除 extend_head 重複 favicon。瀏覽器主題色改用品牌暖棕。

Header 尺寸、滾動門檻、內容結構、文章 URL 沿用定稿。這批未處理全部文章列表、關於頁構圖、搜尋摘要及品牌策展路徑。

## 查證與驗證

- codebase-memory-mcp root、branch、HEAD 對應目前來源；ready。查詢 openLightbox 後直接核對 JS、baseof、head 等來源，Hugo 動態模板仍有解析缺口。
- Hugo 0.166.0 minified 建置成功，340 頁、72 份分頁、280 aliases。既有 language API 棄用警告仍在。
- 新增 `tests/reader-access.spec.js`：13 項操作／資源測試通過。390／1440、亮／暗、reduced motion；另驗證背景原有 inert 狀態復原。
- 最終完整回歸 60／60 通過（新增 13 項＋既有 47 項），含 Header 分段收合、工具列、首頁、分類與文章版型。
- 612 份完整 HTML 中，圖示引用共 1,065 次（PNG 710、單色 SVG 355），缺檔為 0；文章頁三種 icon 宣告 HTTP 200。
- 截圖檢視手機放大圖片與桌機 skip link；本機 1315 的主腳本 fingerprint 已與本批完整建置 1317 一致。
- 既有滾動測試曾在 domcontentloaded 後立即捲動，受到稍後 pageshow／字型載入重設基準的影響。測試改等 load、document.fonts.ready 與兩次 frame，未變更產品 Header 邏輯。

驗證為 Edge 桌機與手機 viewport 模擬；未做 iOS Safari 實機、加入主畫面或完整 WCAG 稽核。未部署、未 push。

## 下一批

統一 `/blog/` 的列表與頁首尺度：採品牌細線、紙色、較克制的圖片比例，保留既有文章集合、日期排序與分頁。驗收手機／桌機、明暗、長標題、無封面、分頁與返回位置。之後才處理關於頁與搜尋／續讀。
