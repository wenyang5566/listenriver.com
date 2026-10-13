import {stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {serveSite} from './site-review-server.mjs';
const root=resolve(process.argv[2]||'public');
const port=Number(process.argv[3]||1313);
for(const path of ['index.html','pagefind/pagefind.js']) {
  if(!(await stat(resolve(root,path))).isFile()) throw new Error('Missing built test asset: '+path);
}
const site=await serveSite(root,port);
console.log('Built Hugo + Pagefind test site: '+site.origin);
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>site.close().then(()=>process.exit(0)));
