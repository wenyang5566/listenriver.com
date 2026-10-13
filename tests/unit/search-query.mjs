import test from 'node:test';
import assert from 'node:assert/strict';
import { createExactTitleResolver, cleanSearchExcerpt } from '../../assets/js/search-query.js';

test('numbered series accepts padded, unpadded and full-width numbers', () => {
  const resolve = createExactTitleResolver([{ key: 'post-five', aliases: ['工作手冊 05'] }]);
  for (const query of ['工作手冊05', '工作手冊 5', '工作手冊　５']) assert.equal(resolve(query), 'post-five');
});
test('ambiguous aliases retain normal full-text search', () => {
  const resolve = createExactTitleResolver([
    { key: 'notes', aliases: ['聆聽疼痛', '書摘｜《聆聽疼痛》'] },
    { key: 'reflection', aliases: ['聆聽疼痛', '閱讀心得｜《聆聽疼痛》'] },
  ]);
  assert.equal(resolve('聆聽疼痛'), '聆聽疼痛');
  assert.equal(resolve('書摘 《聆聽疼痛》'), 'notes');
  assert.equal(resolve('疼痛與關係'), '疼痛與關係');
  assert.equal(resolve(''), '');
});
test('an alias repeated on one article is still unique', () => {
  const resolve = createExactTitleResolver([{ key: 'one', aliases: ['肯認每一種聲音的存在', '肯認每一種聲音的存在'] }]);
  assert.equal(resolve('肯認每一種聲音的存在'), 'one');
});
test('internal index tokens do not appear in the reader excerpt', () => {
  const key = 'riverarticle' + 'a'.repeat(32);
  assert.equal(cleanSearchExcerpt(`<mark>${key}</mark> 理解與陪伴`), '理解與陪伴');
  assert.equal(cleanSearchExcerpt('一段 <mark>疼痛</mark> 書寫'), '一段 <mark>疼痛</mark> 書寫');
});
