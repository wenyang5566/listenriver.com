# Tag 合併：無恥之徒與電影心得

基準提交 `1da09655`，分支 `codex/entry-followup-0928`。本批已實作及本機驗證，隨本次收尾 commit 保存。作者明確要求不 push；未部署。提交識別以本文件的 Git log 為準。

## 已完成

- 移除單篇文章上的 `Shamless`，保留「無恥之徒」；新增作品入口導讀，正式英文 Shameless 仍在文章標題及導讀中。
- 30 篇原本使用「電影」的文章，29 篇原已有「電影心得」，直接去掉冗餘 tag；〈阿鼻〉改為電影心得。合併後電影心得 33 篇、無恥之徒 1 篇，保留原兩集合聯集。
- 全站使用中 tag 41→39；用途分組同步為主題 14、系列 5、形式 7、作品／人物 11，另兩個分類同名 tag 保留在完整索引。
- 對照 HEAD 確认這 30 篇只更動 tag；正文及其他 front matter 不變，文章網址也沒有更名或搬動。

## 舊網址與直接 301

`static/_redirects` 新增 33 條精確規則，連同原已存在的閱讀尾斜線規則，共驗證 34 種來源形式：

| 舊入口 | 形式 | 直接目的地 |
| --- | --- | --- |
| `/tags/shamless` | 無斜線、有斜線、index.html、page/1 的三種形式 | `/tags/無恥之徒/` |
| `/tags/Shamless` | 額外保護原標籤大小寫寫法，同上 | `/tags/無恥之徒/` |
| `/tags/電影` | 無斜線、有斜線、index.html、page/1～3 的三種形式 | `/tags/電影心得/` |
| `/tags/閱讀` | 補齊無斜線、index.html、page/1 三種形式；既有有斜線規則保留 | `/tags/閱讀心得/` |
| 上述四種舊入口的 `index.xml` | RSS | 各自新入口的 `index.xml` |

電影原清單 30 篇，與原電影心得 32 篇交集 29；合併後 33 篇，分頁位置不完全相同。舊 page/2、page/3 導向合併後清單首頁，而非假設新旧頁碼具有相同內容；文章自身網址仍可直接抵達。

新增規則置於既有泛用規則之前。來源／目的地沒有新 wildcard，也不移除歷史規則。HTML 舊首頁與既有分頁另用 Hugo aliases 作靜態預覽回退；RSS 與 HTTP 301 由 Cloudflare 規則負責，Python 靜態預覽不執行 `_redirects`。

參考 [Cloudflare Pages Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)：精確規則先於動態規則，第一個相符來源生效，符合來源的靜態資產仍受規則處理。

## SEO 的實際政策

核對 `layouts/partials/head.html`、`layouts/sitemap.xml` 與本批前後產物後確認：全站 tag 清單原本就是 `noindex, follow`，不列入 sitemap；文章頁與 category 有各自收錄政策。

本輪沿用此政策，沒有把 tag 頁全面開放索引。檢查新入口的 canonical、Open Graph URL、RSS 及內部連結正確；舊 tag 不留在 sitemap，也不再出現在非轉址頁的內部連結。不能把這次 301 宣稱為保證搜尋排名轉移，亦不能宣稱三個新 tag 入口已開放索引。

`robotsNoIndex: false` 不會覆寫 head 模板針對所有 tags 的 noindex 規則，先前僅看 front matter 得出的推論不可沿用。

## 回歸檢查與 CI

- 新增 `docs/site-url-moves.json`，保留閱讀分類遷移及新增兩組 tag 的 canonical／RSS 遷移。`npm run check:urls` 與 Hugo Build workflow 改用合併後 mapping；歷史 `reading-notes-url-moves.json` 保留，但不再足以單獨驗收本分支。
- 新增 `scripts/check-tag-migration.py --site <產物目錄>`，檢查 34 種直接 301、目的地存在／無轉址鏈、canonical／OG／robots／sitemap／RSS、無舊內部連結與原有文章全數保留；已加入 Hugo Build CI。
- 本機 Hugo 0.160.1 ARM64 與 Pagefind 建置通過，仍索引 227 頁。
- 新 tag 遷移檢查、639 條既有 URL guard（0 新增回歸、3 項已知基準問題）、閱讀分類 40 條轉址／SEO 檢查均通過。
- 搜尋 UX 與三個會所系列完整召回通過，紀錄 `.tmp/audit-tag-merge-search.log`。
- 桌機／手機五種閱讀入口檢查通過：分組 tag 無重複或漏項、全部 39 個 tag 能展開、目的地存在、無水平溢出。
- 本輪未執行遠端 CI，未部署，也未驗證正式站的新 HTTP 301。上線後需實測上述根目錄／分頁／RSS 及 URL 編碼形式的狀態碼和 Location。

成功產物 `.tmp/audit-tag-merge`；預覽 `http://127.0.0.1:1324/tags/`。

## 下一步

1. 本批已完成驗收，隨收尾提交保存；下次先確認工作樹與最新提交。作者要求不 push，後續若另行授權上線，才進行遠端 CI 與實際 HTTP 301 檢查。
2. 講座組：先提供 4 篇冗餘「講座」與 9 篇筆記的具體改動／舊 URL 清單，筆記與心得保留用途區別。
3. 繼續核對兩個分類同名 tag、20 篇無 tag 及主題收錄規則；五大 category 保留現況，不自行改成 tag-only。
