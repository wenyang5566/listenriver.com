# 專案代理指引

## 架構問題的查證順序

- 回答專案架構、模組關係、相依性、呼叫流程或變更影響範圍等問題時，優先使用 `codebase-memory-mcp` 查詢程式碼關係圖，再根據查詢結果回答。
- 使用關係圖前確認索引對應目前專案與分支；若索引過期，先更新索引（工具支援時）。
- 以目前原始碼確認關鍵結論，並附上相關檔案位置；清楚區分已查證事實與推論。
- 若 `codebase-memory-mcp` 未提供、無法使用，或索引無法更新，明確說明限制，改用檔案搜尋與原始碼閱讀完成查證，不得聲稱已查圖。
- 為節省 token，先用 `index_status` 確認專案與分支，再按問題選用精簡 `get_architecture`、`search_graph` 或 `trace_path`；僅讀取命中項目的必要原始碼。避免每次輸出完整架構圖或整批大檔；解析缺口仍須讀原始碼確認。

## 下次接續網站優化

- 開始網站優化評估時，先讀 `docs/site-optimization-plan-2026-09-28.md` 的「下次接續」段落，再依當次使用者要求執行。
- 9/12 舊報告與其他歷史交接僅作背景，先核對現況，勿重做已完成的閱讀筆記改名與入口整理。

## GA MCP 使用前檢查

- 開啟、驗證或排查 GA MCP 時，先讀本段並確認既有本機憑證，不要直接要求重新建立 OAuth 用戶端。
- 既有電腦用戶端 JSON 位於 `C:\Users\wenyang\client_secret.json`，已於 2026/10/3 保存並在 2026/10/11 核對。只確認檔案存在與用戶端類型；不得輸出密鑰、權杖或將憑證加入 Git。
- ADC 預設位置為 `C:\Users\wenyang\AppData\Roaming\gcloud\application_default_credentials.json`；OAuth 用戶端 JSON 與 ADC 是不同檔案。GA MCP 應使用完成授權後的 ADC。
- 授權需要 `https://www.googleapis.com/auth/analytics.readonly` 與 `https://www.googleapis.com/auth/cloud-platform`。必要時使用既有用戶端重新授權：

```powershell
& "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" auth application-default login --scopes="https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/cloud-platform" --client-id-file="C:\Users\wenyang\client_secret.json"
```

- 授權完成後重新啟動 GA MCP，再呼叫 `get_account_summaries` 驗證；不要把使用者說「已開啟」或登入成功視為 GA API 驗證成功。
- `invalid_grant` 表示憑證失效；`ACCESS_TOKEN_SCOPE_INSUFFICIENT` 表示缺少權限或服務仍使用舊憑證，應核對 MCP 的 ADC 路徑及重新啟動狀態。
- 2026/10/11 重新驗證 `get_account_summaries` 已成功，帳戶為 `github pages`，資源為 `wenyang-blog`（Property ID：`362788041`）。先前的 `403 ACCESS_TOKEN_SCOPE_INSUFFICIENT` 已解除；下次仍應重新測試現況。網站 `page_view` 網路請求成功與 MCP 報表讀取成功須分別確認。

## 專案既有規範

- 遵循 `CONTRIBUTING.md` 的開發與驗證要求。
- 僅提交來源檔案，不提交 `public/`、`resources/_gen/` 或本機快取等產物。
- 未經明確要求，保留既有內容結構與文章網址；內容遷移時應維護舊網址相容性。
