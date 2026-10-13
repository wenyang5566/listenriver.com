import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {serveSite} from './site-review-server.mjs';
const [beforeRoot,afterRoot,outputRoot='.tmp/phase-five/review']=process.argv.slice(2);
if(!beforeRoot||!afterRoot)throw new Error('Usage: node scripts/compare-site-visuals.mjs <before-site> <after-site> <output>');
const output=resolve(outputRoot);await mkdir(output,{recursive:true});
const cases=[
 {id:'home',title:'首頁：保留主視覺，增加閱讀入口',path:'/',root:'.river-selection',note:'兔子、字標、精選照片保留；新版精選文章下方增加「病痛，如何被聽見？」四篇閱讀路徑，動態可持續暫停。'},
 {id:'author',title:'首頁作者：介紹分工',path:'/',root:'.river-author',note:'介紹改成目前的工作現場與關注；學歷與論文留在作者頁，避免首頁重複「社工」。'},
 {id:'category',title:'分類：先給讀者三個起點',path:'/categories/病痛經驗/',root:'.taxonomy-category-primary',note:'原本藏在展開介紹裡的手選文章，移到文章列表之前。桌機三欄、手機單欄；五類與 39 tags 不再增加。'},
 {id:'intro',title:'文章開頭：先理解這篇在談什麼',path:'/blog/成為自己/正念的意義就在手中/',root:'.post-header',note:'12 篇代表文增加短導讀，日期與作者保留。正文仍是 18px／36px、桌機 640px 與原有中文宋體＋Merriweather。'},
 {id:'ending',title:'文章結尾：有理由地接著讀',path:'/blog/成為自己/正念的意義就在手中/',root:'#related-posts',note:'代表文的泛用多張推薦改為一個明確續讀方向，附上為何接著讀。會所的原系列鄰居仍保留。'},
 {id:'footer',title:'內頁頁尾：一致的閱讀出口',path:'/blog/成為自己/正念的意義就在手中/',rootBefore:'footer.footer',root:'.publication-footer',note:'舊版技術頁尾改為書寫品牌、四個閱讀出口與社群入口。首頁與內頁共用。'},
 {id:'gallery',title:'圖集：圖說與小圓點',path:'/',root:'.home-gallery-section',note:'照片保留原圖，補上實際內容圖說與 alt。新版小圓點維持較大點擊範圍，暫停動態也會停止自動切換。'},
 {id:'path',title:'新增頁面：四篇閱讀路徑',path:'/reading-paths/',root:'.reading-path-page',added:true,note:'新增問題導向的閱讀頁，從自身病痛 → 閱讀 → 對話 → 工作現場。桌機有靜態河線，手機以文字與照片順序呈現。'}
];
const sites={before:await serveSite(beforeRoot),after:await serveSite(afterRoot)};
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge'});
const inventory=[];
try{
 for(const width of [390,1440])for(const theme of ['light','dark'])for(const item of cases)for(const version of ['before','after']){
  if(item.added&&version==='before')continue;
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});const page=await context.newPage();const origin=sites[version].origin;
  await page.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
  await page.addInitScript(t=>{Math.random=()=>0;localStorage.setItem('pref-theme',t);sessionStorage.setItem('river-motion-paused','true');},theme);
  await page.goto(origin+item.path);await page.evaluate(()=>document.fonts.ready);
  const element=page.locator(version==='before'&&item.rootBefore?item.rootBefore:item.root);
  await element.scrollIntoViewIfNeeded();await element.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode().catch(()=>{});})));
  await page.waitForTimeout(250);await element.scrollIntoViewIfNeeded();
  const file=`${item.id}-${width}-${theme}-${version}.png`;await element.screenshot({path:resolve(output,file)});
  inventory.push({id:item.id,width,theme,version,file,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  await context.close();
  if(version==='after')console.log(`${item.id} ${width}px ${theme} captured`);
 }
 const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
 const sections=cases.map(item=>`<section><div class="intro"><span>${item.added?'新增頁型':'前後對照'}</span><h2>${item.title}</h2><p>${item.note}</p><a href="http://127.0.0.1:1341${encodeURI(item.path)}" target="_blank" rel="noopener">開啟新版頁面 ↗</a></div><div class="pair">${item.added?'<div class="absent"><p>舊版沒有獨立閱讀路徑頁。</p></div>':`<figure><figcaption>優化前 · 13a21cac</figcaption><a data-full="${item.id}-before" target="_blank"><img data-shot="${item.id}-before" alt="${escape(item.title)}，優化前"></a></figure>`}<figure><figcaption>新版 · a30ae174</figcaption><a data-full="${item.id}-after" target="_blank"><img data-shot="${item.id}-after" alt="${escape(item.title)}，新版"></a></figure></div></section>`).join('');
 await writeFile(resolve(output,'index.html'),`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>聆聽的河流｜新舊視覺對照</title><style>*{box-sizing:border-box}body{margin:0;background:#faf6ef;color:#40352f;font:16px/1.8 system-ui,sans-serif}main{max-width:1380px;margin:auto;padding:40px 28px}h1{font-size:36px;line-height:1.4}h2{font-size:25px;line-height:1.5;margin:8px 0}p{max-width:760px}header p{color:#776254}.controls{position:sticky;top:0;padding:12px 0;background:#faf6ef;z-index:1;display:flex;gap:20px;flex-wrap:wrap}label{display:flex;gap:10px;align-items:center}select{padding:10px;font:inherit;color:inherit;background:white;border:1px solid #ccbcae;border-radius:4px}section{padding:32px 0 42px;border-top:1px solid #dbcbb9}.intro span{font-size:13px;color:#a24d36}.intro a{display:inline-block;min-height:44px;color:#a24d36;text-underline-offset:4px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:start;margin-top:18px}figure{margin:0;min-width:0}figcaption{font-size:14px;padding:9px 0;color:#776254}img{width:100%;height:auto;display:block;border:1px solid #dbcbb9}.absent{border:1px dashed #c9b8a6;padding:40px;color:#776254;margin-top:43px}.mobile img{width:auto;max-width:100%;margin:auto}.mobile figure a{display:block;background:#eee5d8;padding:12px}.note{font-size:13px;color:#776254}@media(max-width:700px){main{padding:24px 18px}h1{font-size:28px}.pair{grid-template-columns:1fr}.absent{margin-top:0}}</style></head><body><main><header><p>聆聽的河流 · 分階段優化</p><h1>保留原來的氣質，讓閱讀更有方向。</h1><p>這份對照取自同一個來源基準與同尺寸的本機實際頁面，不是設計示意圖。可切換手機／桌機、明／暗，點圖片看原尺寸。</p><p class="note">優化前：13a21cac；新版：a30ae174。第三方請求封鎖、減少動態、固定精選文章。網站與閱讀路徑尚未發布。</p></header><div class="controls"><label>畫面<select id="width"><option value="1440">桌機 1440px</option><option value="390">手機 390px</option></select></label><label>主題<select id="theme"><option value="light">淺色</option><option value="dark">深色</option></select></label></div>${sections}<p class="note">新舊照片裁切維持頁面本來的呈現。尺寸一致不表示區塊高度一致；新增內容造成的高度差正是本輪差異。</p></main><script>function update(){const w=document.querySelector('#width').value,t=document.querySelector('#theme').value;document.body.classList.toggle('mobile',w==='390');for(const image of document.querySelectorAll('[data-shot]')){const [id,version]=image.dataset.shot.split('-');image.src=id+'-'+w+'-'+t+'-'+version+'.png';image.parentElement.href=image.src;}}document.querySelector('#width').addEventListener('change',update);document.querySelector('#theme').addEventListener('change',update);update();</script></body></html>`);
 await writeFile(resolve(output,'inventory.json'),JSON.stringify({before:'13a21cac',after:'a30ae174',cases,inventory},null,2));
 console.log(`Saved ${inventory.length} unedited screenshots and visual comparison to ${output}`);
 if(inventory.some(item=>item.overflow))throw new Error('Screenshot scenario has horizontal overflow');
}finally{await browser.close();await Promise.all(Object.values(sites).map(s=>s.close()));}
