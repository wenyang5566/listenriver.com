# 文章屬性盤點（2026-11-15）

## 範圍與限制

- 基準：`main`，文章提交 `18b0ed9b`；11/15 完成盤點與副本驗證，11/16 經作者授權套用低風險清理，其餘欄位保留。
- 掃描 content 下所有 Markdown 的 YAML front matter；共 269 份文件，其中 blog／clubhouse 下非 `_index.md` 的文章來源 231 份（227 份 draft:false、4 份 draft:true），其他頁面／分類／分區 38 份。這是來源檔案數，不是正式站已發布頁數。
- 先確認 codebase-memory 索引根目錄、main 與當時 HEAD；圖查詢未能定位自訂參數，Hugo 模板亦有解析缺口，因此用途結論以目前原始碼確認。未以圖查不到當作無用途證據。
- 盤點以頂層 YAML key 與原始值區塊統計，非完整 YAML 語意解析；後續以隔離副本和兩份乾淨 Hugo 建置確認第一批候選的輸出等效。Hugo 已恢復建置與文章 HTTP 預覽，詳見末段；未執行完整瀏覽器視覺驗收。

## 判斷與建議順序

1. 第一批候選是空的選用欄位、全空 cover、與 description 完全相同的 homeSummary，以及明確等同模板預設的設定。下方附逐篇清單；目前均未刪除。
2. `type: post` 雖然 231 篇都有，也不能直接刪。Type 參與 Hugo 模板選擇，現有 list／主題模板也使用 Type 篩選；若要移到 cascade，需要比較整批文章模板、列表集合、網址與輸出後再處理。
3. `draft:false`（227 份）是可省略的候選，但新文章範本仍應預設 true，避免尚未確認的文章隨推送上線。空欄位與預設值不應繼續複製到每篇新文。
4. `aliases` 的 188 份非空值和 `interactionKey` 的 31 份非空值保留：前者保護歷史網址，後者維持留言／閱讀量／喜歡的舊識別。來源：`layouts/partials/comments.html:12`、`layouts/partials/post_interactions_v2.html:9`。
5. `displayTitle`、`seriesLabel` 保留有效值。除了標題呈現外，`layouts/partials/series-context.html` 用 seriesLabel 建系列與前後篇；不能只因 single 能推算部分標記就刪除。
6. `description` 不等同多餘：head、分享資訊、列表與首頁有使用；homeSummary 是首頁例外摘要，只有與 description 相同時才是重複候選。來源：`layouts/partials/head.html:32`、`layouts/partials/river-home.html:42`。
7. `socialImage` 的 4 個非空值保留，指定分享專圖；空值可列入清理。來源：`layouts/partials/templates/_funcs/get-social-preview.html:13`。
8. `homeThumbnailFit:cover` 在目前首頁預設相同；contain、裁切位置與精選形狀屬於個別照片調整，不批次移除。來源：`layouts/partials/river-home.html:20`、`:42`。`featured:true` 仍影響精選池（`layouts/partials/river-featured-pool.html:3`），只將 false 列為省略候選。
9. 有 1 份文章 title 與 displayTitle 均空，應人工核對標題；不是把空 title 刪掉就算修好。頂層空 `image` 只有 1 份，目前模板使用 cover.image／images，屬清理候選。
10. 非文章文件的 layout、robotsNoIndex、canonicalURL、groups、thesis 等有獨立用途，不套用文章清理規則。有效標題、日期、分類、標籤、封面和圖片描述保留。

## 新文章日常填寫方式

一般文章只需維護標題、日期、草稿狀態、分類，並視需要加入標籤、摘要、封面。會所系列加上 displayTitle／seriesLabel。分享圖、首頁裁切與首頁專用摘要只在真的需要時加；aliases／interactionKey 只在保留舊文章相容性時使用。type 的集中設定另作一批驗證，這次不移除。

## 後續驗證

清理前後以同一 Hugo 版本建立乾淨輸出，比對文章 URL、aliases、互動 key、系列前後篇、摘要、封面／分享圖與首頁精選；確認沒有繼承值因刪除欄位而重新生效。保留正文與既有網址。先排除本機 Hugo 啟動問題，再執行 CONTRIBUTING 要求的建置與受影響頁面檢查。

## 每個欄位應該填什麼

以下是本次文章來源實際出現的全部 19 個頂層欄位，另補 cover 內層說明；選填欄位不用先留空占位。

| 欄位 | 應填內容 | 日常處理 |
| --- | --- | --- |
| title | 完整標題，如「工作日誌 20｜向陽兩週訓心得」 | 必填；空標題人工處理 |
| date | 文章日期，如 `2026-10-28`；需要時含時間與時區 | 保留，避免意外改變排序 |
| draft | `true` 為未完成，`false` 為可發布 | 保留明確開關；本批不省略 false |
| type | 目前全部為 `post` | 保留；集中繼承另案驗證 |
| categories | 既有五類之一的 YAML 清單，如「助人工作」 | 保留，不因資料夾舊名改分類 |
| tags | 既有相關主題清單，如「會所模式」「工作日誌」 | 有用才填；空清單可省略 |
| description | 用自己的文字簡述文章；用於搜尋摘要、分享資訊及列表 | 有內容保留；不是作者欄，也不需重貼全文 |
| cover | `image` 填與 index.md 同層的封面檔名；`alt` 填實際圖片描述 | 沒封面就省略整塊；不要複製上一篇檔名／描述 |
| aliases | 真正曾公開的舊網址清單 | 舊值保留；新文通常不需要 |
| displayTitle | 頁面顯示用短標題，如「向陽兩週訓心得」 | 一般文章不用重填 title；系列及既有例外保留 |
| seriesLabel | 系列名稱＋空格＋編號，如「工作日誌 20」 | 系列前後篇所需；不得重號或任意更名 |
| interactionKey | 改名／搬家前的既有互動 URL 識別 | 不隨新標題重填；有效舊值保留，新文省略 |
| featured | `true` 表示列入精選候選池 | 平常省略；不是保證固定首頁首篇 |
| socialImage | 特別製作的分享圖檔名，如 `share-v1.jpg` | 通常省略，系統會取封面／預設圖；指定時檔案必須存在 |
| homeSummary | 首頁需要不同於 description 的摘要 | 相同就省略；不是每篇都要填第二份摘要 |
| homeThumbnailPosition | CSS 位置，如 `50% 35%`，調整首頁縮圖對焦 | 只有實際裁切需要才填 |
| homeThumbnailFit | `cover` 填滿裁切；`contain` 完整顯示 | cover 為目前預設，可省略；contain 保留 |
| homeFeaturedImageShape | 精選首圖形狀，目前有 `square`，預設 `rounded` | 個別設計才填，不批次刪除 |
| image | 現有 1 個空頂層欄位 | 目前網站用 cover.image／images，不當作封面欄位填寫 |
| （cover 內層）image／alt | 分別為照片檔名及內容描述 | 這兩項屬於 cover，不是新增頂層欄位 |

### 需要人工確認的內容

- 三篇詩的 description 只有「。」：`不是一個善於擁抱/我不是一個善於擁抱的人20231007.md`、`保持距離/20230924.md`、`隨時保持靠海的距離很重要20210930/隨時保持靠海的距離很重要20210930.md`。三篇目前皆 draft:true，不自動補寫或刪除這些摘要。
- 最後一篇同時 title／displayTitle 空白，檔名與開頭「保持距離」也不一致，不能從檔名自行推定正確標題。
- 三篇書摘的摘要只有作者姓名（修身與齊家、危殆生活、尋找復原力）；語法合法但摘要資訊較少，不列低風險刪除。
- 工作日誌 20 的 homeThumbnailPosition 為 50% 35%，可能是複製舊文，但屬視覺意圖，這次保留；封面已改為本篇 WebP。

## 低風險刪除試驗結果（只改副本）

第一批共 **40 份文章、49 個欄位區塊**：29 個空的選用頂層欄位（不含空 title／displayTitle）、10 個全空 cover、1 個與 description 重複的 homeSummary、4 個預設 homeThumbnailFit:cover、5 個 featured:false。沒有更動 draft、type、任何有效 aliases／interactionKey／seriesLabel，沒有修改正文。

- 原文章保留；試驗副本在 `.tmp/frontmatter-review/content/`，精確欄位清單在 `.tmp/frontmatter-review/removals.json`。
- 相同 Hugo 0.160.1 分別建置原始來源與候選副本到兩個全新目錄，各 349 Pages、284 Aliases。
- 原始輸出 `.tmp/frontmatter-review/baseline/` 與候選輸出 `.tmp/frontmatter-review/site/`：各 **676 個 HTML／XML／JSON**，逐檔 SHA256 比較 **0 新增、0 移除、0 內容差異**。這涵蓋輸出的文章、首頁、系列導覽、aliases、sitemap、RSS 與結構化資訊；不是正式站部署驗證。
- 證據：`.tmp/frontmatter-review/output-comparison.json`、`.tmp/frontmatter-baseline-build.log`、`.tmp/frontmatter-candidate-build.log`。未把副本／產物納入 Git。
- 2026-11-16 依作者授權，已在真實來源套用上述 40 份／49 個欄位的清理，並移除 front matter 因刪除欄位留下的空白行；正文逐份比對未變。其他設定與人工確認項目不處理。實際來源建置到 `.tmp/frontmatter-final/`，與原始乾淨基準再次比較。

## Hugo 本機恢復

- 根目錄舊 hugo.exe 在本機啟動時出現 Windows DLL 重新定位錯誤；CI 同版 0.160.1 可以啟動，但預設執行時可重現 Go runtime marked free object，堆疊涉及 warpc／wazero。不能據此斷定文章或圖片內容有錯。
- 對 0.160.1 設定 `GODEBUG=asyncpreemptoff=1` 後，原始站點、候選副本與預覽均成功；這是已實測的本機 workaround，底層 Windows／Go 成因尚未完全定位。
- 新增 `scripts/hugo-local.ps1` 與 build／preview 包裝腳本，鎖定 CI 同版，在專案 `.tmp` 放工具及 cache；無工具時從官方 release 下載並核對 SHA256。既有工具重用路徑已測；首次下載分支未在本次重跑。
- 指令：`npm run build:local`（輸出 public-build-check）；`npm run preview`（預設 1313）；`npm run preview -- -Port 1314`（自訂埠）。腳本只在執行期間設定環境變數，結束恢復呼叫端 GODEBUG；不改 production build、CI 或 Cloudflare 設定。
- 本輪 `1314` 的網站文章預覽 HTTP 200，正確標題、指定封面、無 Wiki 圖片嵌入；封面與兩張內文圖片皆 HTTP 200、image/webp。預覽含草稿，因此與 production 的頁面／alias 數可不同。
- 這是文章排版預覽，未產生 Pagefind；搜尋驗證需完整 production build。未宣稱已執行桌機／手機明暗視覺回歸。

## 全部文章的頂層欄位統計

| 欄位 | 出現篇數 | 空值篇數 |
| --- | ---: | ---: |
| `title` | 231 | 1 |
| `date` | 231 | 0 |
| `draft` | 231 | 0 |
| `type` | 231 | 0 |
| `categories` | 231 | 0 |
| `description` | 230 | 20 |
| `tags` | 220 | 2 |
| `cover` | 207 | 0 |
| `aliases` | 192 | 4 |
| `displayTitle` | 60 | 1 |
| `seriesLabel` | 45 | 0 |
| `interactionKey` | 32 | 1 |
| `featured` | 23 | 0 |
| `socialImage` | 5 | 1 |
| `homeSummary` | 5 | 0 |
| `homeThumbnailPosition` | 5 | 0 |
| `homeThumbnailFit` | 5 | 0 |
| `homeFeaturedImageShape` | 2 | 0 |
| `image` | 1 | 1 |

cover 有 207 份，其中 10 份只有空的 image／alt；其餘 197 份有封面設定。空 cover 不包含在上表頂層空值計數。

## 逐篇第一批清理候選

以下只列空值、重複摘要與少量明確預設；draft:false 與 type:post 不展開成 231 行。

| 文章 | 候選項目 |
| --- | --- |
| [content/clubhouse/工作日誌/02緊握垃圾的力道/index.md](../content/clubhouse/工作日誌/02緊握垃圾的力道/index.md) | 空值：description |
| [content/clubhouse/工作日誌/03回顧會員F來會所的學習/index.md](../content/clubhouse/工作日誌/03回顧會員F來會所的學習/index.md) | 空值：description |
| [content/clubhouse/工作日誌/04就業前準備/index.md](../content/clubhouse/工作日誌/04就業前準備/index.md) | 空值：description |
| [content/clubhouse/工作日誌/05兩週就業訓練反思/index.md](../content/clubhouse/工作日誌/05兩週就業訓練反思/index.md) | 空值：description |
| [content/clubhouse/工作日誌/06複雜用藥下改變如何發生/index.md](../content/clubhouse/工作日誌/06複雜用藥下改變如何發生/index.md) | 空值：description |
| [content/clubhouse/工作日誌/08推動會員帶開會與導覽部門/index.md](../content/clubhouse/工作日誌/08推動會員帶開會與導覽部門/index.md) | 空值：description |
| [content/clubhouse/工作日誌/11敘事的見證/index.md](../content/clubhouse/工作日誌/11敘事的見證/index.md) | 空值：description |
| [content/clubhouse/工作日誌/17將言語視為符號/index.md](../content/clubhouse/工作日誌/17將言語視為符號/index.md) | featured:false 可省略候選 |
| [content/clubhouse/工作日誌/18保持真誠好奇/index.md](../content/clubhouse/工作日誌/18保持真誠好奇/index.md) | featured:false 可省略候選 |
| [content/clubhouse/工作日誌/19身心狀態留下的痕跡/index.md](../content/clubhouse/工作日誌/19身心狀態留下的痕跡/index.md) | homeThumbnailFit 等同預設 cover；featured:false 可省略候選 |
| [content/clubhouse/工作日誌/20向陽兩週訓心得/index.md](../content/clubhouse/工作日誌/20向陽兩週訓心得/index.md) | 空值：socialImage；空值：interactionKey；空值：aliases；homeSummary 與 description 完全相同；homeThumbnailFit 等同預設 cover；featured:false 可省略候選 |
| [content/clubhouse/工作手冊/03負面教材/index.md](../content/clubhouse/工作手冊/03負面教材/index.md) | 空值：description；featured:false 可省略候選 |
| [content/clubhouse/工作手冊/05忍不住、氣不過、沉住氣/index.md](../content/clubhouse/工作手冊/05忍不住、氣不過、沉住氣/index.md) | homeThumbnailFit 等同預設 cover |
| [content/blog/電影心得/綠洲/index.md](../content/blog/電影心得/綠洲/index.md) | homeThumbnailFit 等同預設 cover |
| [content/blog/閱讀心得/障礙政治/index.md](../content/blog/閱讀心得/障礙政治/index.md) | 空值：aliases |
| [content/blog/開放式對話/進階工作坊01/index.md](../content/blog/開放式對話/進階工作坊01/index.md) | 空值：description |
| [content/blog/開放式對話/進階工作坊02/index.md](../content/blog/開放式對話/進階工作坊02/index.md) | 空值：description |
| [content/blog/講座筆記/建制民族誌逐字稿整理/index.md](../content/blog/講座筆記/建制民族誌逐字稿整理/index.md) | 空值：description |
| [content/blog/講座筆記/待人一條相互映照之路/index.md](../content/blog/講座筆記/待人一條相互映照之路/index.md) | 空值：description |
| [content/blog/講座筆記/用音樂做運動/index.md](../content/blog/講座筆記/用音樂做運動/index.md) | 空值：description |
| [content/blog/講座筆記/般若心經短講/index.md](../content/blog/講座筆記/般若心經短講/index.md) | 空值：description |
| [content/blog/詩的語言/保持距離/20230924.md](../content/blog/詩的語言/保持距離/20230924.md) | cover.image／alt 全空 |
| [content/blog/詩的語言/隨時保持靠海的距離很重要20210930/隨時保持靠海的距離很重要20210930.md](../content/blog/詩的語言/隨時保持靠海的距離很重要20210930/隨時保持靠海的距離很重要20210930.md) | 人工核對空標題：title；空值：displayTitle；cover.image／alt 全空 |
| [content/blog/聆聽疼痛計畫/01近況分享/index.md](../content/blog/聆聽疼痛計畫/01近況分享/index.md) | cover.image／alt 全空 |
| [content/blog/聆聽疼痛計畫/08胃痛/index.md](../content/blog/聆聽疼痛計畫/08胃痛/index.md) | 空值：image |
| [content/blog/病痛經驗/住院記：擁抱陰影/index.md](../content/blog/病痛經驗/住院記：擁抱陰影/index.md) | cover.image／alt 全空 |
| [content/blog/病痛經驗/課堂報告小結/index.md](../content/blog/病痛經驗/課堂報告小結/index.md) | cover.image／alt 全空 |
| [content/blog/疼痛書寫/疼痛、憂鬱、失聲/index.md](../content/blog/疼痛書寫/疼痛、憂鬱、失聲/index.md) | cover.image／alt 全空 |
| [content/blog/疼痛書寫/疼痛意識流/index.md](../content/blog/疼痛書寫/疼痛意識流/index.md) | cover.image／alt 全空 |
| [content/blog/疼痛書寫/疼痛日記/index.md](../content/blog/疼痛書寫/疼痛日記/index.md) | cover.image／alt 全空 |
| [content/blog/疼痛書寫/疼痛是比較級的/index.md](../content/blog/疼痛書寫/疼痛是比較級的/index.md) | cover.image／alt 全空 |
| [content/blog/疼痛書寫/髒血/index.md](../content/blog/疼痛書寫/髒血/index.md) | 空值：description；cover.image／alt 全空 |
| [content/blog/書摘/到達彼岸的智慧/index.md](../content/blog/書摘/到達彼岸的智慧/index.md) | 空值：description |
| [content/blog/書摘/正念生活的藝術/index.md](../content/blog/書摘/正念生活的藝術/index.md) | 空值：description |
| [content/blog/書摘/見佛殺佛/index.md](../content/blog/書摘/見佛殺佛/index.md) | 空值：description；空值：aliases |
| [content/blog/日常書寫/網頁架設學習歷程/index.md](../content/blog/日常書寫/網頁架設學習歷程/index.md) | 空值：description |
| [content/blog/成為自己/任性的人/index.md](../content/blog/成為自己/任性的人/index.md) | 空值：tags |
| [content/blog/成為自己/反省個體化/index.md](../content/blog/成為自己/反省個體化/index.md) | 空值：tags |
| [content/blog/成為自己/正念的意義就在手中/index.md](../content/blog/成為自己/正念的意義就在手中/index.md) | 空值：aliases |
| [content/blog/助人工作/創傷知情工作坊筆記/index.md](../content/blog/助人工作/創傷知情工作坊筆記/index.md) | 空值：description |

合計 40 份文章包含上述候選；空的頂層欄位 31 項（含需人工處理的空 title）、全空 cover 10 份、重複首頁摘要 1 份、預設 cover 縮圖設定 4 份、featured:false 5 份。

## 其他 38 份文件的欄位

這些文件包含分區、分類、獨立頁面等，不當作一般文章處理。

| 欄位 | 文件數 |
| --- | ---: |
| `title` | 38 |
| `robotsNoIndex` | 34 |
| `description` | 32 |
| `aliases` | 10 |
| `keywords` | 7 |
| `layout` | 4 |
| `draft` | 3 |
| `canonicalURL` | 3 |
| `ShowToc` | 2 |
| `date` | 2 |
| `summary` | 1 |
| `type` | 1 |
| `hideMeta` | 1 |
| `comments` | 1 |
| `groups` | 1 |
| `categories` | 1 |
| `thesis` | 1 |
| `cover` | 1 |
| `homeThumbnailFit` | 1 |
| `UseHugoToc` | 1 |
| `disableAnchoredHeadings` | 1 |
