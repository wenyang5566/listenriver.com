# 9/28 現況與接續計畫

基準：`ccf28362`（Merge pull request #54）。新分支：`codex/entry-followup-0928`。
工作目錄：`C:\Users\wenyang\.codex\worktrees\11f0\listenriver.com`。

本次只建立分支、核對原始碼及提交、整理計畫，未開始新的網站修改或重新執行建置。初始工作樹乾淨。

> 接續執行更新：正式站 SEO 與 main CI 已查證通過，新增可重跑的唯讀檢查；三個會所系列的搜尋中繼資料修正與本機驗收已完成，尚未提交或部署。詳見下方 9/28 驗收紀錄。

## 已完成，不要重做

| 提交 | 已完成內容 |
| --- | --- |
| `99faff84` | 閱讀筆記改名、新分類網址、舊分類首頁／分頁／RSS 的 40 條 301、SEO 產物檢查、三個誤導子入口移除 |
| `3d8756cc` | 六個精選主題、會所卡片入口統一指向系列 section |
| `b9859cfc` | 搜尋頁完整系列入口、桌機／手機搜尋檢查與交接文件 |
| `ccf28362` | PR #54 合併，以上修改已包含於本機 main |

舊交接說「第四批未提交」已過時。不能據此再套一次修改。Git 合併紀錄不代表已查證正式站部署或遠端 CI 成功。

## 持續遵守的範圍

- 首頁原版型、六張入口卡及區塊順序保留。
- 五類維持閱讀筆記、日常書寫、成為自己、病痛經驗、助人工作；成為自己與病痛經驗分開。
- 國際化暫停；不批次搬文章、重分類或合併 tag。
- 保留新分類網址與永久轉址；不要重跑歷史 `scripts/taxonomy_migration.py`。

## 待處理順序

| 優先 | 任務 | 具體工作與完成條件 |
| --- | --- | --- |
| 1 | 正式站與 CI 驗收 | 核對 PR #54／main 的 CI 和部署版本；查舊首頁、編碼形式、第 2／12 頁與 RSS 的實際 301、Location，及新頁 200、canonical、sitemap。記錄未發布或平台規則差異，不能只憑本機 _redirects 判定上線正常。 |
| 2 | 中文全文搜尋漏找 | 在新分支建立可重現案例，比較索引詞與瀏覽器查詢分詞；修正後逐篇核對系列是否被召回，同時檢查一般查詢是否誤匹配。保留現在完整系列入口作為可靠目錄。 |
| 3 | 系列閱讀順序 | 先核對目前前後篇按日期或編號的實際行為，再提出會所日誌、實習、手冊的目錄／前後篇小改動；避免把一般文章改成系列排序。 |
| 4 | 入口維護一致性 | 檢查仍分散的導覽設定與篇數來源；讓「跨分類延伸」範圍更清楚，每次只調整一組入口。 |
| 5 | 內容治理 | 整理五類收錄準則、20 篇無 tag 候選與近義 tag 差集；先提出逐篇清單，再決定分類或標籤變更。 |

## 搜尋問題的已知證據

9/27 Pagefind 1.5.2 實測：「會所工作日誌」9 筆，系列 19 篇；「會所實習」0 筆，系列 7 篇；「會所工作手冊」回傳 3 篇日誌，未找出該系列 4 篇。

系列文字已存在於 fragment；實驗性改為 `zh` 索引未改善，尚未確認根本原因。不要重複假設文章沒進索引，也不要把「完整系列入口」當成全文搜尋已修好。新一輪需先重現，再檢查分詞、匹配與排序。

## 驗證與工具注意

歷史驗證已通過：Hugo 0.166.0 建置、Pagefind 227 頁、639 路徑零新增回歸、40 條改名規則與 SEO 產物、5 項版面測試、桌機／手機搜尋流程。這些是上一輪結果，不是本次重跑結果。

CI 仍指定 Hugo 0.160.1 extended；本機曾出現一次無效 UTF-8 產物，乾淨重建後通過，原因未確認。若再次出現，保存異常檔與日誌，獨立處理工具可靠性。

此處是新 worktree；舊 `.tmp`、node_modules、瀏覽器安裝與 localhost:1318 可能仍來自原工作目錄。使用前確認依賴、伺服器根目錄與目前 commit，不能把舊預覽當成本分支新結果。

## 現在需要作者決定嗎

前兩項屬現有改名與搜尋工作的驗收／修正，可先進行。系列目錄呈現、tag 合併與文章歸屬若涉及編輯選擇，等有具體對照方案時再決定。現階段不需要重議五大分類或首頁版型。

參考：[實作與驗收紀錄](reading-notes-implementation-2026-09-27.md)、[全站文章分析](taxonomy-recommendation-2026-09-27.md)。

## 9/28 正式站驗收（已完成優先項 1）

- 公開 GitHub API 查證 `ccf28362df83da6bea097dd35f9f106c1ad6d2ab` 的 [Hugo Build](https://github.com/wenyang5566/listenriver.com/actions/runs/36320905342) 與 [Playwright Tests](https://github.com/wenyang5566/listenriver.com/actions/runs/36320905349) 均 completed／success。連接器曾回空清單，因此以公開 API 的具體執行紀錄為準。
- 正式 `https://listenriver.com`：40 條舊分類路徑全部直接 301，Location 與已核定規則相符；13 個不同目的地皆回 200，涵蓋新首頁、2～12 頁與 RSS。
- 新分類 canonical、Open Graph URL 正確且沒有 noindex；sitemap 包含新分類而無舊分類；RSS 使用新分類連結。
- 這確認了線上遷移行為與 main CI 成功；未查 Search Console 收錄／排名，也未查 Cloudflare 部署的精確 commit 識別。
- 新增 `scripts/check-reading-live.mjs`，執行 `npm run check:reading-live` 可重跑；需要留檔時執行 `node scripts/check-reading-live.mjs .tmp/audit-reading-live-0928.json`。它只讀公開網址，不部署，也不納入離線建置流程。

## 9/28 搜尋控制實驗（修正前紀錄）

- 使用現有 Pagefind 1.5.2 與上一輪驗證過的 HTML，重新產生全站索引到本 worktree 的暫存目錄。結果仍是日誌 9、實習 0、手冊 3，排除只因舊瀏覽器快取或舊索引檔造成的猜測。
- 同一篇實習文章單獨放入小型測試索引時能被搜尋；加入完整站點後出現漏找。這是實驗現象，尚不能據此定論為分塊或斷詞缺陷。
- 拆字查詢「會 所 實 習」回傳 124 筆，包含全部 7 篇實習，誤匹配很多；加引號的拆字查詢可找到 11 筆含全部 7 篇實習，但相同方式查日誌與「英雄」變成 0。已否決把拆字或引號當作通用前端修正。
- 未改語言設定、Pagefind 版本、索引演算法或使用者查詢；現有完整系列入口保留。
- 下一步建議：在獨立實驗中分析小／全站索引的實際詞項與查詢匹配，先找出可重現的最小差異。需同時驗證實習、日誌、手冊、英雄與一般文章查詢，再考慮修正。不要直接升級或全面替换搜尋引擎。
- 暫存實驗位於 `.tmp/audit-search-fixtures`、`.tmp/audit-fixture-query.mjs`、`.tmp/audit-full-query.mjs`；未提交網站產物或測試用索引。測試沿用原工作目錄的套件，沒有修改原工作目錄。

## 9/28 會所系列搜尋修正

- 索引詞檢查顯示內文的「會所實習」拆成單字，瀏覽器查詢使用詞組；部分圖片替代文字的中繼資料又保留完整系列名稱，造成不同文章的匹配差異。不能據此宣稱所有中文搜尋問題都已定位。
- 在全站測試索引加入經核對的系列詞組後，實習／日誌／手冊分別找回 7／19／4 篇，沒有混入其他系列；「英雄」維持 13 筆。
- `data/search-series.yaml` 明列三個系列的詞組。`layouts/_default/single.html` 按文章所屬 section 加入 Pagefind 可搜尋中繼資料，包含沒有顯示系列標示的文章。沒有改查詢、文章內容、網址、版型、分類或 tag。
- `scripts/check-search-ux.mjs` 新增逐篇核對：從完整索引列出三個 section 的文章，確認系列名稱查詢沒有漏掉任何一篇，並保留原有桌機／手機與搜尋操作測試。
- 參考 [Pagefind 中繼資料文件](https://pagefind.app/docs/metadata/)；一般中文自由查詢仍需另做案例驗證，這次修正僅涵蓋上述三個系列。

### 本機工具

- x64 Hugo 0.166.0 在 Windows ARM64 本機完整建置發生 Go heap bad pointer，失敗產物 `.tmp/audit-series-metadata` 不可拿來驗收。
- 改用官方 Hugo 0.160.1 Windows ARM64，版本與 CI 一致（本機為 standard，CI 為 extended），放在 `.tmp/audit-hugo-arm64/hugo.exe`；壓縮檔 SHA256 已與官方 checksums 核對一致。未替換根目錄的既有 Hugo，也未修改 CI。

### 本次實際驗收結果

- ARM64 Hugo 乾淨建置成功，輸出 `.tmp/audit-series-native`；Pagefind 1.5.2 索引 227 頁。
- 執行 `node scripts/check-search-ux.mjs 'http://127.0.0.1:1320/search/?q=%E8%8B%B1%E9%9B%84'` 通過，含桌機／手機預填、結果、網址同步、清空、頁首跳轉、完整系列入口，以及實習 7／7、日誌 19／19、手冊 4／4 的逐篇召回檢查。紀錄：`.tmp/audit-series-native-search.log`。
- `scripts/url-guard.py check --site .tmp/audit-series-native --moves docs/reading-notes-url-moves.json`：639 條基準路徑，0 新增回歸；仍有原基準已知的 3 項問題。
- `scripts/check-reading-migration.py --site .tmp/audit-series-native`：40 條直接 301 規則、canonical、Open Graph、sitemap、RSS 與內部連結通過。
- JavaScript 語法檢查及 `git diff --check` 通過。未修改首頁、CSS、國際化、五類結構或文章歸屬。
- 本批預覽為 `http://127.0.0.1:1320/search/`；1318 是上次產物，不代表本分支。伺服器關閉後須重新啟動。

### 下次接續

1. 檢視並提交本分支的正式站驗收工具、搜尋修正與文件；未 push／PR／部署。本文件的「待處理順序」為原始計畫，項目 1 的線上行為驗收及項目 2 的三個系列修正已完成。
2. 再處理系列閱讀順序：先核對實習／日誌／手冊的編號、日期與前後篇，整理最小改動方案；不直接套用到一般文章。
3. 一般中文搜尋、Search Console 與部署 commit 識別仍未完整驗證，不要把本批結果擴大為全站中文搜尋或 SEO 排名保證。
