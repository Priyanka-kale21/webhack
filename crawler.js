const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

function normalizeUrl(baseUrl, href) {
  try {
    if (!href) return null;
    const url = new URL(href, baseUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    // Remove fragments
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

async function fetchPage(targetUrl) {
  const startedAt = Date.now();
  try {
    const response = await axios.get(targetUrl, {
      maxRedirects: 5,
      timeout: 15000,
      headers: {
        'User-Agent': 'ScanURLBot/1.0 (+https://example.com)'
      }
    });
    const finishedAt = Date.now();
    const responseMs = finishedAt - startedAt;
    const sizeBytes = Buffer.from(response.data || '').length;
    const headers = Object.fromEntries(Object.entries(response.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
    return {
      ok: true,
      finalUrl: response.request?.res?.responseUrl || targetUrl,
      status: response.status,
      headers,
      html: typeof response.data === 'string' ? response.data : '',
      timing: { responseMs },
      sizeBytes,
      error: null,
    };
  } catch (error) {
    const finishedAt = Date.now();
    const responseMs = finishedAt - startedAt;
    return {
      ok: false,
      finalUrl: targetUrl,
      status: error?.response?.status || null,
      headers: Object.fromEntries(Object.entries(error?.response?.headers || {}).map(([k, v]) => [k.toLowerCase(), v])),
      html: '',
      timing: { responseMs },
      sizeBytes: 0,
      error: error?.message || String(error),
    };
  }
}

async function crawlSite(startUrl, options = {}) {
  const { maxPages = 5 } = options;
  const startedAt = new Date().toISOString();
  const visited = new Set();
  const queue = [startUrl];
  const pages = [];
  const errors = [];

  while (queue.length && pages.length < maxPages) {
    const url = queue.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);

    const page = await fetchPage(url);
    if (!page.ok) {
      errors.push({ url, error: page.error, status: page.status });
      continue;
    }
    pages.push(page);

    // Extract links limited to same origin
    try {
      const base = new URL(startUrl);
      const $ = cheerio.load(page.html);
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        const absolute = normalizeUrl(page.finalUrl, href);
        if (!absolute) return;
        try {
          const u = new URL(absolute);
          if (u.origin === base.origin && !visited.has(absolute) && queue.length + pages.length < maxPages) {
            queue.push(absolute);
          }
        } catch {
          // ignore
        }
      });
    } catch (e) {
      errors.push({ url, error: e?.message || String(e) });
    }
  }

  const finishedAt = new Date().toISOString();
  return { startedAt, finishedAt, pages, errors };
}

module.exports = { crawlSite };
