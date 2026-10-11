import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname, relative, isAbsolute } from 'node:path';
import { brotliCompressSync, constants } from 'node:zlib';
const root=resolve(process.argv[2]||'.tmp/perf-gallery-baseline');
const output=resolve(process.argv[3]||'.tmp/perf-gallery-baseline-results');
await mkdir(output,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.jpg':'image/jpeg','.JPG':'image/jpeg','.png':'image/png'};
const compressed=new Map();
const server=createServer(async(req,res)=>{try{
 let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname.endsWith('/'))pathname+='index.html';
 const file=resolve(root,'.'+pathname);const rel=relative(root,file);if(rel.startsWith('..')||isAbsolute(rel)){res.writeHead(403).end();return;}
 const ext=extname(file);let data=await readFile(file);res.setHeader('Content-Type',mime[ext]||'application/octet-stream');
 if(/\.(html|css|js|json|svg)$/.test(file)&&req.headers['accept-encoding']?.includes('br')){
  if(!compressed.has(file))compressed.set(file,brotliCompressSync(data,{params:{[constants.BROTLI_PARAM_QUALITY]:5}}));
  data=compressed.get(file);res.setHeader('Content-Encoding','br');res.setHeader('Vary','Accept-Encoding');
 }
 res.setHeader('Content-Length',data.length);res.end(data);
}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge'});
const results=[];
try{
for(const device of ['mobile','desktop'])for(let run=1;run<=3;run++){
 const mobile=device==='mobile';
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
 const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.clearBrowserCache');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:mobile?150:40,downloadThroughput:(mobile?1600000:10000000)/8,uploadThroughput:(mobile?750000:5000000)/8,connectionType:mobile?'cellular4g':'wifi'});
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:mobile?4:1});
 await page.addInitScript(()=>{
  Math.random=()=>0;localStorage.setItem('pref-theme','light');
  window.__lab={lcp:[],shifts:[],longTasks:[],events:[]};
  const observe=(type,fn,options={})=>{try{new PerformanceObserver(list=>list.getEntries().forEach(fn)).observe({type,buffered:true,...options});}catch{}};
  observe('largest-contentful-paint',e=>window.__lab.lcp.push({time:e.startTime,size:e.size,url:e.url,tag:e.element?.tagName,className:e.element?.getAttribute('class'),text:e.element?.textContent?.trim().slice(0,80)}));
  observe('layout-shift',e=>{if(!e.hadRecentInput)window.__lab.shifts.push({time:e.startTime,value:e.value,sources:e.sources.map(s=>s.node?.className||s.node?.nodeName)});});
  observe('longtask',e=>window.__lab.longTasks.push({time:e.startTime,duration:e.duration}));
  observe('event',e=>{if(e.interactionId)window.__lab.events.push({name:e.name,duration:e.duration});},{durationThreshold:16});
  document.addEventListener('DOMContentLoaded',()=>document.querySelector('.river-lead')?.dispatchEvent(new MouseEvent('mouseenter')));
 });
 await page.goto(origin+'/',{waitUntil:'load',timeout:120000});
 await page.waitForTimeout(2000);
 const result=await page.evaluate(()=>{
  const nav=performance.getEntriesByType('navigation')[0];let session=0,start=0,last=0,cls=0;
  for(const s of window.__lab.shifts){if(s.time-last>1000||s.time-start>5000){session=0;start=s.time;}session+=s.value;last=s.time;cls=Math.max(cls,session);}
  return {lcp:window.__lab.lcp.at(-1),lcpCandidates:window.__lab.lcp,cls,shifts:window.__lab.shifts,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,ttfb:nav.responseStart,domContentLoaded:nav.domContentLoadedEventEnd,load:nav.loadEventEnd,resources:performance.getEntriesByType('resource').map(e=>({path:new URL(e.name).pathname,initiator:e.initiatorType,transfer:e.transferSize,encoded:e.encodedBodySize,decoded:e.decodedBodySize,start:e.startTime,end:e.responseEnd})),longTasks:window.__lab.longTasks,featured:document.querySelector('.river-feature-slide:not([hidden]) h3')?.textContent.trim()};
 });
 await page.screenshot({path:resolve(output,`${device}-${run}.png`)});
 await page.locator('#theme-toggle').click();await page.waitForTimeout(500);result.interactionEvents=await page.evaluate(()=>window.__lab.events);result.themeToggleChanged=await page.locator('html').getAttribute('data-theme');
 results.push({device,run,...result,errors});
 console.log(JSON.stringify({device,run,fcp:Math.round(result.fcp),lcp:Math.round(result.lcp?.time||0),lcpElement:result.lcp?.tag,cls:result.cls,bytes:result.resources.reduce((n,r)=>n+r.transfer,0),featured:result.featured}));
 await context.close();
}
await writeFile(resolve(output,'results.json'),JSON.stringify({conditions:{browser:browser.version(),root,compression:'Brotli quality 5 for text assets; cached server compression',browserCache:'disabled; new context each run',mobile:'390x844, DPR2, 1.6Mbps down, 150ms latency, CPU4x',desktop:'1440x900, DPR1, 10Mbps down, 40ms latency, CPU1x',thirdParty:'blocked for controlled first-party baseline',featured:'Math.random=0; carousel paused on DOMContentLoaded',capture:'load + 2 seconds before theme interaction'},results},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
