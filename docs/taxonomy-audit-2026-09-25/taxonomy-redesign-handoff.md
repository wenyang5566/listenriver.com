# 分類系統後續重整交接報告

日期：2026-09-25  
前置條件：第一階段低風險修正已完成，詳見 [第一階段交接報告](handoff.md)。

本文件只處理第一階段之後的工作：入口文案、統計口徑、category/tag 模型、header 選單、名稱變更、Alias／redirect、SEO 與遷移驗收。後續執行必須分批完成，每批先產生 mapping、建置與 URL 檢查，再進入下一批。

## 一、目前已知問題與決策原則

目前網站同時使用 section、category、tag、會所入口和搜尋入口。主要問題不是單一 taxonomy 技術錯誤，而是同一內容在不同入口使用不同分類語言，造成：

- 使用者不知道 category、tag、會所和搜尋之間的差異。
- 首頁分類卡片的數字容易被理解成全站總數，但實際統計口徑不同。
- 「閱讀與筆記」、「閱讀與觀看」等名稱與 URL 是否同步變更尚未決定。
- tag 數量已足以支援內容關聯，但不適合全部平鋪到 header。
- 若直接刪除 category，舊 category URL、RSS、搜尋結果、外部連結和索引頁可能失效。

後續決策應遵守四個原則：

1. 先改善入口理解，再改資料模型。
2. 保留舊 URL 的相容性，所有 URL 變動先建立 mapping。
3. 不讓 tag 同時承擔主導航、內容分類、系列、格式和搜尋關鍵字等互相衝突的責任。
4. 每一批只能改一種主要變因，方便辨識影響並可回滾。

## 二、建議的執行順序

### 批次 A：只改入口文字與統計口徑

這一批不改 URL、不搬檔案、不刪 category，也不新增 alias。

建議修改：

- 將「六大主題分類」改成清楚的「五大分類＋會所專區」或實際採用的數量。
- 所有數字加上統計說明，例如「主題文章數」、「會所文章數」、「全站文章數」。
- 首頁分類卡片若顯示跨分類 tag，標示「跨分類主題」，避免看起來像獨立主分類。
- 病痛頁的「全部文章」改成「個人病痛書寫」，並單獨呈現「聆聽疼痛計畫」的 12 篇內容。
- 會所入口使用固定名稱，例如「會所」或「會所工作日誌」，不要讓 section 名稱和一般 tag 入口互相競爭。

驗收：桌機與手機首頁、分類總覽、會所入口的文字一致；文章總數與列表內容一致；URL guard 無新增回歸。

### 批次 B：建立 taxonomy 字典與人工試分

在決定是否移除 category 前，先建立內容字典。現有稽核資料可從 [tag 字典](tag-dictionary.md)、[文章清單](article-inventory.csv) 開始。

需要產出：

- category 字典：顯示名稱、slug、用途、代表內容、保留或改名建議。
- tag 字典：保留、合併、停用、只供文章串連四種狀態。
- 舊名稱到新名稱的 mapping：顯示名稱、slug、canonical 目的地、redirect 目的地。
- 15–20 篇跨界文章的人工試分結果，特別檢查同時屬於多個主題的文章。
- 「會所」作為 section、category 或 tag 的角色決定。

人工試分不可只看 tag 數量，必須檢查讀者能否回答三個問題：這篇文章主要談什麼、還有哪些相關文章、這個入口是否值得獨立存在。

驗收：每個保留的分類都有足夠文章、清楚用途和唯一入口；沒有僅因歷史遺留而保留的空分類；每個待合併 tag 都有明確目標。

### 批次 C：在兩種模型間做選擇

#### 模型 1：保留 category，tag 作為交叉主題

適合仍需要清楚的主題入口、SEO 分類頁和編輯管理的情況。

- category：少量、穩定、互斥或近似互斥的主題入口。
- tag：跨分類關聯、人物、方法、概念或系列。
- 會所：獨立 section／專區，不和一般主題 category 混用。

這是目前風險最低、最容易維護的模型，建議作為預設方案。

#### 模型 2：tag-only

只用 tag 也可行，但不能只是刪掉 category。必須先把少量高品質 tag 定義成「主題導覽 tag」，並把一般 tag 保留為文章關聯。

- 主題導覽 tag：約 5–8 個，有固定順序、說明和入口頁。
- 關聯 tag：可增加文章串連，但不直接進 header。
- 系列／企劃：使用獨立欄位或明確 prefix，不與主題 tag 混在一起。
- 舊 category 頁：先保留，再 redirect 到對應主題 tag 頁。

tag-only 的主要風險是標籤數量膨脹、同義詞分裂、編輯標準不一致和 SEO 入口過多。因此不建議在沒有字典、mapping 和人工試分前直接移除 category。

### 批次 D：header 與入口設計

不論最後選擇哪一種模型，header 都不應平鋪全部 tag。建議採用固定的任務導向入口：

```text
首頁
全部文章
主題瀏覽
會所
關於
搜尋
```

若保留 category，「主題瀏覽」進入五大主題分類；若採 tag-only，「主題瀏覽」進入 5–8 個主題導覽 tag。一般 tag 放在文章頁、分類頁或搜尋結果中，不直接放入主選單。

桌機可以使用「主題瀏覽」下拉，手機則使用可展開的主題清單。主選單最多維持 5–7 個一級入口，避免把 taxonomy 管理問題轉嫁給導覽列。

驗收：所有一級入口都有唯一用途；手機選單不超過一個螢幕可理解的層級；從首頁到任一主要主題不超過兩次點擊；沒有孤兒分類頁。

### 批次 E：名稱變更與 Alias／redirect

若決定更改名稱，先分開處理「顯示名稱」和「URL slug」：

1. 優先只改顯示名稱，觀察使用者理解和搜尋資料。
2. 確定 slug 也要改時，建立完整 mapping 表。
3. 對每一個舊 category、tag、文章入口和分頁 URL 指定唯一新目的地。
4. 保留文章 permalink 與 comments 識別，除非有明確 migration 計畫。
5. redirect 規則先精確、後 wildcard；避免 wildcard 把舊文章誤導到分類首頁。
6. 部署前以乾淨輸出跑 URL guard、canonical、sitemap 和 RSS 檢查。

必要 mapping 欄位：`old_url`、`new_url`、`status`、`reason`、`content_owner`、`verified_at`。任何沒有明確新目的地的舊 URL 都先保留，不要批次猜測。

### 批次 F：SEO 與搜尋驗收

分類模型確定後才處理索引策略：

- 只讓有實質內容、描述清楚、值得被搜尋的分類頁進入 sitemap。
- 空分類、重複分類、只有一兩篇文章的過渡頁可 noindex 或 redirect。
- 檢查每個主要入口的 title、description、canonical、Open Graph 和 breadcrumb。
- 確認舊 URL 的 301 目的地不形成鏈式 redirect 或 redirect loop。
- 確認 RSS、Pagefind、站內搜尋和相關文章連結仍能找到同一批內容。
- Search Console 觀察期至少涵蓋一次完整內容更新週期，再決定是否刪除舊入口。

## 三、推薦的最終方向

現階段建議先採「少量 category＋整理後 tag＋獨立會所 section」；不要立即改成完全 tag-only。原因是目前網站仍需要穩定的主題入口，而 tag-only 的維護規則尚未建立。

若後續人工試分證明五大主題無法維持清楚邊界，再考慮 tag-only。即使採 tag-only，也應保留 5–8 個受控的主題導覽 tag，並把 category 舊頁作為相容入口逐步 redirect，而不是一次刪除。

## 四、下一次接續的具體工作清單

1. 閱讀 [完整分類稽核](README.md) 和 [第一階段交接報告](handoff.md)。
2. 完成批次 A 的入口文字與統計口徑修正。
3. 從文章清單抽出 15–20 篇跨界文章做人工試分。
4. 更新 category／tag 字典並標記保留、合併、停用候選。
5. 產出「保留 category」與「tag-only」兩份 header 靜態預覽或 mockup。
6. 召開一次模型決策，記錄選擇、未採用方案和理由。
7. 只有在模型決策完成後，才建立 slug、Alias、redirect 和 sitemap migration mapping。

每一批完成後都要執行：

```powershell
hugo --minify --destination .tmp/taxonomy-next --cacheDir C:/Hugo/listenriver.com/.hugo_cache
python .tmp/audit-taxonomy-20260925/verify_step1.py .tmp/taxonomy-next 3
python scripts/url-guard.py check --site .tmp/taxonomy-next
npm run build
```

若涉及 header 或搜尋互動，再補跑瀏覽器檢查。任何 URL、slug、section 或 front matter 大批變更，都必須先保存 mapping 和建置前基準，確認後才可部署。

## 五、回滾與交接規則

- 每個批次使用獨立 commit，commit message 要包含批次名稱。
- 不把分類名稱變更、文章搬移、header 改版和 redirect 混在同一個 commit。
- 發現 URL、canonical、RSS 或搜尋數量異常時，先回滾該批次，不要直接補更多 redirect。
- 合併 tag 前先保留舊 tag 頁與 mapping；觀察期結束後才決定是否永久 redirect 或 noindex。
- 部署前保留上一版建置輸出與 URL guard 結果，方便比較和回復。

本文件完成後，下一位接手者不需要重新推導「是否刪 category」的風險，只需從批次 A 開始，依序完成字典、模型、header 和 URL migration 的決策。
