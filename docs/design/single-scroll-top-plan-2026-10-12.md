# Single文章頁回頂端重複：診斷與計畫（2026-10-12）

## 基準與範圍

首頁輪播與480px文字欄已先提交ede553c6，分支20261012-1。codebase-memory index_status確認根目錄、分支及HEAD一致；search_graph以scrollTop查詢未命中，以下關鍵結論依原始碼與本機瀏覽器實測，不聲稱已由圖建立完整呼叫關係。本輪僅診斷與計畫，未修改回頂端功能。

## 已查證

1. layouts/_default/single.html:92輸出自訂article-scroll-top，data-scroll-top、中文aria-label與回頂端文字。static/js/custom.js:413綁定window.scrollTo，尊重prefers-reduced-motion。顯示條件為已捲動距離／可捲動總長>30%。CSS位於assets/css/extended/custom.css:7441與9154，手機在閱讀工具列上方。
2. themes/PaperMod/layouts/partials/footer.html:25及70另外輸出#top-link及window.onscroll；超過800px後出現，href=#top、英文標籤、Alt+G捷徑。hugo.yaml未關閉此全站功能。
3. 本機長文正念的意義就在手中，390／1440px×明暗共4組，在55%閱讀位置两個按鈕同时可見。桌機舊版42px按鈕y798、自訂44px按鈕y838，有局部垂直範圍重疊；手機舊版y798、自訂y740，形成上下兩個同功能入口。1400px位置只顯示舊版，顯示門檻不一致。
4. 手機工具列上的向上箭頭標籤是分享，目前按鈕data-mobile-reading-share，不是第三個回頂端。不要因圖示方向而刪除分享功能。
5. layouts/_default/baseof.html:38使用partialCached footer，現有key包含Layout、Kind、hideFooter及ShowCodeCopyButtons，沒有文章Type。若依文章類型控制footer按鈕，必須同步快取key，避免跨頁重用錯誤結果。

## 判斷

重複來自新文章工具與舊主題全站工具並存；不是兩次重複綁定同一顆按鈕。全站disableScrollToTop會連首頁與列表一起移除，不適合作為僅修文章頁的預設方案。

## 建議方案

保留文章自訂中文按鈕，文章頁移除PaperMod舊按鈕及其onscroll腳本；首頁、列表等頁保留既有全站功能。透過專案layouts/partials/footer.html覆寫，不直接修改theme。對「使用single文章工具的頁面」採一致判定，並把判定加入partialCached key。

統一自訂按鈕出現規則，建議改為捲動超過約一個視窗（設定最低距離），避免30%門檻使長文章出現太晚。具體距離先用長文／短文驗證再定。保持44px以上觸控尺寸、清楚focus樣式及減少動態適配。保留或移轉Alt+G到單一入口，核對aria-hidden與鍵盤焦點狀態。

手機沿用工具列上方的位置，核對safe-area、直橫向及分享按鈕，不新增第三顆入口。桌機只顯示一顆，後續再微調外觀，不在去重時擴大版面設計。

## 實作及驗收順序

1. 保留目前四組診斷基準，確認長文、短文、圖文實際共用的single範圍。
2. 文章頁移除舊入口與專屬onscroll，更新footer cache key；其他頁保留舊入口。
3. 調整單一顯示門檻與鍵盤／aria狀態，保留減少動態行為。
4. 三篇文章×390／1440px×明暗，檢查頁頂、中段、頁尾：最多一個可見回頂端、點擊回0、無工具列遮擋；另驗證鍵盤與減少動態、手機橫向。
5. 回歸首頁、blog、Tag、Category的回頂端及主題切換，包含footer快取混用情境；Hugo建置、CSS子集與相關既有測試通過後，再收尾提交。

目前回頂端功能未改，計畫文件尚未提交，正式站驗收待後續發布。

## 本機實作（2026-10-12）

single主內容以Page.Store標記articleScrollTop，專案覆寫footer僅在有此標記時停用舊入口及其onscroll；baseof的partialCached key加入相同標記，避免文章與非文章快取混用。未改theme原檔。

自訂按鈕門檻改為scrollY>max(600,0.8×innerHeight)，hidden時tabindex=-1、visible時0，保留Alt+G與中文說明，加明確focus-visible樣式。回頂端後焦點回到主內容且不額外捲動。保留減少動態與手機safe-area配置，分享工具不變。

Hugo建置、首頁CSS子集同步與diff檢查通過。14項回頂端測試全數通過（19.1秒）：三篇長短圖文×手機桌機×明暗12組、非文章及快取分流、手機橫向與平滑捲動；另9項文章與列表既有回歸先前已通過。橫向測試使用740px符合既有手機工具列breakpoint，820px屬無工具列的平板配置。

本輪已完成本機提交，尚未推送或部署；診斷截圖與建置留在.tmp，未加入Git。

Production建置掃描：226個single文章頁皆無舊入口或舊onscroll，129個非文章頁保留舊入口，快取分流驗證通過。

## 收尾狀態

文章頁回頂端去重、顯示門檻、鍵盤焦點、footer快取分流與驗收已完成。後續維護PaperMod時需核對專案footer覆寫；發布後另檢查正式頁面，不能以本機驗收代替部署結果。
