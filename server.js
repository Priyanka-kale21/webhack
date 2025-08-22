const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { crawlSite } = require('./services/crawler');
const { analyzeSeo } = require('./services/analyzers/seo');
const { analyzeSecurityHeaders } = require('./services/analyzers/security');
const { analyzePerformance } = require('./services/analyzers/performance');
const { analyzeAccessibilityBasic } = require('./services/analyzers/accessibility');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Serve frontend
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.post('/api/audit', async (req, res) => {
  const { url, maxPages } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required' });
  }
  const crawlLimit = Math.max(1, Math.min(Number(maxPages) || 5, 20));

  try {
    const crawlResult = await crawlSite(url, { maxPages: crawlLimit });

    const perPageReports = crawlResult.pages.map((page) => {
      const seo = analyzeSeo(page.finalUrl, page.html, page.headers);
      const security = analyzeSecurityHeaders(page.finalUrl, page.headers);
      const performance = analyzePerformance(page.finalUrl, page.html, page.headers, page.timing, page.sizeBytes);
      const accessibility = analyzeAccessibilityBasic(page.finalUrl, page.html);
      return { url: page.finalUrl, seo, security, performance, accessibility };
    });

    // Aggregate summary across pages
    const summary = {
      pagesScanned: perPageReports.length,
      totalBytes: crawlResult.pages.reduce((sum, p) => sum + (p.sizeBytes || 0), 0),
      averageResponseMs: Math.round(
        crawlResult.pages.reduce((sum, p) => sum + (p.timing?.responseMs || 0), 0) /
          Math.max(1, crawlResult.pages.length)
      ),
    };

    res.json({
      input: { url, maxPages: crawlLimit },
      startedAt: crawlResult.startedAt,
      finishedAt: crawlResult.finishedAt,
      summary,
      reports: perPageReports,
      errors: crawlResult.errors,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Audit failed', error);
    res.status(500).json({ error: 'Audit failed', details: error?.message || String(error) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});
