# 全站五種閱讀入口分組：第一批

分支 `codex/entry-followup-0928`，基準 `d2aa7464`。狀態：實作與收尾驗收完成，隨本次收尾 commit 保存；未 push／部署。提交識別請以本文件的 Git log 為準。

## 最新決策與實作

- 作者將會所實習的專區簡稱更正為「實習日誌」，已更新 `data/clubhouse-series.yaml`；正式名稱、taxonomy key 與網址仍是會所實習。
- 主軸回到全站整理。主題總覽 `/tags/` 依五種閱讀入口呈現：五大分類、主題與方法、系列與計畫、內容形式、作品與人物。這是前台用途分組，沒有建立新的 taxonomy，也沒有把五大 category 改成 tag。
- `data/tag-groups.yaml` 集中管理主要分類順序及 tag 的主要用途。四種 tag 用途分別有 14／5／8／12 項，共 39 個；五個 category 作第一組入口。
- 助人工作／病痛經驗同名 tag 不在主要用途組中重複列出，仍保留於可展開的全部 41 個標籤索引，尚未刪除資料或變更它們的舊 URL。
- 同一 tag 只列一個主要用途，兼具系列或作品用途的項目不再額外造同義 tag。零碎 tag 保留。
- 主題總覽以分組取代「常用主題」橫向列，完整索引預設收合。首頁版型保持原樣。
- `content/tags/_index.md` 更新導讀，移除未依讀者數據計算的「熱門」描述。

## 本機驗證

- Hugo 0.160.1 ARM64 建置成功，Pagefind 1.5.2 索引 227 頁。
- 桌機／手機均檢查五個閱讀分組、五個 category 入口、39 個分組 tag 唯一且完整、全部 41 個 tag 可展開，並核對分組連結的本機目的地檔案存在，無水平溢出；已檢視手機全頁截圖。
- 初次檢查抓到英文 Shamless 的 taxonomy lookup 大小寫差異，改用 lowercase key 後完整性檢查通過，不以跳過英文 tag 當完成。
- 搜尋 UX 通過，維持會所實習／日誌／手冊 7／19／4 的全部召回。
- URL guard：639 條基準路徑，0 新增回歸，保留 3 項已知基準問題。閱讀筆記 40 條轉址規則、canonical、Open Graph、sitemap、RSS 與內部連結通過。
- 暫存檢查程式 `.tmp/audit-tag-group-check.mjs` 與圖片 `.tmp/audit-tag-groups-desktop.png`、`.tmp/audit-tag-groups-mobile.png` 不提交。

預覽 `http://127.0.0.1:1323/tags/`；產物 `.tmp/audit-tag-groups`。會所簡稱可在同一預覽 `/clubhouse/` 檢查。

## 接下來的主軸

1. 合併 Shamless→無恥之徒：核對單篇資料、所有舊 URL／RSS、直接 301 與新 canonical，更新字典。正式作品名稱保留無恥之徒。
2. 合併電影→電影心得：逐篇確認阿鼻與其餘三篇差集，導读範圍包含劇集；旧 tag 分頁的排序可能不同，不能照頁碼盲目轉址。
3. 閱讀相關去重：現有來源沒有使用中的「閱讀」tag，查舊入口與 alias；保留書摘／閱讀心得的不同用途。
4. 講座組：冗餘講座 tag 為候選，筆記／心得保留分工，移除前提供具體清單。
5. 同名 category/tag、20 篇無 tag 與主題收錄準則逐篇整理；不重新開啟 tag-only 或批次加雙分類。

每組資料合併後同步更新 tag 分組字典、舊 URL mapping 與 SEO／搜尋驗證。第一批完成的是呈現及用途管理，不代表全站資料去重已完成。

## 收尾驗收與重開工作

作者要求驗收後 commit 收尾，本次沒有繼續執行 tag 資料合併。

- 最新產物 `.tmp/audit-tag-groups` 重跑桌機／手機分組檢查通過：五大分類 5 個入口，主題 14、系列 5、形式 8、作品／人物 12；全部 41 個 tag 可展開且沒有漏列，所有分組目的地檔案存在，無水平溢出。
- 確認會所總頁使用「實習日誌」，沒有過時的「實習紀錄」。
- `check-clubhouse-entry.py` 通過：30 篇文章、152 個系列卡片連結、舊 tag 路徑保留。
- `check-search-ux.mjs` 重跑通過；紀錄 `.tmp/audit-tag-groups-final-search.log`，維持三個系列 7／19／4 篇完整召回。
- 5 項既有 Playwright 文章／taxonomy 版面測試通過，測試目標為 1323 的本批產物。
- URL guard 639 條基準路徑 0 新增回歸，3 項原基準問題仍在；閱讀筆記遷移與 SEO 產物檢查通過。`git diff --check` 通過。

下次先確認 `git status --short` 與 `git log -3 --oneline`。接續從 Shamless→無恥之徒這一組開始，完成文章／網址盤點、合併、直接 301、建置與 SEO／搜尋驗收後，再做電影組。閱讀相關的歷史轉址需核對，但書摘與閱讀心得保留分工。其餘細節見上方五步計畫與全站決策文件。
