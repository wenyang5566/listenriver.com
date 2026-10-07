# 首頁：河畔閱讀刊物

在 `codex/hero-flow-evaluation` 直接實作。以使用者本次「可全面改風格、簡單、暖色、文字、閱讀、對話、社群、助人工作」要求為準。

## 設計判斷

首頁像一本打開的刊物：苔綠刊頭、奶油紙色、思源黑體、文章縮圖、細分隔線，以及非對稱選文配置。陶土、沙色、霧藍補充溫暖層次。取消原有 hero、輪播及密集卡片組合，將閱讀順序改成：

1. 刊頭與一句介紹。
2. 一篇主選文、兩篇延伸選文；固定編輯選擇，重新建置不再隨機洗牌。
3. 六個既有閱讀方向，保留分類及會所入口。
4. 最新六篇文章，日期、分類、標題直接可讀。
5. 作者短箋、文章留言邀請、既有 Facebook 與 RSS 入口。

河流是文字之間的連結。刊頭與作者區使用 SVG 色帶、河岸線與流動水光，輕緩循環；提供暫停／播放控制，遵循 reduced motion。沒有 JavaScript 時保持靜止，不綁捲動、不阻擋內容。主選文、兩篇延伸選文與最新六篇文章使用原有文章封面，透過 Hugo 產生響應式縮圖；首圖 eager，其餘 lazy。

依使用者回饋，刊頭採用原本 `river-lines.html` 的彎曲、層疊河道動畫，桌面由約 310px 放大到 520px，手機由約 115px 放大到 235px（窄螢幕 200px）。四周漸淡，水流保持在刊頭右側留白，保留全域播放／暫停與 reduced motion。區段間維持簡單留白與細線，不另外加入橫向波浪裝飾。刊頭 SVG 明確重設定位，避免舊 hero 樣式將手機水流推移到文字後方。

選文依據：〈開放式對話：肯認每一種聲音的存在〉、閱讀心得《成為一個人》與〈慢讀漫談Podcast：空間、關係與自我存在〉。照片、書封與作品圖都來自對應文章。卡片的短標題／引言為首頁編輯文字，文章標題與內文沒有改動。作者介紹依據 `content/about/index.md`。

視覺參考範圍：[Awwwards 作品分類](https://www.awwwards.com/websites/single-page-1/) 的字體與編輯式構圖方向。這是本次原創設計提案，不代表 Awwwards 或 FWA 評審認證。

## 實作邊界

- `layouts/index.html` 首頁第一頁改用 `river-home.html`，既有分頁文章繼續使用原有 article-card。
- 首頁採用精簡導覽；文章、分類、搜尋仍使用既有 header。
- `assets/css/river-home.css` 與 `assets/js/river-home.js` 只在首頁載入，並以 `river-home` body class 限定樣式。深色使用暖黑、淺苔綠與陶土色。
- 字型改為思源黑體系統的 Noto Sans TC 2.04 variable WOFF2 子集（約 242 KiB），包含首頁及目前文章標題；保留 [官方 OFL](https://github.com/google/fonts/blob/main/ofl/notosanstc/OFL.txt) 與原字型內嵌的 Adobe 版權資訊於 `static/fonts/`。使用 `scripts/subset-home-font.py` 可重建；新增罕見字會先使用系統黑體 fallback，必要時更新子集。字型採用 swap，不阻塞文字顯示。
- `data/river-home.yaml` 管理三篇編輯選文；六個方向沿用 `data/taxonomy-landing.yaml`。
- 最新文章沿用 `article-pages.html`；網址、內容目錄、文章互動及搜尋實作不變。
- 原本 hero 與首頁 partial 保留為既有資產，但不再由首頁第一頁呼叫。沒有做全站樣式刪除或部署。

## 驗證

- 以專案根目錄 Hugo 0.166.0 執行 CONTRIBUTING 要求的 `--destination public-build-check`，建置成功。
- 另以 CI 同版 Hugo 0.160.1 extended 建置成功；340 pages、90 paginator pages、241 aliases。
- Playwright：首頁七項與既有文章／分類五項，共 12 項通過；涵蓋 320、390、768、1440px、鍵盤略過導覽、明暗切換與狀態保存、內部目的地、九張圖片載入、河流暫停／恢復／reduced motion，以及無 JavaScript 閱讀。
- URL guard：639 個基準路由，0 新增退化。另有 3 個既有 baseline resolution issues，由檢查工具回報，未將其列為本次新增問題。
- Reading migration：40 條直接 301 與 canonical、Open Graph、sitemap、RSS、內部連結通過。
- 桌面、手機、深色與 320px 截圖放在被忽略的 `.tmp/audit-river-design/`；建置產物不納入來源提交。

程式關係查證先使用 codebase-memory-mcp；專案根目錄與 branch 相符。Hugo 模板關係有解析缺口，實作前已直接核對 baseof、index、head、header 與相關 partial。
