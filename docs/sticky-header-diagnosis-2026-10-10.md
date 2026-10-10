# 全站 Header 捲動診斷

日期：2026-10-10。分支：`codex/sticky-header-diagnosis`，來源基準：`171c2f50`。

## 結論

本機未重現 header 往上捲後無法回到頂端。首頁保持可見，其他長頁往下捲時主動隱藏，往上捲則顯示。若需求是全站始終黏在頂端，目前共用 JS 的自動隱藏邏輯直接違反該需求；這是已確認的行為差異，尚不能宣稱正式站另有部署故障。

上述為修改前診斷。後續依使用者確認的設計完成修復，見下方實作紀錄；未提交或部署。

## 來源查證

- 先查 codebase-memory-mcp index_status，根目錄、分支與 HEAD 對應開始時的專案；再以 search_graph 定位共用 header。圖對 `layouts/partials/header.html` 有解析缺口，以下結論均以來源與瀏覽器確認。
- `layouts/_default/baseof.html` 共用 `header.html`；`layouts/partials/header.html:8` 輸出 `#site-header`。
- `layouts/partials/extend_head.html:14` 讀取 `static/js/custom.js` 並指紋載入；不是舊的 `assets/js/custom.js`。
- `static/js/custom.js:25` 只讓首頁、頁面頂端及開啟中的導覽／搜尋保持可見。其他頁面在超過 120px 後往下捲會加上 `nav--hidden`；桌機向上單次差值超過 10px、手機累計向上 36px 則移除此 class。
- `assets/css/extended/custom.css:238` 原本即有 sticky；`:246` 的 `nav--hidden` 透過 transform／opacity 把 header 隱藏。`:8769` 在 768px 以下切成 fixed。
- `assets/css/extended/zz-publication-header.css:31` 強制首頁 sticky，`:54` 的手機 overflow 修正也只限首頁。

## 本機驗證

Hugo 0.166.0、已安裝的 Microsoft Edge（Playwright chromium channel），獨立本機 server 1314。尺寸 390／820／1440 × 900。每頁先往下捲到 900px，再往上捲 100px，等待動畫完成後讀取 bounding rect 與 class。共 24 組，全部 HTTP 200。

| 頁型／樣本 | 往下捲 | 往上捲 |
| --- | --- | --- |
| 首頁 `/` | 可見，y=0 | 可見，y=0 |
| `/blog/`、`/categories/`、`/tags/`、`/clubhouse/`、`/about/` | 加上 nav--hidden，y=-83／-84／-134 | 移除 nav--hidden，y=0 |
| `/blog/電影心得/媽的多重宇宙01/` | 同上 | 同上 |
| `/search/` | 短頁捲動有限，保持可見 | 保持可見 |

驗證腳本與原始結果留在忽略的 `.tmp/sticky-audit/`。代表頁型驗證不等同逐一瀏覽每篇文章；未驗證正式站、Safari／Firefox、深色模式或手動連續慢速捲動。

`hugo --destination public-build-check --noBuildLock` 成功：340 pages、72 paginator pages、280 aliases。既有另一個 Hugo 程序持有建置鎖，初次建置等待；獨立診斷改以 noBuildLock 完成。產物已被 Git 忽略。既有語言設定與模板 API 棄用警告仍在，與 header 行為無直接關聯。

## 後續修復範圍

若採全站持續可見，應移除共用 JS 的捲動隱藏分支，統一處理手機定位、body 預留高度與選單鎖定；不可只新增 position: sticky，因為既有 transform 仍會隱藏 header。保留現在的自動隱藏設計時，則需針對使用者實際失效頁面與操作追加重現。正式站是否與本分支一致仍待核對。

## 已確認設計與實作

使用者確認需要往下隱藏、往上顯示，手機 header 與既有底部 bar 同步。來源追查發現兩者分開監聽捲動；底部閱讀工具列另有完整／精簡／隱藏三階段門檻，首頁則例外保持 header 可見。這些差異造成全站與上下導覽行為不一致。

- `static/js/custom.js` 統一捲動控制：頂端 120px 內可見，向下累計 48px 隱藏，向上累計 32px 顯示；取消首頁例外。捲動值限制於文件範圍，避免底端回彈誤判。
- `mobile-reading-toolbar.html` 移除獨立三階段控制，保留字級、分享、上一頁及接著讀功能；工具操作透過事件要求共用導覽顯示。
- 共用控制同步更新 header 與手機底部 bar；隱藏元件使用 inert，避免不可見區域接收點擊與鍵盤焦點。選單、搜尋、TOC、工具提示及導覽內鍵盤焦點保持可見；resize／pageshow 重設顯示狀態。
- `zzzzzz-scroll-navigation.css` 使用相同 280ms 動畫，減少動態效果設定時停用動畫；不改內容佈局與網址。
- 新增 `tests/scroll-navigation.spec.js`，涵蓋七種長頁型、390／820／1440px、明暗模式（42 組頁面情境）、微幅反向、上下同步、隱藏時 inert、面板、鍵盤、resize、減少動態效果；7 項測試通過。
- 更新首頁既有測試以符合往下隱藏設計：先往上捲顯示導覽，再執行鍵盤主題切換。首頁與文章既有 16 項檢查中，初跑 15 項通過；調整上述測試操作後，受影響的五種寬度測試均通過。新增同步測試另有 7 項通過。Hugo 建置成功；正式站與真實手機 Safari 尚未驗證。

後續依使用者手感調整：手機 single 底部閱讀工具列先改為向下累計 160px，再依確認延長至 240px 才隱藏，header 仍為 48px；向上累計 32px 時兩者一起顯示。延後隱藏情境測試涵蓋累計 160px 時仍顯示、240px 時隱藏。

最終兩段式設計：手機工具列完整呈現 icon＋文字「上一頁／字級／更多文章／分享」，向下累計 360px 後整條滑出，不經過僅 icon 的精簡狀態；向上 32px 恢復完整工具列。原樣式將文字設為 display:none，現已在手機範圍恢復顯示；「更多文章」仍跳到既有 related-posts 區塊。更新門檻與文字可見性驗證，Hugo 建置通過。

使用者再次調整為兩次收合：向下累計 160px 隱藏文字，僅留 icon 並略縮工具列高度；累計 480px 才整條隱藏。向上累計 32px 直接恢復完整工具列。精簡狀態保持按鈕與無障礙名稱可操作，整條隱藏時才設 inert。測試更新以檢查 160／480px 門檻及完整恢復。

第二段延長：文字仍在 160px 收起，整條隱藏門檻延長至 640px，因此僅 icon 階段保留 480px 的向下累計距離；向上恢復門檻仍為 32px。
