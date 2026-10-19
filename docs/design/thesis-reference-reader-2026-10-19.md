# 論文文獻預覽與收合驗收

2026-10-19。分支 `codex/article-heading-structure`。保留一篇全文及原文，私人PDF仍禁止收錄。

## 實作

- 中文、英文、網頁資料各一個原生details，七個附件各自details，預設收合。所有原文仍在HTML中，目錄、附件引用與直接片段URL會展開對應區塊。
- 桌機滑鼠停留300ms預覽，移出引用與卡片240ms後關閉；點擊固定。鍵盤聚焦也能預覽。
- 手機點擊顯示中央小窗，多筆書目在窗內捲動；關閉鈕、Esc與點窗外關閉，焦點回到引用。開關小窗不改正文捲動位置或網址片段。
- 三組參考文獻及七個附件的收合標題採22px，全文區塊與原稿層級維持原設定。
- 小窗只複製原書目，保留原有外部連結；移除複製內容的ID，避免重複錨點，不生成摘要。不提供本站PDF。
- 無JavaScript時，引用是前往文末書目的原生連結；原生details可直接展開，片段定位亦可展開。
- 只在thesis shortcode載入專用JS/CSS。共用footer對已處理事件及文獻引用不再執行章節跳轉。

## 引用配對範圍

171筆書目：中文48、英文116、網頁資料7。原稿不少書目跨段落，人工核對起點後由data/thesis-references.json記錄邊界，保留全部續段（含跨行作者與DOI）。

共342個可預覽引用連結，涵蓋中文、英文、敘述式引用、多筆括號引用，以及原著／譯本雙年份。不以模糊字串或年份相近強行配對。同一括號若只有部分可確認，只連結可確認部分。

以下為未完全配對的9組括號，原文均保留；這不是要求作者改論文：

| 原段落ID | 原引用 | 保留原因 |
| --- | --- | --- |
| `source-p-149` | （Brissett & Sherris, 2001; Masanovic & Téot, 2020；榮民總醫院，2023） | 榮民總醫院為縮稱，書目列完整科別；其餘兩筆可預覽 |
| `source-p-155` | （胡昆宜等人，2007；衛生福利部，2019） | 衛生福利部2019與文末食品藥物管理署名稱不完全相同 |
| `source-p-159` | （衛生福利部，2012） | 衛生福利部2012與文末國民健康署名稱不完全相同 |
| `source-p-164` | （林智生、張家禎，2001） | 內文張家禎、書目張家楨，用字不同 |
| `source-p-389` | （1984，取自Rier, 2010） | 1984未帶作者，Rier 2010部分可預覽 |
| `source-p-534` | （CDC, 2024） | CDC縮寫未擅自等同文末機構全名 |
| `source-p-871` | （榮民總醫院，2023） | 榮民總醫院為縮稱，未擅自等同完整科別 |
| `source-p-1382` | （孫雷銘，2015；衛生福利部，2019） | 衛生福利部2019名稱不完全相同，孫雷銘部分可預覽 |
| `source-p-1689` | （Audulv, 2013） | Audulv 2013未找到同年書目（原稿列2011、2021） |

另保留敘述式引用VonKorff／Resche（source-p-170，與書目Von Korff／Le Resche寫法不同）、Parson（source-p-1633，書目為Parsons），以及source-p-472兩個未帶作者的1963頁碼引用；不自動更正原文。

## 對照表

下表顯示每筆書目邊界、辨識作者／年份與連結使用次數。完整機器對照（逐處引用及未配對括號）在本機忽略檔 `.tmp/thesis-reader-conversion.json` 的reader欄位。

| 書目起點 | 作者／年份 | 連結次數 |
| --- | --- | ---: |
| `source-p-1770` | 王志中（2024） | 1 |
| `source-p-1772` | 朱元鴻（2006） | 1 |
| `source-p-1774` | 江孟冠（2010） | 2 |
| `source-p-1776` | 李明濱（1997） | 1 |
| `source-p-1777` | 林文源（2009） | 2 |
| `source-p-1779` | 林文源（2017） | 2 |
| `source-p-1781` | 林仲（2001） | 5 |
| `source-p-1783` | 林宛柔（2021） | 4 |
| `source-p-1785` | 林智生、張家楨（2001） | 0 |
| `source-p-1787` | 林育志、鄭宇珊、陳偉權（2023） | 1 |
| `source-p-1789` | 林雅娟、張峰玉（2018） | 1 |
| `source-p-1791` | 林義淳（2011） | 1 |
| `source-p-1793` | 林耀盛、吳英璋（1999） | 1 |
| `source-p-1795` | 林耀盛（2009） | 2 |
| `source-p-1797` | 林耀盛（2019） | 4 |
| `source-p-1799` | 胡文郁、陳宛榆、羅淑芬、陳書毓、黃翰心、陳幼貴（2011） | 1 |
| `source-p-1801` | 胡昆宜、趙昭明、張景勳、羅慶徽（2007） | 2 |
| `source-p-1803` | 洪彩慈、駱麗華（2000） | 1 |
| `source-p-1805` | 連心瑜、莊文怡、楊瑞永、陳胡安琪、鍾慧儀、汪國成（2007） | 1 |
| `source-p-1808` | 高美華（2011） | 2 |
| `source-p-1810` | 孫雷銘（2015） | 8 |
| `source-p-1812` | 孫慕義（2015） | 1 |
| `source-p-1814` | 翁嘉英、吳振能、吳英璋（2003） | 2 |
| `source-p-1817` | 梁力云（2022） | 3 |
| `source-p-1819` | 張瑋文（2004） | 1 |
| `source-p-1821` | 張麗珍（2010） | 1 |
| `source-p-1823` | 畢恆達（2020） | 5 |
| `source-p-1824` | 莊曄媺、葉英堃（1999） | 3 |
| `source-p-1826` | 莫藜藜（2020） | 4 |
| `source-p-1827` | 鈕文英（2015） | 6 |
| `source-p-1828` | 黃林秀善（2017） | 1 |
| `source-p-1830` | 黃學文、黃政昌（2020） | 0 |
| `source-p-1832` | 黃秀慧（2024） | 1 |
| `source-p-1834` | 黃靜怡（2022） | 1 |
| `source-p-1836` | 當代醫學編輯部（2009） | 5 |
| `source-p-1838` | 楊美賞、曾清楷、鍾信心、葉宏軒（1992） | 1 |
| `source-p-1840` | 葉肅科（2008） | 2 |
| `source-p-1842` | 潘世毅（2010） | 1 |
| `source-p-1844` | 潘淑滿（2022） | 10 |
| `source-p-1845` | 蔡友月（2004） | 2 |
| `source-p-1847` | 蔡嘉軒（2022） | 5 |
| `source-p-1849` | 賴佳汶（2016） | 2 |
| `source-p-1851` | 謝瑞坤（2003） | 1 |
| `source-p-1853` | 簡春安、鄒平儀（2016） | 1 |
| `source-p-1854` | 簡苑玲（2019） | 3 |
| `source-p-1856` | 隱匿（2022） | 3 |
| `source-p-1857` | 羅淑芬、張麗蓉、薛婷元、潘靜怡、吳慧絹（2016） | 1 |
| `source-p-1859` | 龔卓軍（2005） | 1 |
| `source-p-1862` | Addison（1854） | 1 |
| `source-p-1864` | Anaba、Adeife-Cole、Oaku（2023） | 4 |
| `source-p-1866` | Audulv、Asplund、Norbergh（2011） | 1 |
| `source-p-1867` | Audulv、Hutchinson、Warner、Kephart、Versnel、Packer（2021） | 1 |
| `source-p-1868` | Barone、Safran、Vorstenbosch、Davison、Cugno、Murphy（2021） | 7 |
| `source-p-1870` | Beals、Peplau、Gable（2009） | 1 |
| `source-p-1872` | Benson、O'Toole、Lambert、Gallagher、Shahwan、Austin（2015） | 1 |
| `source-p-1874` | Berman、Young、McAndrews（2015） | 1 |
| `source-p-1876` | Betarbet、Blalock（2020） | 1 |
| `source-p-1878` | Bijlard、Kouwenberg、Timman、Hovius、Busschbach、Mureau（2017） | 5 |
| `source-p-1880` | Blit、Jeschke（2012） | 8 |
| `source-p-1882` | Bock、Schmid-Ott、Malewski、Mrowietz（2006） | 8 |
| `source-p-1884` | Bourke（2013） | 0 |
| `source-p-1886` | Bourke（2023；2013/2023） | 1 |
| `source-p-1888` | Brissett、Sherris（2001） | 4 |
| `source-p-1890` | Brown、McKenna、Siddhi、McGrouther、Bayat（2008） | 9 |
| `source-p-1892` | Brown、Moss、McGrouther、Bayat（2010） | 2 |
| `source-p-1894` | Bury（1991） | 1 |
| `source-p-1896` | Cassell（1982） | 3 |
| `source-p-1898` | Chambon、Irving、Epstein（2005；1999/2005） | 1 |
| `source-p-1900` | Charmaz（1991） | 1 |
| `source-p-1901` | Chaudoir、Fisher（2010） | 1 |
| `source-p-1903` | Cleeland（1985） | 1 |
| `source-p-1905` | Cockerham（2014） | 3 |
| `source-p-1906` | Conrad（1985） | 1 |
| `source-p-1908` | Conrad（1990） | 7 |
| `source-p-1910` | Corbin、Strauss（1985） | 7 |
| `source-p-1912` | Corrigan、Rao（2012） | 1 |
| `source-p-1914` | De Menezes Neto、Magnani、Neto、Júnior（2022） | 5 |
| `source-p-1916` | Draaijers、Tempelman、Botman、Tuinebreijer、Middelkoop、Kreis、Zuijlen（2004） | 1 |
| `source-p-1918` | Earnshaw、Quinn（2012） | 1 |
| `source-p-1920` | Elman、Hynan、Gabriel、Mayo（2010） | 1 |
| `source-p-1922` | Engel（1977） | 3 |
| `source-p-1924` | Engel（1980） | 2 |
| `source-p-1926` | Foucault（2019；1963/2019） | 4 |
| `source-p-1928` | Frank（1995） | 1 |
| `source-p-1930` | Friedstat、Hultman（2014） | 1 |
| `source-p-1932` | Fukunishi（1999） | 1 |
| `source-p-1934` | Goffman（1959） | 1 |
| `source-p-1936` | Goffman（2010；1963/2010） | 15 |
| `source-p-1938` | Gutierrez、Carmichael、Feldman、Chandy（2024） | 2 |
| `source-p-1940` | Hassan、Masenga（2020） | 1 |
| `source-p-1942` | Hsieh、Maisel-Campbell、Joshi、Zielinski、Galiano（2021） | 4 |
| `source-p-1944` | Joachim、Acorn（2000） | 2 |
| `source-p-1946` | Juckett、Hartman-Adams（2009） | 1 |
| `source-p-1948` | Kassi、Kouame、Kouassi、Allou、Kouassi、Kourouma、Ecra、Sangare（2020） | 3 |
| `source-p-1950` | Kleinman（1986） | 2 |
| `source-p-1952` | Kleinman（2020；1988/2020） | 13 |
| `source-p-1954` | Knowles、Glass（2023） | 2 |
| `source-p-1956` | Koch、Jenkin、Kralik（2004） | 1 |
| `source-p-1957` | Kralik、Koch、Price、Howard（2004） | 2 |
| `source-p-1959` | Kralik、Price、Telford（2010） | 3 |
| `source-p-1961` | Lee、Yosipovitch、Chan、Goh（2004） | 1 |
| `source-p-1963` | Lehman、David、Gruber（2017） | 1 |
| `source-p-1965` | Levine、Degutis、Pruzinsky、Shin、Persing（2005） | 1 |
| `source-p-1967` | Lincoln、Guba（1985） | 1 |
| `source-p-1968` | Limmer、Kerby、Lies、Limmer、Limmer、Teske、Savory、Reisch、Glass（2022） | 3 |
| `source-p-1970` | Link（1987） | 2 |
| `source-p-1972` | Link、Phelan（2001） | 1 |
| `source-p-1974` | Lu、Chu、Zheng（2021） | 5 |
| `source-p-1976` | Lumenta、Siepmann、Kamolz（2014） | 2 |
| `source-p-1978` | Lyons、Peacock、Braunberger、Viola、Ozog（2019） | 2 |
| `source-p-1980` | Lyons、Ozog、Lim、Viola、Tang、Jones（2023） | 4 |
| `source-p-1982` | Macgregor（1990） | 1 |
| `source-p-1984` | Martin、Umraw、Gomez、Cartotto（2003） | 1 |
| `source-p-1986` | Masanovic、Téot（2020） | 1 |
| `source-p-1988` | Melzack、Katz、Jeans（1985） | 1 |
| `source-p-1990` | Merleau-Ponty（1945/1962） | 1 |
| `source-p-1992` | Mishler（1984） | 1 |
| `source-p-1994` | Moore、Tangney（2017） | 3 |
| `source-p-1996` | Moss（2005） | 2 |
| `source-p-1997` | Motoki、Isoldi、Brito、Filho、Ferreira（2019） | 3 |
| `source-p-1999` | Nettleton（2013） | 1 |
| `source-p-2001` | Ngaage、Agius（2018） | 5 |
| `source-p-2003` | Nicholas、Falvey、LeMonas、Damodaran、Ghannem、Selim、Navsaria、Myers（2012） | 1 |
| `source-p-2005` | O'Donnell、Habenicht（2022） | 2 |
| `source-p-2007` | Ogawa（2017） | 2 |
| `source-p-2009` | Ogawa（2020） | 1 |
| `source-p-2011` | Oliveira、Alvarenga、Ramos-e-Silva（2022） | 1 |
| `source-p-2013` | Oluwasanmi（1974） | 1 |
| `source-p-2015` | Park（2010） | 1 |
| `source-p-2017` | Parsons（1951） | 2 |
| `source-p-2019` | Pellegrino（1981） | 1 |
| `source-p-2021` | Penchansky、Thomas（1981） | 4 |
| `source-p-2023` | Pierret（2003） | 4 |
| `source-p-2025` | Price、Bush、Long、Harkins（1994） | 1 |
| `source-p-2027` | Quinn、Chaudoir（2009） | 2 |
| `source-p-2029` | Quinn、Earnshaw（2013） | 3 |
| `source-p-2031` | Quinn、Camacho、Pan-Weisz、Williams（2020） | 2 |
| `source-p-2033` | Register（1987） | 4 |
| `source-p-2035` | Register（1999） | 1 |
| `source-p-2037` | Rier（2010） | 8 |
| `source-p-2039` | Riley（2012） | 1 |
| `source-p-2041` | Roland、Morris（1983） | 1 |
| `source-p-2043` | Rubin、Babbie（2013） | 3 |
| `source-p-2045` | Ruccia、Zoccali、Cooper、Rosten、Nduka（2021） | 1 |
| `source-p-2047` | Sarafino（1997；1990/1997） | 1 |
| `source-p-2049` | Schulman‐Green、Jaser、Martin、Alonzo、Grey、McCorkle、Redeker、Reynolds、Whittemore（2012） | 1 |
| `source-p-2050` | Seidman（2006） | 1 |
| `source-p-2053` | Seifert、Mrowietz（2009） | 1 |
| `source-p-2055` | Seligman（1972） | 1 |
| `source-p-2057` | Shelton、Philbin、Ramanadhan（2022） | 1 |
| `source-p-2059` | Shokrollahi（2015） | 1 |
| `source-p-2061` | Shrout、Weigel（2021） | 2 |
| `source-p-2063` | Sontag（1990） | 1 |
| `source-p-2064` | Strauss、Corbin、Fagerhaugh、Glaser、Maines、Suczek、Wiener（1975） | 5 |
| `source-p-2067` | Strauss、Fagerhaugh、Suczek、Wiener（1985） | 13 |
| `source-p-2069` | Sullivan、Smith、Kermode、McIver、Courtemanche（1990） | 1 |
| `source-p-2071` | Taylor（2005） | 1 |
| `source-p-2073` | Thomas、Mitchell、Rich、Best（2018） | 1 |
| `source-p-2075` | Thornton、Garcia、Hoyer、Wilkerson（2021） | 3 |
| `source-p-2077` | Toombs（1992） | 4 |
| `source-p-2079` | Udlis（2011） | 2 |
| `source-p-2080` | Von Korff、Dworkin、Le Resche（1990） | 0 |
| `source-p-2082` | Woolf（2012） | 1 |
| `source-p-2084` | Wu、Hu、Hu（2022） | 1 |
| `source-p-2087` | 官振翔（2024） | 1 |
| `source-p-2089` | 臺北榮民總醫院重建整形外科（2023） | 0 |
| `source-p-2091` | 衛生福利部（2022） | 0 |
| `source-p-2093` | 衛生福利部食品藥物管理署（2019） | 0 |
| `source-p-2095` | 衛生福利部國民健康署（2012） | 0 |
| `source-p-2097` | Centers for Disease Control and Prevention（2024） | 0 |
| `source-p-2099` | National Institutes of Health（1978） | 1 |

## 原文與安全檢查

- 轉製器仍逐段比對：1,835個來源區塊、128,341個非空白字元，0文字差異。獨立非空段落計數仍為1,834（含4則註腳）。
- 舊heading/source IDs與123個原始外部連結保留；新增引用目標均有完整書目。
- 私人PDF不輸出，原網址404，PDF建置防護仍保留。
- Hugo 0.160.1 extended建置成功，Pagefind仍索引229頁。
- 51項 Playwright 測試全數通過，含新增的桌機／手機、明暗模式、鍵盤關閉、焦點返回、附件定位及無JavaScript目錄測試。手機與桌機明暗畫面證據置 `.tmp/thesis-reader-qa/`；本機伺服器對Brotli回應有快取，重建後須重啟再驗收。
- 手機 single 文章目錄入口已接續完成，狀態與手機尺寸驗收記於 [文章閱讀排版計畫](article-reading-plan-2026-10-11.md)。


## 本輪結束狀態：2026-10-19

- 分支：`codex/article-heading-structure`；手機 single 目錄已提交為 `c5c41d5f`。以下論文收尾變更目前保留於工作樹，尚未提交、推送或發布。
- 論文 `draft: true`；正式建置不輸出 `/keloid/research/` 及其資源，蟹足腫入口不連向草稿。本機 1313 以 `--buildDrafts --renderToMemory` 預覽，執行檔 `.tmp/hugo-ci/hugo.exe`，快取 `.tmp/hugo-cache`。
- 保留論文正文；網站版移除 8 張研究者／受訪者疤痕照片與來源圖片檔，保留圖說及典藏下載提示；附件四僅保留略去說明與原錨點，邀請函／表單／電話不再提供。附件五海報保留並註明招募已結束（使用者已確認不再收件）。附件一標示 2022 年歷史文件、略去舊 email；量表補充授權提醒；附件七標示空白範本。前述「0 文字差異」為刪節前的轉製驗證，不能用來描述目前有明確刪節與編者註的網站版。
- 致謝與中文摘要預設收合，目錄／片段連結自動展開定位；正文六章保持展開。參考文獻三組與七個附件位置沿用原結構。
- 178 段有明確訪談編碼的獨立引文加細側線，手機縮排 12px、桌機 18px，字級不縮小。移除 210 處段首空白；書目以 CSS 連續排列及懸掛縮排，保留段落 IDs。該輪排版前後的非空白可見文字比對相同。
- 蟹足腫入口與該 section 的 single 頁共用醫療提醒；留言依使用者決定保留。
- 最後驗收：Hugo 0.160.1 正式建置成功（338 頁），草稿建置成功（346 頁）；381 個文內片段連結無缺漏，保留的 10 張圖片來源有效。Edge 手機／桌機 × 明暗與無 JavaScript 共 5 項閱讀器測試通過（18.7 秒）。另驗證致謝／摘要目錄定位與 8 張照片、私人 PDF 網址皆 404。390／1440px 明暗排版檢查無橫向溢出。
- 本機未安裝 Playwright 專用 Chromium；最後測試使用 Edge，臨時設定為 `.tmp/final-playwright.config.mjs`，不需額外下載瀏覽器。
- 下次：先看工作樹及本節，若使用者要提交則提交來源變更；未經要求維持 draft，不發布。量表授權提醒不代表已取得權利人的授權，研究同意範圍也未由網站技術驗收確認。


### 最後預覽更新

使用者要求取消 draft 以查看可發布版本；`content/keloid/research/index.md` 已改為 `draft: false`。本節取代上方維持 draft 的交接指示。尚未推送或發布，正式建置現在會包含論文頁。


### 最終提交與 PR 驗收

- 依使用者最後決定：`draft: false`；開頭標籤為「註解」；論文章節與附件、致謝、中文摘要、文獻分組、附件、註腳均可手動收合且預設關閉。註腳為獨立區塊、15px，文內引用可自動展開定位；正文維持 18px。
- 重新同步首頁字型子集，避免新增論文標題造成首頁提前下載完整字型。
- 最終正式建置成功（342 頁），Pagefind 索引 229 頁；論文輸出沒有 PDF／DOCX 和已移除的 8 張照片。註腳開合／定位／15px 實際瀏覽器檢查通過。
- 正式靜態站完整 Edge 回歸：116 項直接通過；1 項手機工具列舊測試仍預期四個按鈕，更新為含「目錄」的五個按鈕後重跑通過（合計 117 項驗收通過）。專用 Chromium 未安裝，使用既有 Edge；不需下載環境。
- 依使用者要求提交、推送與開 PR。以 `origin/main` 建立 `codex/keloid-thesis-reader`，將最終成果壓成乾淨提交，避免早期已刪照片出現在推送歷史；本節取代前述未提交／維持 draft 的交接狀態。未自動合併 PR。
- 本機 1313 已恢復 Hugo 記憶體預覽（不含其他 draft），`.tmp/hugo-ci/hugo.exe`、快取 `.tmp/hugo-cache`。驗收用靜態輸出與臨時設定皆位於忽略的 `.tmp/`，不提交產物。


### PR 搜尋驗收修正

PR #70 的正式搜尋召回檢查發現不存在的英數字串會誤列出論文書目姓名縮寫。三個書目分組加上 `data-pagefind-ignore`，排除書目搜尋噪音，正文、標題、摘要與附件仍依原規則索引；書目內容及文內引用浮窗保留。重新建置 Pagefind 後全部 27 項搜尋召回檢查通過。
