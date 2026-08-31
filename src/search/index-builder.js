/**
 * Zero-dependency build-time TF-IDF search index generator.
 * (Replaces Lunr / FlexSearch).
 */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'if', 'then', 'else', 'when',
  'at', 'by', 'from', 'for', 'in', 'off', 'on', 'to', 'with', 'it', 'this',
  'that', 'these', 'those', 'of', 'be', 'are', 'was', 'were', 'as', 'has', 'have'
]);

export function buildSearchIndex(pages) {
  const pageDocs = [];
  const docFrequencies = {};

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const rawText = `${page.title} ${page.description || ''} ${stripHtml(page.contentHtml)}`;
    const tokens = tokenizeText(rawText);

    const termFreqs = {};
    const uniqueTerms = new Set();

    for (const term of tokens) {
      termFreqs[term] = (termFreqs[term] || 0) + 1;
      uniqueTerms.add(term);
    }

    for (const term of uniqueTerms) {
      docFrequencies[term] = (docFrequencies[term] || 0) + 1;
    }

    pageDocs.push({
      id: i,
      title: page.title,
      url: page.url,
      snippet: (page.description || stripHtml(page.contentHtml)).slice(0, 150) + '...',
      termFreqs,
      totalTerms: tokens.length
    });
  }

  const N = pages.length || 1;
  const index = {};

  for (const doc of pageDocs) {
    for (const [term, freq] of Object.entries(doc.termFreqs)) {
      const tf = freq / doc.totalTerms;
      const df = docFrequencies[term] || 1;
      const idf = Math.log(N / df) + 1;
      const tfidf = Number((tf * idf).toFixed(4));

      if (!index[term]) index[term] = [];
      index[term].push({ id: doc.id, score: tfidf });
    }
  }

  return {
    pages: pageDocs.map(({ id, title, url, snippet }) => ({ id, title, url, snippet })),
    index
  };
}

function tokenizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ');
}
