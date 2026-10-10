# 全站導覽目錄試版

分支：codex/sticky-header-diagnosis。桌機與手機共用六個同級入口：閱讀筆記、日常書寫、成為自己、病痛經驗、助人工作、會所模式。原有資料仍是五個分類與會所專區；未更動內容或網址。

主入口只開合選單，不直接跳頁。展開後第一項「全部文章」連到既有分類／會所頁，再列子題／系列。篇數只在展開列表顯示，總數與子題數統一靠右；會所總數採 section 的 RegularPagesRecursive，不加總可能重疊的分類。

手機：抽屜 min(360px,84vw)，外側遮罩可點擊收起。主列全列可按，＋／−表示狀態，分類字級19px、子題16px；一次展開一组，目前頁面所在組預先展開。修正 header transform 導致背景遮罩只覆蓋 header 高度的問題。

桌機：六個入口置中，完整名稱與箭頭為單一按鈕；滑過預覽、點擊開合、Enter 操作、ArrowDown 進入第一項、Escape 關閉並返回按鈕，點外部關閉。收合時子連結 inert，避免鍵盤進入隱藏區域；最後一組下拉靠右對齊，避免超出視窗。

來源：layouts/partials/header.html、static/js/custom.js；手機／桌機樣式分別為 zzzzzzz-mobile-directory.css 與 zzzzzzzz-desktop-directory.css。共用 site-nav-items 資料中的會所項目提升至同級，保留三個系列目的地；原有 partial 篇數計算保持不變。

驗證：手機320／390／430／820px明暗模式8項、桌機900／1440px明暗模式4項，以及文章位置提示、背景鎖定、旋轉與閱讀位置保留情境。Hugo 0.166.0 建置通過；既有語言 API 棄用警告仍在。截圖留於忽略的 .tmp/sticky-audit/。正式站與真實 iPhone Safari 尚未驗證；本批未部署。

收尾：主分類與所屬子題使用陶土色提示，只有確切目前頁面才標 aria-current=page；中文網址透過 site.GetPage 的 RelPermalink 正規比對。桌機下拉加入滑鼠通行區，Escape 在指標仍位於選單上時也確實收合；方向鍵焦點等候下一幀，避免 visibility 動畫阻止焦點移入。手機根節點鎖定推廣至內頁，防止選單開啟時滾輪造成背景位置移動。
