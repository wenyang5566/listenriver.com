# PR66／67 回顧與CI相容性修復（2026-10-12）

PR66（9155c04c）：文章閱讀排版（手機18px、行距2、桌機640px），中文宋體＋英文Merriweather標題，移除閱讀時間；精修Header選單與互動色、首頁摘要／河線／縮圖hover及gallery比例。PR67（9e896c76）：首頁4篇3行、gallery適度放大與3秒輪播；精選原比例圖片、480px文字欄及移除播放暫停按鈕；favicon與分享圖更新；補缺失封面；全站縮圖原比例與恢復hover；single回頂端去重；桌機Header兩段雙向滑動。

兩個PR皆已合併。本機main已與origin/main對齊9e896c76，舊squash歷史造成的pull衝突已處理。

PR67後CI失敗不是待merge：Playwright在啟動Hugo時報get-social-preview的return參數錯誤，Build工作卡在建置。CI與部署固定Hugo0.160.1，本機之前用0.166.0驗證。修復將分享選圖改為分支指派與單一末尾return；修正images分支使用已處理圖片URL。保持explicit socialImage優先與缺圖品牌回退，不更改設計。

同時更新PR66起已過期的搜尋背景色固定RGB預期：以canvas把color-mix標準化為像素色，容差1階，保留明暗色彩驗收而非停用測試。

以官方Hugo0.160.1 extended在暫存目錄驗證建置與355頁分享圖片通過。完整96項測試初跑88通過、7搜尋缺索引跳過、1深色像素捨入失敗；修正捨入並重跑2項色彩通過，建立Pagefind後10項搜尋／系列通過。96項皆完成驗證，未遺留失敗。Hugo0.160.1下圖資大小與既有一致。

修復走新分支codex/fix-social-preview-ci與新PR，未直接推送main或自動合併。GitHub及Cloudflare遠端成功仍需以新PR checks結果確認。舊PR固定SHA的失敗紀錄不會因新PR修復而變綠。
