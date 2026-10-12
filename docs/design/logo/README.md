# 聆聽的河流 LOGO｜正式定稿

狀態：使用者已審定。定稿日期：2026-10-08。

這是品牌 LOGO 圖形，與 Hero 的生長枝枒插畫不同。後續工作請以本文件及 static/images/brand/ 下的檔案為準；歷史 v1–v11、無點快照與試排頁不作為交付來源。

## 正式檔案

- 彩色主版：../../../static/images/brand/listenriver-logo.svg
- 單色版：../../../static/images/brand/listenriver-logo-mono.svg（currentColor；外部圖片使用時預設黑色，指定顏色宜內嵌 SVG）
- 深色背景版：../../../static/images/brand/listenriver-logo-dark.svg
- 審定預覽：../listening-growth/approved.html

## 定稿規格

01 陶土 × 河青：耳廓 #B97760；河流 #4E898A。透明背景，viewBox 0 0 64 64。主線寬 3.5、小弧寬 2.8，端點與轉角圓潤。無圓點，保留放寬耳廓、飽滿耳垂、加長的河流主線，以及稍往右、往上移的小弧。深色背景適配使用 #DFA78E 與 #8BB2B5。

等比例縮放，保留完整圖形與留白，不拉伸、不另加點或枝枒。一般介面建議 24 px 以上。配字標時使用網站既有字標；審定頁的文字搭配僅展示比例，不是另定的字標。

## Favicon 使用

此 LOGO 可以作為網站 favicon。SVG 能直接作為現代瀏覽器的圖示來源。後續接入時可使用 /images/brand/listenriver-logo.svg，並輸出 32×32、16×16 PNG/ICO 作相容備援；16 px 必須實際檢視小弧間距，若需像素微調，另外保存 favicon 專用版，不覆蓋正式 LOGO。Apple touch icon 宜另製 180×180 並加適當背景與留白。

已在 `codex/hero-flow-evaluation` 接入共用頁首與首頁主標，初版保存本機 commit `1b338988`。2026-10-09 使用者確認 Hero 與 Logo 整體定稿，保存後續本機提交。正式頁首沿用定稿幾何與明暗配色；Hero 使用較輕的插畫線寬及獨立延伸河線，不覆寫正式 SVG。整合紀錄見 [首頁 Logo 整合](../../home-logo-integration-2026-10-08.md)。尚未更新遠端 PR 或部署；favicon 仍未替換。

## Favicon 本機實作（2026-10-12）

在 `20261012-1` 接入全站共用 head，沿用 Header 左上角的正式圖形。SVG 依瀏覽器明暗背景調整配色；20px 以下主線 4.4、小弧 3.4，16px PNG 使用相同小尺寸線寬。32／48px 與 Apple 圖示保留正式幾何；Header 原檔不變。

資產位於 `static/images/brand/`：favicon.svg、favicon-16.png、favicon-32.png、favicon-48.png、favicon.ico（16／32／48px）、apple-touch-icon.png（180px，米白底、圖形占72%）。

重製：`node scripts/generate-favicons.mjs`，再用已安裝 Pillow 的 Python 執行 `python scripts/generate-favicon-ico.py`。前者需要專案 Playwright 與 Windows Edge。所有圖示都是發布所需的靜態品牌資產。

Hugo 建置通過，首頁／文章列表五個圖示連結均 HTTP 200；ICO 尺寸與16px PNG像素一致已驗證。已查看16／32px明暗背景預覽。已完成本機實作，尚未推送或部署。
