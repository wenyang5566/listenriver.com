# 全站文章標題層級檢查（2026-10-19）

## 範圍與結果

依作者要求逐篇檢視全站文章的標題大綱與主從關係，只調整 Markdown 井字數量。以 Hugo `list all` 辨識文章，公開文章共227篇（blog 196、clubhouse 30、論文1）；另記錄4篇草稿，草稿不修改。關於本站等2個一般頁面不列入文章數。

公開文章中155篇使用 Markdown 小標，72篇沒有 Markdown 小標（含透過 shortcode 呈現的論文）。累計調整56篇、291個標題，已含上一輪15篇／77個，並非額外再改56篇。171篇保留。

分支 `codex/article-heading-structure`，基準為 `e082fc31`。本批已提交為 `fcf17c89`；未 push、未發布。

## 編輯判斷

- 頁首文章名由模板提供h1；主要段落使用h2，子題h3，再深的內容依序h4／h5。
- 電影心得、會所工作日誌、開放式對話及聆聽疼痛計畫的獨立段落、後記與相關文章入口，升至主要段落層級。
- 三手欄紀錄按日誌→欄位→欄內段落分層；實習總報告依壹／一／1的編號關係分層，保留原報告名及期間資訊。
- 工作坊保留日期、活動名稱等既有資訊標記；正文以場次→主題→練習／案例建立連續層級。這些資訊標記並不等於文章章節；只改井字無法把它們正確轉成資訊列，因此本批保留。
- 閱讀心得的主要論點不再附屬於開頭的「書摘」連結；明確隸屬編號主題的子題改為h3。
- 書摘保留頁碼、摘錄與主題分組的編輯方式，只修正明顯的第一／第二章層級與兩處誤為h2的單一頁碼；不推測原書完整目錄或重排摘錄。
- 詩題、歌曲引文、素描課次標示與單一書摘標籤保留。沒有小標的短文與連續敘事不強行切段。原論文HTML章節保持不變。
- 原文文字、front matter、圖片與連結均不改；移除少量標題行原有的行末空白，以通過diff check。

## 驗證

- 56篇來源與HEAD比對：除了井字與標題行末空白外逐位元一致（忽略Windows換行差異）。
- Hugo 0.160.1 extended建置成功；Pagefind仍索引229頁。
- 56篇實際HTML與改前比較：正文文字、所有標題文字與id、canonical均保留，頁內連結全數有目標。
- 舊網址守門：639個基準，0新增回歸；3個既有解析問題不變。
- 本機預覽 `.tmp/all-heading-preview-20261019/`；來源／HTML對照 `.tmp/heading-structure-verification.json`；逐篇決策原始資料 `.tmp/full-heading-decisions.json`。

## 逐篇紀錄

下表的「小標數」僅計來源Markdown ATX小標，不包含模板h1、shortcode或論文HTML。變更數相對於本分支HEAD。

| 文章來源 | 小標數 | 結果 |
| --- | ---: | --- |
| `content/blog/助人工作/一位好的父親是如何養成的/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/助人工作/創傷知情工作坊心得/index.md` | 6 | 調整1個標題 |
| `content/blog/助人工作/創傷知情工作坊筆記/index.md` | 50 | 調整44個標題 |
| `content/blog/助人工作/北監酒駕班後記/index.md` | 6 | 保留既有層級 |
| `content/blog/助人工作/北監酒駕班觀察心得/index.md` | 9 | 保留既有層級 |
| `content/blog/助人工作/受苦的倒影/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/助人工作/同步聽打培訓/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/助人工作/女性主義人生百味/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/助人工作/對話工作如潛水/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/助人工作/換位思考與非暴力溝通/index.md` | 3 | 保留既有層級 |
| `content/blog/助人工作/握有權力時的焦慮/index.md` | 1 | 保留既有層級 |
| `content/blog/助人工作/社會工作是陰性的存在/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/助人工作/缺席者的發聲練習/index.md` | 2 | 保留既有層級 |
| `content/blog/助人工作/親密關係暴力的矛盾與複雜困境/index.md` | 10 | 保留既有層級 |
| `content/blog/助人工作/進階團體工作/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/助人工作/過道、渡者、苦難工作者/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/助人工作/非正式的知識建構/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/成為自己/不為而成/index.md` | 10 | 保留既有層級 |
| `content/blog/成為自己/人是有機的存在/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/成為自己/任性的人/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/成為自己/保持透明/index.md` | 4 | 保留既有層級 |
| `content/blog/成為自己/傾聽自己是善待自己的方法/index.md` | 5 | 保留既有層級 |
| `content/blog/成為自己/凝視與穿越/index.md` | 11 | 保留既有層級 |
| `content/blog/成為自己/反省個體化/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/成為自己/嘔吐/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/成為自己/夕陽下的長影子/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/成為自己/情緒、鏡子視角、觀自在/index.md` | 4 | 保留既有層級 |
| `content/blog/成為自己/慢讀漫談/index.md` | 5 | 保留既有層級 |
| `content/blog/成為自己/成為自己的過程/index.md` | 5 | 保留既有層級 |
| `content/blog/成為自己/承接情緒的軟墊/index.md` | 5 | 保留既有層級 |
| `content/blog/成為自己/最大的自由是承擔/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/成為自己/正念的意義就在手中/index.md` | 6 | 保留既有層級 |
| `content/blog/成為自己/為什麼活著如此累人/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/成為自己/無條件的愛讓小孩茁壯/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/成為自己/痛苦的快樂/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/成為自己/看見本質的眼睛/index.md` | 4 | 保留既有層級 |
| `content/blog/成為自己/真實做自己的自由/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/成為自己/穿越是一座無止盡的橋/index.md` | 1 | 保留既有層級 |
| `content/blog/成為自己/自己其實是幸福的/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/成為自己/踏實感/index.md` | 1 | 保留既有層級 |
| `content/blog/成為自己/選擇與自由/index.md` | 4 | 保留既有層級 |
| `content/blog/成為自己/鄰坐又對坐的關係/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/成為自己/難過到感受不到自己的存在/index.md` | 1 | 保留既有層級 |
| `content/blog/成為自己/魚、深淵、寓居於世/index.md` | 1 | 保留既有層級 |
| `content/blog/日常書寫/clubhouse的密室/index.md` | 1 | 保留既有層級 |
| `content/blog/日常書寫/clubhouse的療癒空間/index.md` | 5 | 保留既有層級 |
| `content/blog/日常書寫/一種抵達經驗的方式/index.md` | 2 | 保留既有層級 |
| `content/blog/日常書寫/人間出口：性和慾望的詮釋/index.md` | 5 | 保留既有層級 |
| `content/blog/日常書寫/來自異次元的騷擾：腦控受害者/index.md` | 8 | 保留既有層級 |
| `content/blog/日常書寫/如何理解時間的存在/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/日常書寫/如何看待暴力/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/日常書寫/掘光而行/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/日常書寫/整理書櫃有感/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/日常書寫/網頁架設學習歷程/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/日常書寫/美好的事物終將灰飛煙滅/index.md` | 3 | 調整3個標題 |
| `content/blog/日常書寫/蜷縮、停滯、暗之惡魔/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/日常書寫/關於語言的反思/index.md` | 12 | 調整2個標題 |
| `content/blog/書摘/人行道/index.md` | 2 | 保留既有層級 |
| `content/blog/書摘/修身與齊家/index.md` | 50 | 保留既有層級 |
| `content/blog/書摘/凝視太陽/index.md` | 24 | 保留既有層級 |
| `content/blog/書摘/到達彼岸的智慧/index.md` | 37 | 保留既有層級 |
| `content/blog/書摘/割腕的誘惑/index.md` | 59 | 保留既有層級 |
| `content/blog/書摘/危殆生活/index.md` | 84 | 保留既有層級 |
| `content/blog/書摘/如何謀殺一座城市/index.md` | 2 | 保留既有層級 |
| `content/blog/書摘/學習家族治療/index.md` | 2 | 保留既有層級 |
| `content/blog/書摘/家庭會傷人/index.md` | 47 | 保留既有層級 |
| `content/blog/書摘/尋找復原力/index.md` | 131 | 保留既有層級 |
| `content/blog/書摘/成為一個人/index.md` | 153 | 調整1個標題 |
| `content/blog/書摘/找回家庭的療癒力/index.md` | 45 | 保留既有層級 |
| `content/blog/書摘/擁抱陰影/index.md` | 65 | 保留既有層級 |
| `content/blog/書摘/敘事治療工作地圖/index.md` | 35 | 保留既有層級 |
| `content/blog/書摘/旁觀他人之痛苦/index.md` | 14 | 保留既有層級 |
| `content/blog/書摘/正念生活的藝術/index.md` | 15 | 保留既有層級 |
| `content/blog/書摘/流浪者之歌/index.md` | 3 | 保留既有層級 |
| `content/blog/書摘/為何建制民族誌如此強大/index.md` | 148 | 保留既有層級 |
| `content/blog/書摘/無痛思維/index.md` | 26 | 保留既有層級 |
| `content/blog/書摘/現象學十四講/index.md` | 53 | 保留既有層級 |
| `content/blog/書摘/疾病的隱喻/index.md` | 4 | 保留既有層級 |
| `content/blog/書摘/病從所願/index.md` | 19 | 保留既有層級 |
| `content/blog/書摘/聆聽疼痛/index.md` | 244 | 調整3個標題 |
| `content/blog/書摘/英雄之旅/index.md` | 58 | 調整1個標題 |
| `content/blog/書摘/見佛殺佛/index.md` | 54 | 保留既有層級 |
| `content/blog/書摘/開放對話期待對話/index.md` | 22 | 調整2個標題 |
| `content/blog/書摘/關係的評估與修復/index.md` | 43 | 保留既有層級 |
| `content/blog/書摘/障礙政治/index.md` | 89 | 保留既有層級 |
| `content/blog/疼痛書寫/疼痛、憂鬱、失聲/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/疼痛書寫/疼痛意識流/index.md` | 1 | 保留既有層級 |
| `content/blog/疼痛書寫/疼痛日記/index.md` | 4 | 調整4個標題 |
| `content/blog/疼痛書寫/疼痛是比較級的/index.md` | 1 | 保留既有層級 |
| `content/blog/疼痛書寫/疼痛是鬼/index.md` | 1 | 保留既有層級 |
| `content/blog/疼痛書寫/髒血/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/病痛經驗/01論疾病/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/病痛經驗/住院記：擁抱陰影/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/病痛經驗/定期回診/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/病痛經驗/標本：凝視與被凝視/index.md` | 1 | 調整1個標題 |
| `content/blog/病痛經驗/疼痛的意義是襯托生命/index.md` | 2 | 保留既有層級 |
| `content/blog/病痛經驗/第三次住院：在張力之中呼吸/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/病痛經驗/課堂報告小結/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/病痛經驗/鏡子、隱喻、建立存在感/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/病痛經驗/關於自我揭露/index.md` | 1 | 保留既有層級 |
| `content/blog/素描/01盲畫/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/素描/02負形/index.md` | 1 | 保留既有層級 |
| `content/blog/素描/03繼續負形/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/素描/04立體感是一種深度的錯覺/index.md` | 1 | 保留既有層級 |
| `content/blog/素描/05亮暗面、光影、色階/index.md` | 2 | 保留既有層級 |
| `content/blog/素描/06繼續光影、色階/index.md` | 1 | 保留既有層級 |
| `content/blog/素描/07形準、比例感、切圓術/index.md` | 1 | 保留既有層級 |
| `content/blog/素描/08透視、塞尚、矩形/index.md` | 1 | 保留既有層級 |
| `content/blog/素描/09捏陶的素描/index.md` | 1 | 保留既有層級 |
| `content/blog/素描/10編織的素描/index.md` | 1 | 保留既有層級 |
| `content/blog/素描/11補捉場景/index.md` | 1 | 保留既有層級 |
| `content/blog/素描/12人臉/index.md` | 1 | 保留既有層級 |
| `content/blog/素描/13實在感/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/聆聽疼痛計畫/00撿拾疼痛的碎片/index.md` | 2 | 調整1個標題 |
| `content/blog/聆聽疼痛計畫/01近況分享/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/聆聽疼痛計畫/02成果發表/index.md` | 1 | 調整1個標題 |
| `content/blog/聆聽疼痛計畫/03僵直性脊椎炎/index.md` | 2 | 調整2個標題 |
| `content/blog/聆聽疼痛計畫/04未知疼痛/index.md` | 2 | 調整2個標題 |
| `content/blog/聆聽疼痛計畫/05生理期疼痛/index.md` | 1 | 調整1個標題 |
| `content/blog/聆聽疼痛計畫/06貝西氏症/index.md` | 2 | 調整2個標題 |
| `content/blog/聆聽疼痛計畫/07腰部肌肉纖維化/index.md` | 1 | 調整1個標題 |
| `content/blog/聆聽疼痛計畫/08胃痛/index.md` | 2 | 調整2個標題 |
| `content/blog/聆聽疼痛計畫/09腕隧道症候群/index.md` | 1 | 調整1個標題 |
| `content/blog/聆聽疼痛計畫/10心臟瓣膜疼痛/index.md` | 2 | 調整2個標題 |
| `content/blog/聆聽疼痛計畫/11自傷疼痛/index.md` | 1 | 調整1個標題 |
| `content/blog/詩的語言/不是一個善於擁抱/我不是一個善於擁抱的人20231007.md` | 0 | 草稿保留 |
| `content/blog/詩的語言/保持距離/20230924.md` | 0 | 草稿保留 |
| `content/blog/詩的語言/隨時保持靠海的距離很重要20210930/隨時保持靠海的距離很重要20210930.md` | 0 | 草稿保留 |
| `content/blog/講座筆記/建制民族誌逐字稿整理/index.md` | 3 | 保留既有層級 |
| `content/blog/講座筆記/待人一條相互映照之路/index.md` | 21 | 保留既有層級 |
| `content/blog/講座筆記/用音樂做運動/index.md` | 18 | 保留既有層級 |
| `content/blog/講座筆記/般若心經短講/index.md` | 1 | 保留既有層級 |
| `content/blog/開放式對話/人們用行動在對話/index.md` | 1 | 調整1個標題 |
| `content/blog/開放式對話/內在透明化/index.md` | 4 | 調整4個標題 |
| `content/blog/開放式對話/對話本身就是行動/index.md` | 2 | 調整2個標題 |
| `content/blog/開放式對話/肯認每一種聲音的存在/index.md` | 14 | 調整1個標題 |
| `content/blog/開放式對話/課後筆記01/index.md` | 29 | 調整1個標題 |
| `content/blog/開放式對話/課後筆記02/index.md` | 18 | 調整1個標題 |
| `content/blog/開放式對話/進階工作坊01/index.md` | 56 | 調整22個標題 |
| `content/blog/開放式對話/進階工作坊02/index.md` | 43 | 調整37個標題 |
| `content/blog/閱讀心得/修身與齊家/index.md` | 2 | 保留既有層級 |
| `content/blog/閱讀心得/凝視太陽/index.md` | 14 | 保留既有層級 |
| `content/blog/閱讀心得/到達彼岸的智慧/index.md` | 2 | 保留既有層級 |
| `content/blog/閱讀心得/割腕的誘惑/index.md` | 8 | 保留既有層級 |
| `content/blog/閱讀心得/危殆生活/index.md` | 9 | 保留既有層級 |
| `content/blog/閱讀心得/圖騰與禁忌/index.md` | 9 | 保留既有層級 |
| `content/blog/閱讀心得/失控的正向思考/index.md` | 12 | 保留既有層級 |
| `content/blog/閱讀心得/家庭會傷人/index.md` | 14 | 保留既有層級 |
| `content/blog/閱讀心得/尋找復原力/index.md` | 7 | 保留既有層級 |
| `content/blog/閱讀心得/成為一個人/index.md` | 15 | 調整4個標題 |
| `content/blog/閱讀心得/打從心底/index.md` | 1 | 保留既有層級 |
| `content/blog/閱讀心得/找回家庭的療癒力/index.md` | 15 | 調整2個標題 |
| `content/blog/閱讀心得/擁抱陰影/index.md` | 2 | 保留既有層級 |
| `content/blog/閱讀心得/正念生活的藝術/index.md` | 2 | 保留既有層級 |
| `content/blog/閱讀心得/水母與搖滾/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/閱讀心得/沒用的東西/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/閱讀心得/為何建制民族誌如此強大/index.md` | 8 | 保留既有層級 |
| `content/blog/閱讀心得/無痛思維/index.md` | 7 | 調整5個標題 |
| `content/blog/閱讀心得/現象學十四講/index.md` | 2 | 保留既有層級 |
| `content/blog/閱讀心得/病從所願/index.md` | 6 | 調整4個標題 |
| `content/blog/閱讀心得/聆聽疼痛/index.md` | 7 | 調整5個標題 |
| `content/blog/閱讀心得/英雄之旅/index.md` | 8 | 保留既有層級 |
| `content/blog/閱讀心得/見佛殺佛/index.md` | 8 | 調整6個標題 |
| `content/blog/閱讀心得/討厭的人都跌倒吧/index.md` | 2 | 保留既有層級 |
| `content/blog/閱讀心得/跟一棵樹聊天/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/閱讀心得/追逐尖叫/index.md` | 11 | 保留既有層級 |
| `content/blog/閱讀心得/障礙政治/index.md` | 8 | 保留既有層級 |
| `content/blog/電影心得/AV帝王/index.md` | 3 | 保留既有層級 |
| `content/blog/電影心得/你我的解放相同/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/電影心得/創傷的智慧/index.md` | 16 | 保留既有層級 |
| `content/blog/電影心得/千年女優/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/電影心得/午夜福音E1/index.md` | 6 | 調整6個標題 |
| `content/blog/電影心得/午夜福音E3/index.md` | 4 | 調整4個標題 |
| `content/blog/電影心得/午夜福音E4/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/電影心得/午夜福音E5/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/電影心得/午夜福音E6/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/電影心得/嘻哈是化痛苦為力量反擊的語言/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/電影心得/夏日大作戰/index.md` | 4 | 調整4個標題 |
| `content/blog/電影心得/妄想代理人/index.md` | 5 | 保留既有層級 |
| `content/blog/電影心得/媽的多重宇宙01/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/電影心得/媽的多重宇宙02/index.md` | 6 | 調整6個標題 |
| `content/blog/電影心得/性愛自修室/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/電影心得/橫山家之味/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/電影心得/母子情劫/index.md` | 3 | 保留既有層級 |
| `content/blog/電影心得/比海還深/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/電影心得/河畔小日子/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/電影心得/流麻溝十五號/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/電影心得/無人知曉的夏日清晨/index.md` | 1 | 保留既有層級 |
| `content/blog/電影心得/無人能怪罪才是最痛苦的/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/電影心得/無恥之徒/index.md` | 1 | 保留既有層級 |
| `content/blog/電影心得/瑪莉娜的512小時/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/電影心得/神隱少女/index.md` | 0 | 無Markdown小標，保留 |
| `content/blog/電影心得/紐約大國民珍雅各/index.md` | 1 | 保留既有層級 |
| `content/blog/電影心得/綠洲/index.md` | 7 | 調整7個標題 |
| `content/blog/電影心得/艾格妮撿風景01/index.md` | 7 | 保留既有層級 |
| `content/blog/電影心得/艾格妮撿風景02/index.md` | 1 | 保留既有層級 |
| `content/blog/電影心得/范保德/index.md` | 7 | 保留既有層級 |
| `content/blog/電影心得/鄰家兄弟/index.md` | 1 | 保留既有層級 |
| `content/blog/電影心得/阿鼻/index.md` | 0 | 無Markdown小標，保留 |
| `content/clubhouse/實習紀錄/01初入會所的觀察/index.md` | 4 | 調整4個標題 |
| `content/clubhouse/實習紀錄/02幻聽與疼痛是不可見的受苦/index.md` | 4 | 保留既有層級 |
| `content/clubhouse/實習紀錄/03期中實習結束/index.md` | 0 | 無Markdown小標，保留 |
| `content/clubhouse/實習紀錄/04承認無知、真誠表達與夥伴關係/index.md` | 6 | 調整4個標題 |
| `content/clubhouse/實習紀錄/05與會員H訂計畫/index.md` | 6 | 調整3個標題 |
| `content/clubhouse/實習紀錄/06如實/index.md` | 0 | 無Markdown小標，保留 |
| `content/clubhouse/實習紀錄/07實習總報告/index.md` | 28 | 調整24個標題 |
| `content/clubhouse/工作手冊/01慾望、驅力、動力/index.md` | 1 | 調整1個標題 |
| `content/clubhouse/工作手冊/02為自己做決定即是成為自己/index.md` | 9 | 調整9個標題 |
| `content/clubhouse/工作手冊/03負面教材/index.md` | 18 | 草稿保留 |
| `content/clubhouse/工作手冊/04以靜制動/index.md` | 6 | 調整6個標題 |
| `content/clubhouse/工作手冊/05忍不住、氣不過、沉住氣/index.md` | 5 | 調整5個標題 |
| `content/clubhouse/工作日誌/01工作一個月/index.md` | 7 | 調整7個標題 |
| `content/clubhouse/工作日誌/02緊握垃圾的力道/index.md` | 0 | 無Markdown小標，保留 |
| `content/clubhouse/工作日誌/03回顧會員F來會所的學習/index.md` | 0 | 無Markdown小標，保留 |
| `content/clubhouse/工作日誌/04就業前準備/index.md` | 0 | 無Markdown小標，保留 |
| `content/clubhouse/工作日誌/05兩週就業訓練反思/index.md` | 4 | 調整4個標題 |
| `content/clubhouse/工作日誌/06複雜用藥下改變如何發生/index.md` | 0 | 無Markdown小標，保留 |
| `content/clubhouse/工作日誌/07白板溝通/index.md` | 0 | 無Markdown小標，保留 |
| `content/clubhouse/工作日誌/08推動會員帶開會與導覽部門/index.md` | 0 | 無Markdown小標，保留 |
| `content/clubhouse/工作日誌/09不敢說借過的會員/index.md` | 3 | 調整3個標題 |
| `content/clubhouse/工作日誌/10料理是行動、是對話/index.md` | 0 | 無Markdown小標，保留 |
| `content/clubhouse/工作日誌/11敘事的見證/index.md` | 0 | 無Markdown小標，保留 |
| `content/clubhouse/工作日誌/12餐飲部當然不只是料理/index.md` | 0 | 無Markdown小標，保留 |
| `content/clubhouse/工作日誌/13初次社區宣導/index.md` | 0 | 無Markdown小標，保留 |
| `content/clubhouse/工作日誌/14強迫症的意義/index.md` | 6 | 調整6個標題 |
| `content/clubhouse/工作日誌/15認真回應會員動力/index.md` | 4 | 調整4個標題 |
| `content/clubhouse/工作日誌/16你想要什麼樣的支持/index.md` | 6 | 調整6個標題 |
| `content/clubhouse/工作日誌/17將言語視為符號/index.md` | 2 | 調整2個標題 |
| `content/clubhouse/工作日誌/18保持真誠好奇/index.md` | 3 | 調整3個標題 |
| `content/clubhouse/工作日誌/19身心狀態留下的痕跡/index.md` | 0 | 無Markdown小標，保留 |
| `content/keloid/research/index.md` | 0 | 無Markdown小標，保留 |

## 最終驗收補記

- 56篇 × 390／1440px × 明／暗共224組檢查通過：每篇一個h1，h2字級26／28px、字重600，沒有整頁橫向溢出。
- 既有文章版面與搜尋／會所系列15項測試全部通過（1.3分鐘）。
- 代表截圖檢視通過；未再放大全站CSS字級。

- 全站227篇實際HTML再次比對：正文文字與所有內容id均與改前一致。
