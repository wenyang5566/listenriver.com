import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

test('article counters, invalid inputs and concurrent increments use local D1', async () => {
  const source = await readFile(new URL('../src/index.ts', import.meta.url), 'utf8');
  const script = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script, compatibilityDate: '2026-04-05',
    d1Databases: { DB: 'test-only-article-stats' }, bindings: { SITE_ORIGIN: 'https://listenriver.com' } }));
  try {
    const handler = (await import('data:text/javascript;base64,'+Buffer.from(script).toString('base64'))).default;
    const unavailable = await handler.fetch(new Request('http://worker.test/stats?post=/blog/error/'), {DB:{prepare(){throw new Error('private database detail');}}});
    assert.equal(unavailable.status,500);
    assert.deepEqual(await unavailable.json(),{error:'Unable to update article statistics.'});
    const db = await mf.getD1Database('DB');
    await db.exec((await readFile(new URL('../migrations/0001_init.sql', import.meta.url), 'utf8')).replace(/\n/g, ' '));
    const send = (endpoint, post) => mf.dispatchFetch('http://worker.test/' + endpoint, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({post})});
    const firstView = await send('view', '/blog/new-view/');
    assert.equal(firstView.status, 200);
    assert.deepEqual(await firstView.json(), {slug:'/blog/new-view/',views:1,likes:0});
    const firstLike = await send('like', '/blog/new-like/');
    assert.deepEqual(await firstLike.json(), {slug:'/blog/new-like/',views:0,likes:1});
    const stats = await mf.dispatchFetch('http://worker.test/stats?post=/blog/read-only/');
    assert.deepEqual(await stats.json(), {slug:'/blog/read-only/',views:0,likes:0});
    const count = () => db.prepare('SELECT COUNT(*) AS count FROM post_stats').first('count');
    const before = await count();
    for (const endpoint of ['view','like']) for (const value of [42,{},[],true,null,'',' ','//host/path','/a/../b','/a/%2e%2e/b','/a?b','/a#b','/%zz','/a\\b','x'.repeat(2049)]) {
      assert.equal((await send(endpoint,value)).status,400,endpoint + ':' + JSON.stringify(value));
    }
    for (const body of ['{','[]','null','"text"']) {
      assert.equal((await mf.dispatchFetch('http://worker.test/like',{method:'POST',body})).status,400);
    }
    assert.equal((await mf.dispatchFetch('http://worker.test/view',{method:'POST',body:JSON.stringify({post:'x'.repeat(9000)})})).status,413);
    assert.equal((await mf.dispatchFetch('http://worker.test/stats?post=42')).status,200);
    // A string path remains compatible; non-string GET values cannot occur.
    assert.equal(await count(),before+1);
    const increments = await Promise.all(Array.from({length:10},()=>send('like','/blog/new-like/')));
    assert.ok(increments.every(response=>response.status===200));
    const after = await mf.dispatchFetch('http://worker.test/stats?post=/blog/new-like/');
    assert.deepEqual(await after.json(),{slug:'/blog/new-like/',views:0,likes:11});
    const encoded='/clubhouse/%E5%B7%A5%E4%BD%9C%E6%97%A5%E8%AA%8C/01/';
    assert.equal((await (await send('view',encoded)).json()).slug,encoded);
    console.log('Verified first increments, read-only stats, 35 invalid requests, 10 concurrent increments and encoded interaction keys.');
  } finally { await mf.dispose(); }
});
