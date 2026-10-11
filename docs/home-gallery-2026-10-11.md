# 首頁 Gallery 照片維護

照片放在專案根目錄的 `assets/images/home/gallery/`。直接放在這一層，不放子資料夾，也不放 `static/` 或 `public/`。

支援 `.webp`、`.jpg`、`.jpeg`、`.png`，副檔名大小寫均可。依檔名升冪排列，建議用 `001.jpg`、`002.jpg`、`003.webp` 這類三位數補零編號。至少兩張才啟用輪播。

新增、刪除或替換照片後，Hugo 下次重新建置便會更新照片集合與圓點，並自動產生不同尺寸圖片；正式網站需提交照片並完成部署才會更新。本機 server 通常會自動重建，若沒有立即反映，可重新啟動 Hugo server。

Gallery 在進入畫面後每 6 秒前進一張，最後一張接回第一張。離開畫面、分頁隱藏、滑鼠停留或鍵盤焦點位於圖集時暫停。操作箭頭或圓點時暫停，滑鼠離開且焦點移出後恢復；系統啟用減少動態效果時僅手動瀏覽，並移除滑動過場。依使用者要求不顯示播放／暫停按鈕。

本輪之前的閱讀路線取消紀錄已提交為 `59e6e9b3`。輪播功能來源為 `layouts/partials/home-gallery.html`、`static/js/custom.js`、`assets/css/extended/zzzzz-site-editorial.css`。

驗證：Hugo minified build、JavaScript syntax、手機／桌機明暗模式自動輪播專項通過；獨立 Hugo fixture 確認 JPG／PNG／JPEG／WebP 的讀取、檔名排序與響應式圖片產生。fixture 與截圖留在忽略的 `.tmp/`，未將測試照片加入來源圖集。

完整回歸：78 項 Playwright 測試全數通過。驗證期間照片集合更新為 9 張（包含新增 JPG）；再次建置、重跑 4 個輪播專項並逐張載入確認，所有照片可正常顯示。照片變更保留現況；本輪新增輪播尚未 commit 或部署。

圖片輸出：Hugo 自動產生 WebP 版本，透過 `<picture><source type="image/webp">` 提供；支援 WebP 的瀏覽器實際載入 WebP，另保留原格式的縮圖作為 fallback。來源 JPG／PNG 不會被轉換覆寫。移除播放／暫停按鈕後，輪播仍依可見性、滑鼠、焦點、分頁與減少動態設定調整。

本次接續依目前照片集合整理為 001～010，共 10 張；保留使用者後續移除照片的狀態。輪播、照片與驗證來源一併提交，正式站更新需由 main 完成部署。
