# 閱讀事件：待授權的參數表

狀態：僅提出可檢視的實作方案，沒有新增、啟用或部署 GA 收集程式。既有 GA 不變。

新增行為事件的自動核准審查被拒絕：審查認為一般網站優化授權尚未明確涵蓋將新的閱讀／搜尋中繼資料傳送至 Google Analytics，並指出歷史交接保留現有 GA 行為。送出前須取得使用者明確授權。本表是準備核准的具體範圍，不代表已核准。

## 建議的最小收集範圍

目的地：本站既有 Google Analytics 4 資源 `362788041`，測量 ID `G-P9L49HVNL4`。這些值是既有公開設定，不是憑證。

| 事件 | 觸發 | 僅包含的參數 |
| --- | --- | --- |
| search_submit | 搜尋頁穩定查詢後一次，清除／空查詢不計 | source=search_page；query_length_bucket=1–4／5–12／13+，不傳搜尋字詞 |
| search_result_click | 點擊實際 Pagefind 結果或系列入口 | source=pagefind／series；position（全文結果序號）；target_path（公開文章／系列路徑） |
| reading_path_open | 首頁／作者頁點閱讀路徑入口 | source=home／about；target_path=/reading-paths/ |
| reading_path_start | 從路徑頁點第一篇或其中一篇 | path_id=pain-and-listening；step=1–4；target_path（公開文章路徑） |
| reading_continue | 點策展文末的下一篇 | source=reading_path／editorial；path_id／step（僅路徑）；target_path（公開文章路徑） |

不得包含原始查詢、姓名、聯絡資訊、留言、病史、自訂自由文字、query string、hash 或完整 referrer。公開文章路徑與順序仍會反映讀者的閱讀偏好，這是本次需明確授權的資料用途。

## 啟用前的實作限制

只在 listenriver.com 收集；localhost、預覽、DNT 及人工測試排除。人工正式站測試先設定 `sessionStorage.setItem('river-analytics-disabled','true')`，模組與 GA 載入都須遵守；目前這項排除尚未實作，測試仍靠封鎖第三方請求。

查詢 URL 與搜尋頁不載入 Google tag，以避免增強測量自動讀取 q。搜尋事件只暫存在該分頁的 sessionStorage，下一個沒有 query 的正式文章頁再傳送聚合事件；沒有下一頁的搜尋會漏記，報表需明示這個限制。避免把這個數量當作精確搜尋總量。若要完整記錄，另核對 GA Enhanced Measurement 並設計單獨傳送方式，不在本批直接改 GA 管理設定。

事件與 page context 採白名單；傳送 page_location 去掉 query／hash，page_referrer 至多保留來源 origin。事件 schema、測試排除、去重與不含原查詢須以 mock 測試，再按實際正式 collect 請求驗證。未驗證前不宣稱資料可用。

Google 官方說明：預設 config 會傳 page_view，而 Enhanced Measurement 的 history page_view 不會單靠 send_page_view=false 停止；網站搜尋會依 URL 查詢參數觸發。因此不能只把自訂 payload 的 query 拿掉就宣稱隱私已保護。參考 [頁面瀏覽](https://developers.google.com/analytics/devguides/collection/ga4/views?hl=en)、[增強測量](https://support.google.com/analytics/answer/9216061?hl=en)。

## 2–4 週觀察表

| 問題 | 觀察 | 解讀限制 |
| --- | --- | --- |
| 找得到嗎？ | 搜尋送出／結果點擊、人工無結果任務、27 黃金案例 | 新事件尚無資料；不記關鍵字，不能直接診斷特定漏召回 |
| 路徑入口有人用嗎？ | open → start 的實際事件／使用者序列 | 事件次數不能直接相除當作個人完成率 |
| 續讀理由有幫助嗎？ | start／continue 的同一序列；新讀者的理由回饋 | 點擊不等於讀完；scroll／page_view 也不視為完成 |
| 正式流量可信嗎？ | hostName=listenriver.com、排除人工測試後的觀察 | 歷史 localhost／Lighthouse 流量不混入基線；不刪既有事件 |

取得明確授權後才實作與啟用；當前 commit 不包含事件收集變更。
