import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {serveSite} from './site-review-server.mjs';
const [beforeRoot,afterRoot,lighthouseModules,outputRoot='.tmp/phase-five/performance']=process.argv.slice(2);
if(!lighthouseModules)throw new Error('Usage: node scripts/check-reading-performance.mjs <before-site> <after-site> <node_modules containing lighthouse/chrome-launcher> <output>');
const {default:lighthouse}=await import(new URL('lighthouse/core/index.js',pathToFileURL(resolve(lighthouseModules)+'/')));
const launcher=await import(new URL('chrome-launcher/dist/chrome-launcher.js',pathToFileURL(resolve(lighthouseModules)+'/')));
const output=resolve(outputRoot);await mkdir(output,{recursive:true});
const sites={before:await serveSite(beforeRoot),after:await serveSite(afterRoot)};
const paths=[['home','/'],['long','/blog/成為自己/正念的意義就在手中/'],['short','/blog/成為自己/最大的自由是承擔/'],['illustrated','/blog/電影心得/媽的多重宇宙01/']];
const results=[];
try{
for(const [name,path] of paths)for(let run=1;run<=3;run++)for(const version of ['before','after']){
 const chrome=await launcher.launch({chromePath:process.env.CHROME_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',chromeFlags:['--headless=new','--no-first-run','--no-default-browser-check','--disable-background-networking']});
 try{
  const {lhr}=await lighthouse(sites[version].origin+encodeURI(path),{port:chrome.port,onlyCategories:['performance'],formFactor:'mobile',throttlingMethod:'simulate',blockedUrlPatterns:['https://*'],logLevel:'error'});
  const file=`${name}-${version}-${run}.json`;await writeFile(resolve(output,file),JSON.stringify(lhr));
  const metric=id=>lhr.audits[id]?.numericValue;
  const row={page:name,path,version,run,file,score:Math.round(lhr.categories.performance.score*100),fcp:metric('first-contentful-paint'),lcp:metric('largest-contentful-paint'),tbt:metric('total-blocking-time'),cls:metric('cumulative-layout-shift'),bytes:metric('total-byte-weight'),warnings:lhr.runWarnings,lcpBreakdown:lhr.audits['lcp-breakdown-insight']?.details,resources:lhr.audits['network-requests']?.details?.items.map(i=>({url:i.url,resourceType:i.resourceType,transferSize:i.transferSize,resourceSize:i.resourceSize,startTime:i.startTime,endTime:i.endTime}))};
  results.push(row);await writeFile(resolve(output,'results.json'),JSON.stringify({conditions:{lighthouse:lhr.lighthouseVersion,browser:lhr.environment.hostUserAgent,settings:lhr.configSettings,thirdParty:'blocked https requests; controlled first-party local lab, not production',textCompression:'Brotli quality 5',before:process.env.PERF_BEFORE_LABEL||beforeRoot,after:process.env.PERF_AFTER_LABEL||afterRoot,order:'each page: three interleaved before/after pairs, new browser per sample'},results},null,2));
  console.log(JSON.stringify({page:name,version,run,score:row.score,lcp:Math.round(row.lcp),tbt:row.tbt,cls:row.cls}));
 }finally{await chrome.kill();}
}
}finally{await Promise.all(Object.values(sites).map(s=>s.close()));}
