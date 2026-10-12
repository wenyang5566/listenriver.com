import {readFile,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const source=await readFile('static/images/brand/listenriver-logo.svg','utf8');
const dir='static/images/brand';
const small=source.replace('stroke-width="3.5"', 'stroke-width="4.4"').replace('stroke-width="2.8"', 'stroke-width="3.4"');
const adaptive=source.replace('<g stroke-width=', '<style>@media (max-width: 20px) { g { stroke-width: 4.4; } path[stroke-width] { stroke-width: 3.4; } } @media (prefers-color-scheme: dark) { path[stroke="#b97760"] { stroke: #dfa78e; } path[stroke="#4e898a"] { stroke: #8bb2b5; } }</style><g stroke-width=');
await writeFile(`${dir}/favicon.svg`,adaptive);
const browser=await chromium.launch({channel:'msedge'});
try{for(const size of [16,32,48,180]){const page=await browser.newPage({viewport:{width:size,height:size},deviceScaleFactor:1});
const apple=size===180;
await page.setContent(`<style>html,body{margin:0;width:100%;height:100%;display:grid;place-items:center;background:${apple?'#fff9f0':'transparent'}}svg{width:${apple?'72%':'100%'};height:${apple?'72%':'100%'}}</style>${size===16?small:source}`);
await page.screenshot({path:`${dir}/${apple?'apple-touch-icon':`favicon-${size}`}.png`,omitBackground:!apple});await page.close();}}finally{await browser.close();}
console.log('Generated favicon SVG, PNG sizes and Apple touch icon from approved Header logo.');
