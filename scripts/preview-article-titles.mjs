import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin=process.argv[2] || 'http://127.0.0.1:1333';
const output=process.argv[3] || '.tmp/reading-phase2-after/reading-preview';await mkdir(output,{recursive:true});
const articles=[['long','/blog/成為自己/正念的意義就在手中/'],['short','/blog/成為自己/最大的自由是承擔/'],['images','/blog/電影心得/媽的多重宇宙01/']];
const browser=await chromium.launch(process.platform==='win32'?{channel:'msedge'}:{}),metrics=[];
try{
for(const [kind,path] of articles)for(const width of [390,1440])for(const theme of ['light','dark'])for(const variant of ['sans','merriweather','georgia']){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage();
 await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
 await page.addInitScript(theme=>localStorage.setItem('pref-theme',theme),theme);
 await page.goto(origin+path);
 if(variant==='sans')await page.addStyleTag({content:'body.publication-site .post-single .post-title{font-family:var(--river-font)}'});
 if(variant!=='sans')await page.addStyleTag({content:`@font-face{font-family:Merriweather;src:url('/fonts/merriweather-latin.woff2') format('woff2');font-weight:500;font-style:normal;font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}body.publication-site .post-single .post-title{font-family:${variant==='merriweather'?'Merriweather':'Georgia'},"Noto Serif TC","Songti TC","PMingLiU",serif;}`});
 await page.evaluate(()=>document.fonts.ready);
 await page.locator('.post-header').screenshot({path:`${output}/${variant}-${kind}-${width}-${theme}.png`});
 const cdp=await context.newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const {root}=await cdp.send('DOM.getDocument');const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector:'.post-title'});
 metrics.push({kind,width,theme,variant,fonts:(await cdp.send('CSS.getPlatformFontsForNode',{nodeId})).fonts});
 await context.close();
}
await writeFile(output+'/font-metrics.json',JSON.stringify(metrics,null,2));
}finally{await browser.close();}
await writeFile(output+'/index.html',`<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>文章標題字體對照</title>
<style>body{margin:0;padding:28px;background:#f1ece4;color:#40352f;font:16px/1.7 system-ui,sans-serif}main{max-width:1500px;margin:auto}h1{font-size:26px;margin:0}p{margin:8px 0 20px}label{display:inline-block;margin:0 20px 18px 0}select{font:inherit;padding:7px;border:1px solid #b6a997;border-radius:6px;background:#fffaf2;color:inherit}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.card{background:#fffaf2;border:1px solid #d8cabb;border-radius:12px;padding:20px}.card h2{margin:0 0 6px;font-size:20px}.card p{font-size:14px;color:#776254;min-height:4.5em}img{display:block;max-width:100%;height:auto;margin:20px auto}body.dark{background:#25211e;color:#f0dfce}body.dark .card{background:#342c28;border-color:#67554b}body.dark .card p{color:#ccbaa9}@media(max-width:800px){.grid{grid-template-columns:1fr}body{padding:16px}}a{color:#a34830}</style>
<main><h1>文章標題：黑體、宋體＋Merriweather、宋體＋Georgia</h1><p>三個版本都已使用新內文排版：手機 18px、行距 2 倍、桌機文字欄寬 640px。Header 原有宋體字標保持原樣。</p>
<label>文章 <select id="kind"><option value="short">短文・長標題</option><option value="long">長文・正念</option><option value="images" selected>圖文・電影心得</option></select></label>
<label>裝置 <select id="width"><option value="390">手機 390px</option><option value="1440">桌機 1440px</option></select></label>
<label>模式 <select id="theme"><option value="light">淺色</option><option value="dark">深色</option></select></label>
<div class="grid"><section class="card"><h2>A・保留黑體文章標題</h2><p>Noto Sans TC。標題與內文一致，較簡潔。</p><img id="sans" alt="黑體文章標題預覽"></section><section class="card"><h2>B・宋體＋Merriweather</h2><p>中文 Noto Serif TC 後援序列；英文採報導者標題使用的 Merriweather，本站自託管英文子集約 45.2 KiB。</p><img id="merriweather" alt="宋體搭配 Merriweather 預覽"></section><section class="card"><h2>C・宋體＋Georgia</h2><p>中文使用相同宋體序列；英文使用裝置上的 Georgia，不增加字型下載。字形依裝置安裝情況而異。</p><img id="georgia" alt="宋體搭配 Georgia 預覽"></section></div>
<p><a href="/blog/成為自己/最大的自由是承擔/">開啟新內文排版的完整文章</a> · 此頁為本機比較預覽，尚未發布。</p></main>
<script>const fields=['kind','width','theme'];function update(){const [kind,width,theme]=fields.map(id=>document.getElementById(id).value);document.body.classList.toggle('dark',theme==='dark');for(const variant of ['sans','merriweather','georgia'])document.getElementById(variant).src=variant+'-'+kind+'-'+width+'-'+theme+'.png'}fields.forEach(id=>document.getElementById(id).addEventListener('change',update));update();</script></html>`);
console.log('Preview: http://127.0.0.1:1333/reading-preview/');


