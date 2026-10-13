import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,relative,isAbsolute,extname} from 'node:path';
import {brotliCompressSync,constants} from 'node:zlib';
export async function serveSite(root,port=0){
 root=resolve(root);const cache=new Map();
 const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.json':'application/json','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
 const server=createServer(async(req,res)=>{try{
  let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(path.endsWith('/'))path+='index.html';
  const file=resolve(root,'.'+path),rel=relative(root,file);if(rel.startsWith('..')||isAbsolute(rel)){res.writeHead(403).end();return;}
  let body=await readFile(file);res.setHeader('Content-Type',mime[extname(file).toLowerCase()]||'application/octet-stream');
  if(/\.(html|css|js|svg|json)$/.test(file)&&req.headers['accept-encoding']?.includes('br')){if(!cache.has(file))cache.set(file,brotliCompressSync(body,{params:{[constants.BROTLI_PARAM_QUALITY]:5}}));body=cache.get(file);res.setHeader('Content-Encoding','br');res.setHeader('Vary','Accept-Encoding');}
  res.setHeader('Content-Length',body.length);res.end(body);
 }catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(port,'127.0.0.1',r));
 return {origin:'http://127.0.0.1:'+server.address().port,close:()=>new Promise(r=>server.close(r))};
}
