# Cloudflare 正式轉址補修

PR #72 合併、正式部署成功後實測：新分類、26篇文章、RSS與sitemap正常；16條舊分類規則只有6條正常301，其餘回200 alias、308標準化或404 feed。因此本機規則解析通過不能代表正式平台已採用所有規則。

既有 `_redirects` 第70行即出現動態萬用字元，其後大量精確規則仍排在檔案尾端。Cloudflare parser 在首條動態規則之後會把後續規則計入100條動態額度，超限後略過尾端。這與前段page/3、page/4規則正常、尾端新規則失效的觀察一致。

- 修正僅移動4條萬用字元／placeholder規則到檔尾，972條精確規則維持相對順序。976條規則的source、destination、status集合完全不變。
- URL guard新增靜態優先排序、2000靜態／100動態額度與1000字元行長檢查；既有CI已執行此guard與單元測試。
- 13項Python測試通過；Hugo建置成功；639條歷史URL零新增回歸，3項既有解析問題保留。
- 此補修不改HTML/CSS/JS或文章；PR #72 的131項瀏覽器測試已通過。正式部署後須重測16條301與26篇文章，才能結案。

來源：[官方排序與額度規範](https://developers.cloudflare.com/pages/configuration/redirects/)、[Cloudflare parser原始碼](https://github.com/cloudflare/workers-sdk/blob/main/packages/workers-shared/utils/configuration/parseRedirects.ts)、[對應議題](https://github.com/cloudflare/workers-sdk/issues/14694)。
