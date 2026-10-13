// Exact titles and numbered series use stable Pagefind keys. Other queries keep
// Pagefind's normal full-text behaviour. Ambiguous aliases never pick one page.
export function normalizeSearchAlias(value) {
  return value.normalize('NFKC').toLocaleLowerCase('zh-TW')
    .replace(/(工作日誌|工作手冊|實習紀錄|素描)\s*0*(\d+)/gu, (_, name, number) => name + Number(number))
    .replace(/[|\p{P}\p{Z}\s]/gu, '');
}

export function createExactTitleResolver(catalog) {
  const aliases = new Map();
  for (const entry of catalog) {
    for (const alias of entry.aliases) {
      const normalized = normalizeSearchAlias(alias);
      if (!normalized) continue;
      const matches = aliases.get(normalized) || new Set();
      matches.add(entry.key);
      aliases.set(normalized, matches);
    }
  }
  return query => {
    const matches = aliases.get(normalizeSearchAlias(query));
    return matches?.size === 1 ? [...matches][0] : query;
  };
}

export function cleanSearchExcerpt(excerpt) {
  return excerpt.replace(/riverarticle[0-9a-f]{32}/gi, '')
    .replace(/<mark(?:\s[^>]*)?>\s*<\/mark>/gi, '').trim();
}
