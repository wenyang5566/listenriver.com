# 技術、可及性與正式效能檢查

日期：2026-10-13（Asia/Taipei），分支 `20261013-1`，HEAD `13a21caceea52549ab7a64b74e260412e5024206`。本輪只評估；未修改網站來源、提交或部署。

## 基準與範圍

關係圖已核對目前根目錄／分支／HEAD，ready；先查搜尋與互動入口，再用原碼核對。Hugo partial 有解析缺口，不把圖當完整模板關係。乾淨建置輸出 `.tmp/awards-audit-20261013/site`，獨立cache，Python靜態server於 `http://127.0.0.1:1340/`。工具為Hugo0.160.1 extended、Pagefind1.5.2 Extended、Edge155.0.4283.45、Lighthouse13.5.0／axe4.14.0。

| 檢查 | 結果 | 證據 |
| --- | --- | --- |
| Hugo建置 | 成功，340Pages／72Paginator／280Aliases／5,314Processed images，22.598秒 | `.tmp/awards-audit-20261013/build.log`；圖片數不是單頁下載數 |
| Pagefind | 掃612HTML、索引227頁、zh-tw | 同目錄 `pagefind.log` |
| URL unit | 10項通過 | `url-unit.log` |
| URL baseline | 639基準、0新增回歸、3歷史解析問題 | `url-guard.log`；未冒稱639全正常 |
| 閱讀筆記遷移 | 40條direct301、canonical／OG／sitemap／RSS／內連通過 | `reading-migration.log` |
| 會所遷移 | 30公開文章／1保留草稿、aliases／互動key通過 | `clubhouse-migration.log` |
| 首頁CSS子集 | 同步檢查完成，kept268／removed1,274、39,133bytes | `css-subset.log`；沒有修改子集來源 |
| 搜尋UX | 英雄預填／結果／URL同步／清除／Header導向及完整會所入口通過 | `search-ux.log`；中文漏召回另見content-ia.md |
| Playwright | 96項中95通過、1失敗；失敗單項再跑3次皆失敗 | [e2e.json](e2e.json)、`e2e-rerun.log` |

## 全站產物掃描

[html-audit.json](html-audit.json)保存全量結果。612HTML＝257meta-refresh aliases＋355非aliases；67,467個站內href／src／srcset參照、4,547個引用資產，在percent decoding、相對路徑及exact `_redirects`解析範圍內，缺失檔／片段均0。這不是外部HTTP存活測試，也不等於逐篇人工閱讀。

非alias頁title／description／canonical／lang／OG都有；25個H1數量異常：`/page/2/`～`/page/23/`共22頁無H1、404無H1，兩篇文章有兩個H1：`/blog/助人工作/北監酒駕班後記/`、`/blog/成為自己/傾聽自己是善待自己的方法/`。重複metadata群為title20／description17／canonical19，多屬列表分頁；`layouts/partials/head.html:13`已設分頁noindex，故不直接判定新增索引重複。殘留首頁分頁應規定其用途與相容性，不能直接刪除歷史URL。

## 自動與人工可及性證據

本機10組頁型／尺寸／明暗樣本，外部請求全部阻擋、reduced motion設為reduce，只驗第一方DOM與操作。[browser-audit.json](browser-audit.json)中的樣本無水平溢出、pageerror、已載入圖片失效，第一Tab落在skip link。首頁／分類／tag／關於／會所／搜尋樣本未檢出自動違規，但有contrast incomplete項目，不能視為人工對比全通過。

已檢出：

- 文章390px淺色：留言／喜歡文字約2.96:1，底部工具列文字約4.1:1；一般小字應至少4.5:1。字級按鈕另有 `label-content-name-mismatch`，可見「Aa／字級」與可存取名稱需一致核對。
- 文章1440px深色：作者連結与旁文約1.62:1，且無底線，檢出 `link-in-text-block`；應以非色彩方式辨识。
- 正式手機Lighthouse另檢出首頁gallery dots：實際10×10px、鄰近有效間距不足24px，9個節點命中target-size。維持小圓點外觀即可，擴大按鈕命中區及間距，不必把點畫成巨大圓形。
- 正式正念文章：H1後直接H3「解釋」命中heading-order；留言／喜歡計數和字級名稱有label-content-name-mismatch。計數與裝飾字形如何納入名稱需人工核對，不能機械地將所有畫面字串加進aria-label。

skip link、燈箱焦點／inert、手機選單焦點移入與返回、gallery reduced-motion均已存在，不重列為未做。普通輪播仍需持續暫停控制，詳[主報告](../../site-awards-readiness-audit-2026-10-13.md)；這不是完整WCAG認證。

## 桌機Header失敗的實際界線

失敗測試為 `tests/scroll-navigation.spec.js:315`，設定nav--compact並把動畫時間停在140ms，預期opacity=1但收到0；獨立重跑3次一致。另一方面，[header-animation-diagnostic.json](header-animation-diagnostic.json)在同版Edge、本機頁面，於同一DOM操作中強制讀取computed style後取得transition，再停在140ms，得到opacity=1、translateY=-42.30px；加paint wait亦相同，符合原設計。

因此目前證據是「測試與獨立診斷不一致」，不能直接宣稱正式Header動畫壞掉。合理下一步是固定兩次跨工具evaluate間的transition生命週期，檢查動畫是否在採樣前已完成，再區分測試時序與產品回歸。本輪保留失敗，不修改程式或降低斷言。

## 正式站手機Lighthouse：本輪新結果

三次首頁與三次正念文章，2026-10-13臺北09:49～09:51。皆為正常HTTPS navigation，`blockedUrlPatterns=null`、`disableStorageReset=false`；沒有為提高分數阻擋第三方。請求紀錄可見Google Analytics200／204、文章Worker stats／view及Waline count200。測量會產生正常測試瀏覽資料，後續GA自然流量分析需排除本日人工測試。

條件：Lighthouse13.5.0，Edge155.0.4283.45 headless，412×823／DPR1.75、mobile formFactor、simulate throttling、RTT150ms、throughput1638.4Kbps、CPU4倍；默認storage reset。這是實驗室模擬值，非真實Moto手機或CrUX第75百分位。六份JSON無runtimeError／runWarnings。保存的[摘要](lighthouse-summary.json)與 `.tmp/awards-audit-20261013/lh-{home,article}-{1,2,3}.json` 可追溯每次結果。

| 頁面／次數 | Performance | Accessibility | LCP秒 | FCP秒 | TBT毫秒 | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 首頁1 | 76 | 96 | 5.257 | 2.764 | 23.5 | 0 |
| 首頁2 | 89 | 96 | 3.740 | 1.295 | 10 | 0 |
| 首頁3 | 88 | 96 | 3.655 | 2.143 | 38 | 0 |
| **首頁中位** | **88** | **96** | **3.740** | **2.143** | **23.5** | **0** |
| 正念文章1 | 95 | 98 | 2.660 | 1.904 | 34.5 | 0 |
| 正念文章2 | 94 | 98 | 2.792 | 1.828 | 32 | 0 |
| 正念文章3 | 94 | 98 | 2.748 | 1.965 | 31 | 0 |
| **文章中位** | **94** | **98** | **2.748** | **1.904** | **32** | **0** |

六次Best Practices／SEO皆100，但这些分數只覆盖对应自动审计；本轮已知搜尋／語义／对比等问题依然成立。總傳輸約首頁0.889MB、文章0.749MB，含該次正常載入資源。

LCP元素皆為封面：首頁主精選 `a.river-lead-link > div.river-photo > picture > img`；文章 `figure.entry-cover > picture > img.is-zoomable`。兩者均在初始HTML可發現、eager、高fetchpriority，不能再當成「首圖仍lazy／未提高優先權」修一次。

**raw觀察與simulate值分開：** 首頁raw LCP breakdown的element render delay依序55.9／228.6／307.3ms，resource load duration785.8／359.3／228.2ms；文章render delay137.4／278.2／247.7ms。這些raw子時間不能直接相加解釋上表模擬LCP。本輪未重現舊報告約2秒的render delay，因此不能把舊等待直接當今天根因。慢首頁樣本的封面載入較長，加上blocking CSS，是下一輪固定條件查瀑布的候選。

文章stylesheet在代表run傳輸47.4KB；Lighthouse估35.4KB未使用CSS、約230–240ms潛在節省，屬目前載入狀態的估算，不等於可以刪掉75%的全站樣式。須保護深色、手機工具列、選單、燈箱等隱藏狀態後再分頁型減量。首頁仍有blocking CSS／request dependency提示；低TBT與CLS0是優點，新代表互動須保住。

## Worker：本機可重現，未操作正式DB

[worker-sql.json](worker-sql.json)以原碼抽出的INSERT／ON CONFLICT SQL在本機SQLite記憶體測試：新slug首次views／likes均0，第二次才1。[worker-input.json](worker-input.json)直接呼叫現行exported fetch、使用未被调用的空DB mock：post=42／{}／[]皆500（trim非函式），null／空字串400。

來源：`workers/post-interactions/src/index.ts:93`、`:136`、`:145`。只支持目前來源的行為，不把本機結果當正式Worker已部署測試。建議修新列起始增量、執行期輸入型別與長度／路徑約束，先有本機行為測試再部署。view去重／like語意需維持前端與API一致，Worker計數不是GA自然訪客數。

## 尚未完成

其他文章／分類的正式Lighthouse多次量測、Safari／Firefox／真機、讀屏完整任務、所有外部HTTP連結、field CWV、Cloudflare／Waline設定與正式DB並行行為均未完成。本輪截圖和raw結果不是完備驗收；後續修復依問題樣本分批進行。
