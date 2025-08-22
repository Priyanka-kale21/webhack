const form = document.getElementById('audit-form');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');

function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') el.className = v;
    else el.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach((child) => {
    if (child == null) return;
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else el.appendChild(child);
  });
  return el;
}

// Calculate percentage score based on issues
function calcScore(issues) {
  if (!issues || issues.length === 0) return 100;
  let penalty = 0;
  issues.forEach((i) => {
    if (i.severity === "HIGH") penalty += 30;
    else if (i.severity === "MEDIUM") penalty += 20;
    else if (i.severity === "LOW") penalty += 10;
    else penalty += 5;
  });
  return Math.max(0, 100 - penalty);
}

// Score card UI
function renderScoreCard(title, issues) {
  const score = calcScore(issues);
  let scoreClass = "good";
  if (score < 40) scoreClass = "bad";
  else if (score < 70) scoreClass = "medium";

  return h("div", { class: "score-card" }, [
    h("h4", {}, title),
    h("div", { class:score ${scoreClass} }, ${score}%),
  ]);
}

function renderIssues(issues) {
  if (!issues || issues.length === 0) return h('div', { class: 'ok' }, '✅ No issues found');
  return h(
    'div',
    {},
    issues.map((i) =>
      h(
        'div',
        { class:` issue ${i.severity.toLowerCase()}` },
        ${i.severity.toUpperCase()}: ${i.message}
      )
    )
  );
}

function renderReport(report) {
  return h('div', { class: 'report-card' }, [
    h('h3', { class: 'page-title' }, [
      report.url,
      ' ',
      h('span', { class: 'tag' }, 'Page'),
    ]),

    h('div', { class: 'score-summary' }, [
      renderScoreCard("SEO", report.seo.issues),
      renderScoreCard("Security", report.security.issues),
      renderScoreCard("Performance", report.performance.issues),
      renderScoreCard("Accessibility", report.accessibility.issues),
    ]),

    h('div', { class: 'section-grid' }, [
      h('div', { class: 'section-card' }, [
        h('h4', {}, 'SEO'),
        renderIssues(report.seo.issues),
        h('div', { class: 'recommendations' }, [
          h('strong', {}, 'Recommendations: '),
          report.seo.recommendations.join(' | ')
        ])
      ]),

      h('div', { class: 'section-card' }, [
        h('h4', {}, 'Security Headers'),
        renderIssues(report.security.issues),
        h('div', { class: 'recommendations' }, [
          h('strong', {}, 'Recommendations: '),
          report.security.recommendations.join(' | ')
        ])
      ]),

      h('div', { class: 'section-card' }, [
        h('h4', {}, 'Performance'),
        renderIssues(report.performance.issues),
        h('div', { class: 'recommendations' }, [
          h('strong', {}, 'Recommendations: '),
          report.performance.recommendations.join(' | ')
        ])
      ]),

      h('div', { class: 'section-card' }, [
        h('h4', {}, 'Accessibility'),
        renderIssues(report.accessibility.issues),
        h('div', { class: 'recommendations' }, [
          h('strong', {}, 'Recommendations: '),
          report.accessibility.recommendations.join(' | ')
        ])
      ]),
    ])
  ]);
}

function renderResults(data) {
  resultsEl.innerHTML = '';

  const header = h('div', { class: 'summary-card' }, [
    h('h2', {}, 'Audit Summary'),
    h('div', { class: 'tags' }, [
      h('span', { class: 'tag' }, Pages: ${data.summary.pagesScanned}),
      h('span', { class: 'tag' },Avg TTFB: ${data.summary.averageResponseMs} ms),
      h('span', { class: 'tag' }, Bytes: ${Math.round((data.summary.totalBytes || 0) / 1024)} KB),
    ]),
    data.errors?.length
      ? h('div', { class: 'issue info' }, ${data.errors.length} fetch errors)
      : null,
  ]);

  resultsEl.appendChild(header);

  data.reports.forEach((r) => resultsEl.appendChild(renderReport(r)));
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  resultsEl.innerHTML = '';
  statusEl.textContent = 'Starting audit...';
  const url = document.getElementById('url').value.trim();
  const maxPages = Number(document.getElementById('maxPages').value) || 5;

  try {
    const res = await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, maxPages }),
    });
    if (!res.ok) throw new Error(Request failed: ${res.status});
    const data = await res.json();
    statusEl.textContent = '✅ Audit complete';
    renderResults(data);
  } catch (err) {
    console.error(err);
    statusEl.textContent = '❌ Audit failed: ' + (err?.message || String(err));
  }
});
