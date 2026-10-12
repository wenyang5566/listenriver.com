# 首頁與文章分享圖診斷計畫（2026-10-12）

## 範圍與基準

使用者指出 listenriver.com 首頁與文章分享縮圖怪、未隨網站更新。本輪診斷與計畫，不修改分享模板、圖片或發布。分支 20261012-1，HEAD 4b95c2a4。已確認 codebase-memory 索引根目錄、分支與 HEAD 一致；search_graph 定位 get-social-preview，關鍵行為由原始碼核對。

## 已查證

- 正式首頁與圖片在一般 UA、facebookexternalhit/1.1 模擬請求下均 HTTP 200；這不等於 Meta 真實爬蟲及平台預覽驗收。
- 正式首頁 og:image 指向 https://listenriver.com/images/og-default.png，1200×630、70,165 bytes。遠端圖與本機圖片位元組完全一致，SHA256 3dffe45bbd12eb3140f1adc62322b501a1430bdec0d224370309b849bb6d0c3a。
- 舊圖仍為米色底、舊副標「閱讀、書寫、心理與電影」、大片藍色河形；沒有新 Header logo。視覺判斷：河形占比過大且靠近英文行，縮小或中央裁切後品牌資訊容易失衡。
- 本機及正式的 OG 圖尺寸與 MIME 標籤已存在；目前没有證據顯示首頁缺少 og:image 或圖檔失效。
- 文章 get-social-preview 直接選 cover.image 的原始資源；沒有分享版構圖或縮圖尺寸轉換。首頁卡片的 homeSummary、homeThumbnailPosition、homeThumbnailFit 不會改變分享圖片。
- 四篇正式文章與封面均 HTTP 200：沉住氣的重要 960×1280／206,925 bytes；身心狀態留下的痕跡 1125×826／178,432 bytes；以靜制動 4284×5712／6,411,627 bytes；綠洲 1009×1345／348,490 bytes。三張直式圖，生命樹牌卡約6.4MB。
- 本機首頁有 twitter:card、twitter:image；正式首頁及抽查四篇的原始 HTML 未見這些標籤，待查部署版本與建置差異。
- og:locale 現輸出 zh_tw；協定範例要求 language_TERRITORY，修復時一併規範為 zh_TW。

## 判斷與限制

首頁確實仍使用舊分享圖，文章也直接沿用原始封面；這是已查證的現況。直式圖交給各平台裁切、原圖過大可能使分享畫面不穩定，但尚未取得使用者實際平台預覽或 Meta Debugger 結果，因此不能宣稱已證實平台裁切方式、舊快取或爬蟲封鎖。

favicon 是分頁圖示，與 OG 分享圖不同；本輪 favicon 更新不會自動更新分享圖。

## 實作順序

1. 先製作首頁新版品牌分享卡：1200×630 作為本站統一設計畫布，米白背景、Header 定稿耳廓河流圖形、聆聽的河流字標、現在的網站副標。取消大面積實心河形；主訊息靠近中央，檢查寬卡與方形裁切預覽。這是設計選擇，不保證所有平台以相同比例呈現。
2. 建立文章分享卡：文章圖片＋displayTitle（無則 Title）＋小型品牌標誌；統一畫布與壓縮輸出。人物照片依焦點裁切，書封／牌卡完整保留，無封面則用文字品牌卡。先預覽上述四篇，確認文字長度、比例與留白後再擴大套用。
3. 加入獨立 socialImage／分享取景設定，優先選取明確指定分享圖，其次產生文章分享卡，最後使用新版預設圖。不改正文封面與現有文章網址。以可重製腳本或 Hugo 資源流程產出，避免每篇人工維護。
4. 統一 OG 與 Twitter 選圖，核對輸出只有預期的主圖、絕對 HTTPS URL、MIME、實際尺寸、alt、locale。調查正式缺少 Twitter 標籤的部署差異。新圖片使用新路徑或內容指紋，不原址覆蓋舊圖。
5. 本機與 production 建置驗證首頁、有封面／無封面文章、長標題；檢查全部圖檔存在與尺寸。發布後確認正式 HTML／圖片，再用 Facebook Sharing Debugger 重抓，及使用者實際使用的平台測試。平台快取更新不可用本機結果代替。

## 驗收

首頁識別與新 Header 一致；四篇代表文章人物／牌卡主體不被不當裁掉；長標題可讀；圖片不再直接分享巨大原圖；首頁與代表文章 OG／Twitter 使用同一張預期圖片；正式平台預覽另記錄。

## 來源

- hugo.yaml：params.images、socialDefaultImage。
- layouts/partials/templates/_funcs/get-social-preview.html：選圖及原始封面處理。
- layouts/partials/templates/opengraph.html、twitter_cards.html、head.html：標籤輸出。
- static/images/og-default.png：目前預設圖。
- Open Graph 協定：https://ogp.me/ （已閱讀）。
- Facebook Sharing Debugger：https://developers.facebook.com/tools/debug/ （計畫中的平台驗證工具，未執行）。Meta 圖片官方文件本輪讀取回傳429，沒有使用第三方規格代替已核實的官方要求。

## 第一階段預覽（2026-10-12）

已產出首頁＋四篇文章各1200×630 PNG及中央630×630裁切對照，尚未接入分享meta。重製：`node scripts/preview-social-cards.mjs`。檔案位於 `.tmp/social-preview/`，本機預覽 http://127.0.0.1:1335/ 依賴本輪啟動的靜態服務。

採米白底、定稿Header logo與宋體標題；主要文字集中於中央裁切範圍。人物直式照、牌卡及電影直式封面完整呈現；舞療橫照使用取景。已驗證五張字型／圖片載入及標題不與照片重疊。這是設計初版，待使用者確認後才建立全站生成與正式接入；沒有推送或發布。

第四版：依使用者選擇改為文章純圖片分享圖，標題由平台文字區呈現。人物互動照收窄圖片範圍以保留中央裁切的雙方臉部；舞療橫照調整垂直取景；牌卡／書封完整保留並使用米白留白。首頁品牌卡保持原樣。預覽 http://127.0.0.1:1335/?v=4 。尚未接入正式meta或發布，平台實際裁切待驗證。

## 第四版接入與驗收（2026-10-12）

使用者確認採用第四版，已接入本機。首頁改用 `/images/brand/share-home-v1.jpg`；四篇指定 `socialImage: share-v1.jpg`，保留核定取景。其他可處理的封面由 Hugo AutoOrient、Fit及米白1200×630背景產生 JPEG，OG/Twitter 共用選圖。無封面或不存在的本機封面回退新版品牌卡。

乾淨建置 `.tmp/social-build` 通過；355個含分享標籤頁面皆有1200×630圖、OG/Twitter一致、無失效本機圖路徑，最大圖268,708 bytes。掃描發現「北監酒駕班後記」既有封面路徑失效，分享圖已回退品牌卡；文章原封面及正文未修。locale規範化為zh_TW。首頁與文章列表favicon載入回歸通過。

重製核定圖：`node scripts/preview-social-cards.mjs`，再以安裝Pillow的Python執行 `python scripts/export-social-previews.py`；全站驗證 `python scripts/check-social-images.py .tmp/social-build`。核定分享圖是發布所需靜態資產；public、resources/_gen及.tmp不提交。

目前尚未commit、推送或部署。正式站仍為舊圖，實際Facebook／其他平台重抓與快取更新須待發布後驗收。正式Twitter標籤缺失的部署差異尚未查定；本機production輸出已驗證一致。

## 收尾（2026-10-12）

使用者授權補足、驗證與收尾。「北監酒駕班後記」補入同系列觀察心得既有的北監原始照片，cover.image改為頁面bundle檔案，已不再回退品牌卡。正文及URL保持原樣。補正後Hugo建置與355頁分享圖檢查通過（全部1200×630，最大268,708 bytes，OG/Twitter一致，0失效圖）。後記390／1440px×明暗4組封面載入正常，無橫向溢出，分享圖HTTP200且不是品牌卡。已查看手機文章畫面。

本批完成本機提交；尚未推送或部署，正式站與平台快取驗收仍待發布後執行。
