# 第五輪：效能、視覺對照與發布前驗收

> 最新作者方向：閱讀路徑與新增策展解說已撤回；現行網站以簡潔為主。見 [網站精簡紀錄](site-simplification-2026-10-13.md)。本文件保留為歷史評估，不當作現行介面待辦。


日期：2026-10-13。分支 codex/awwwards-phased；網站來源基準 a30ae174。本輪完成本機驗收工具、同條件量測、視覺對照與發布前清單。效能門檻尚未達到；GA 新事件、正式發布與真機／新讀者仍待取得條件。不能把第五輪記為全面通過或已達獎項門檻。

## 同條件前／後量測

優化前從 commit 13a21cac 的 git archive 建立隔離來源快照，不修改目前 checkout。Hugo 0.160.1 extended；Windows ARM 上初次冷圖片處理遇到先前同類 runtime 崩潰，以既有圖片快取重建成功。這是建置環境的限制，尚未完成冷 Hugo 建置驗證；與瀏覽器冷載入是不同條件。

Lighthouse 13.5.0，Edge headless；手機 412×823、DPR 1.75，simulated throttling（RTT 150 ms、吞吐 1638.4 Kbps、CPU 4×）；本機文字資源 Brotli quality 5。每頁三組交錯的 before／after，共 24 個樣本，每次使用新的瀏覽器。第一個精選文章為預設第一張；網站維持預設動態。封鎖所有外部 HTTPS 請求，因此是 first-party 本機控制實驗，不是正式站分數／CrUX，也不能和 10/11 正式站五次中位數混用。

| 樣本 | 三次分數，前 → 後 | 分數中位 | LCP 中位 | 新版 TBT 中位 | 新版 CLS 最大 |
| --- | --- | --- | --- | --- | --- |
| 首頁 | 85／85／85 → 85／84／86 | 85 → 85 | 3.98 → 4.06 秒 | 160 ms | 0 |
| 長文：正念的意義就在手中 | 82／81／80 → 80／80／81 | 81 → 80 | 4.29 → 4.21 秒 | 0 ms | 0 |
| 短文：最大的自由是承擔 | 81／81／83 → 82／82／84 | 81 → 82 | 4.21 → 4.06 秒 | 0 ms | 0 |
| 圖文：媽的多重宇宙01 | 78／78／78 → 78／78／80 | 78 → 78 | 4.66 → 4.66 秒 | 0 ms | 0 |

原始報告 `.tmp/phase-five/performance/`；可追溯摘要 [performance-summary.json](../audit-evidence/2026-10-13/phase-five/performance-summary.json)。四種代表頁的 Performance／LCP 尚未達計畫的中位 ≥90／≤2.5 秒，最低樣本也未守住 ≥85。TBT≤200ms 與 CLS≤0.1 通過。前後少量差異在目前三次樣本下不當作穩定提升或下降；長文新版 80／80／81 與既有 82／81／80，仍需下一批精準改善。

### 已查證的載入線索與預算

首頁首屏仍只下載 river-home 字型子集：原樣本傳輸 118,769 → 124,317 bytes；兩份 blocking CSS 約 26,508 → 27,959 bytes；新增文字與元件的成本有界，但不足以通過 LCP 門檻。代表文章仍下載 river-sans（約248KB）與 Merriweather（約46KB）；全站 stylesheet 約45–46KB傳輸，Lighthouse 對 blocking 的單項估計約600ms。LCP仍是精選／文章封面，已 eager／high priority／HTML 可發現；不能再把這些既有設定當新修復。

資源總量包含 Lighthouse 後續擷取帶動的 lazy 圖片，不等於首屏阻塞量。LCP breakdown 的子階段是實際 trace 時間，LCP 主指標是 simulated 結果，不能直接把兩者相加。下一批需以 request 時序與單變量實驗確認字型／樣式／圖片競爭的作用，不能只憑 unused CSS 估算刪掉大部分共用樣式。

本輪沒有新增 runtime JS、阻塞請求、字型、影片或動畫；新增程式都是本機驗收工具。後续效能批次順序：先固定文章頁樣式／字型成本，做單頁樣式子集或小型 UI 字型實驗；保護選單、工具列、深色、字級、燈箱與留言状態。再核對首頁 LCP 資源與繪製時序。每次保存 3–5 次同條件結果及 121 項回歸，不全站重寫、不以移除閱讀內容換分數。

## 視覺對照與新版頁面

60 張未經影像編輯的實際頁面截圖：八個區塊 × 390／1440px × 明／暗 × 新舊，其中新增路徑只有新版；全部無水平溢出。保持同尺寸、同精選內容、reduced motion；截圖工具將區塊內圖片 eager 載入以取得完整畫面，此設定只作用於截圖，不修改網站行為。區塊高度因新增內容自然不同。

對照頁 `.tmp/phase-five/review/index.html`，本機入口 [新舊視覺對照](http://127.0.0.1:1344/)。可切手機／桌機、淺／深色，點原圖放大。新版入口 [首頁](http://127.0.0.1:1341/)、[病痛分類](http://127.0.0.1:1341/categories/病痛經驗/)、[代表文章](http://127.0.0.1:1341/blog/成為自己/正念的意義就在手中/)、[新增閱讀路徑](http://127.0.0.1:1341/reading-paths/)。本機連結只在本電腦預覽服務執行時可用。

| 區塊 | 視覺差異 |
| --- | --- |
| 首頁 | 兔子、字標、紙色與精選照片保留；新增問題導向的四篇路徑入口與持續暫停控制 |
| 作者介紹 | 工作現況／關注與學歷／論文分工，不在首頁重複社工身分 |
| 分類 | 原來藏在介紹裡的三個選讀入口，移到列表前；桌機三欄、手機單欄 |
| 代表文開頭 | 新增短導讀與封面圖說，正文規格與作者段落保留 |
| 代表文結尾 | 多張泛用推薦改為明確下一篇與續讀理由；原會所系列保留 |
| 內頁頁尾 | 技術頁尾改為一致的品牌與四個閱讀出口 |
| 圖集 | 實際內容圖說、alt、小圓點＋大點擊範圍；暫停影響自動播放 |
| 新增頁型 | 四篇「病痛，如何被聽見？」閱讀路徑，桌機靜態河線、手機依序閱讀 |

## 樣式責任與維護

| 責任 | 來源 | 維護方式 |
| --- | --- | --- |
| 首頁框架／主視覺／輪播 | river-home.css、river-home.js、river-home partial | 首頁獨立資源；保留圖像與品牌 |
| 共用舊 UI | extended/custom.css → home-shared.css | 用既有子集產生器，保留動態與隱藏狀態；本輪無刪除 |
| 閱讀規格 | zzzzz-article-editorial.css | 18px／36px、640px、中文宋體＋Merriweather |
| 路徑三版型 | zzzzzz-reading-path.css、reading-path partials／layout | plain links 可完成續讀；資料在 reading-paths.yaml |
| 新共用頁尾／導讀／分類起點 | zzzzzz-publication-footer.css 與相應 partials | 窄範圍 selector；新舊 CSS 仍有排序責任，尚未全面搬移清理 |

可重現工具：`node scripts/compare-site-visuals.mjs <before-site> <after-site> <output>`；`node scripts/check-reading-performance.mjs <before-site> <after-site> <node_modules containing lighthouse/chrome-launcher> <output>`。Lighthouse 為既有本機驗收依賴，未新增網站的 npm／bundle 依賴。兩者用相同安全本機靜態伺服器，沒有寫入外部服務。

## 閱讀量測與發布前判定

新增 GA 事件的實作未執行：自動核准審查要求新增行為中繼資料的明確傳送授權。已備 [最小事件參數表與觀察方案](reading-events-proposal-2026-10-13.md)，既有 GA 保留。事件尚無資料，不能宣稱路徑改善完成率或自然流量成長。

| 項目 | 狀態／發布前處理 |
| --- | --- |
| 來源還原點 | a4b0ee56（前置＋1／2輪）、311db9e6（第3輪）、a30ae174（第4輪）；本輪 tools／reports 另提交 |
| 本機網站回歸 | 第4輪最終121／121，圓點修正後9／9；本輪無 runtime 改動，沿用該已驗證網站來源 |
| 網址／搜尋 | 第4輪639舊網址零新增回歸、27搜尋案例通過、226文章與39 tags／20轉向通過；本輪快照不作遷移 |
| Worker | 第2輪 TypeScript／dry-run／本機 D1 通過；尚未部署修復，Pages 與 Worker 需分別安排 |
| 正式功能 | 發布後重驗 tag HTTP301、Pagefind、代表頁明暗、Waline／互動API；不得用本機代替 |
| 效能 | 本輪24個本機樣本，Performance／LCP尚未達標；先做上述效能批次，再評估發布／投稿 |
| 新路徑索引 | 原型仍 noindex，沒有加入Pagefind；讀者／作者確認後另核定正式索引 |
| 讀者與真機 | 5–8人任務、80%門檻、iOS／Android／Safari／讀屏尚未取得 |
| 分析 | 新事件待明確授權；現有正式報表限定hostName=listenriver.com，歷史測試流量另記 |
| 投稿 | 作品介紹可先準備；等條件達到後重新核對當時規則／費用，未付費、未投稿 |

正式發布仍需明確授權；此紀錄不是發布核准。回復可依分輪 commit 選定來源並重新建置，Worker 另選已驗證版本；不直接重設使用者分支。

## 作品說明草稿

繁中：「聆聽的河流」是一位社工的閱讀、病痛經驗與助人書寫。網站以紙色、河線與攝影維持安靜的閱讀節奏；問題導向的路徑把自身經驗、書籍、對話與會所現場接在一起，讓讀者從一個問題走向下一篇。

英文：Listenriver is a social worker’s journal of reading, illness experience, and helping practice. A quiet paper palette, river lines, and photography hold the writing together. Question-led reading paths connect lived experience, books, dialogue, and everyday clubhouse work, giving readers a reason to continue.

Credits 草稿：文揚的文字與既有攝影／圖像，本站 Hugo／PaperMod／Pagefind 開源基礎；既有字型、兔子與 Logo 的來源沿用網站紀錄。書封、電影海報、工作坊投影片各自保留原文來源；正式投稿前核對完整 credits，不宣稱所有第三方圖像皆為作者原創。尚未製作正式30–60秒影片，不自動下載媒體。

## 下次接續

先看本文件24次結果，從文章樣式／UI字型的單變量效能實驗接續，保留既有文章與視覺成果。GA是否啟用另按作者明確回覆決定；網站不直接推送或發布。
