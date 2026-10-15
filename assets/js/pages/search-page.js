// Search page: filters the site's JSON index (title, summary, tags, categories, author).
// Shareable URLs: ?q=word and optional &type=tag|category|author.
const config = JSON.parse(document.getElementById('search-page-config')?.textContent || '{}');
const t = config.i18n || {};

const input = document.getElementById('search-input');
const results = document.getElementById('search-results');

const escapeHtml = (s) => {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(s || ''));
  return d.innerHTML;
};
const escapeAttr = (s) => (s || '').replace(/"/g, '&quot;');

// Hyphens as spaces: "coding-agent" (slug) matches "coding agent" (text).
const normalize = (s) => (s || '').toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();

const typeLabel = { tag: t.tag, category: t.category, author: t.author };

if (input && results) {
  const emptyState = results.innerHTML; // mascot to restore when the query is empty
  let index = [];
  let debounce;

  const updateURL = (q, type) => {
    const url = new URL(window.location);
    q ? url.searchParams.set('q', q) : url.searchParams.delete('q');
    type ? url.searchParams.set('type', type) : url.searchParams.delete('type');
    window.history.replaceState({}, '', url);
  };

  const matches = (item, query, type) => {
    const q = normalize(query);
    if (type === 'tag') return (item.tags || []).some((x) => normalize(x).includes(q));
    if (type === 'category') return (item.categories || []).some((x) => normalize(x).includes(q));
    if (type === 'author') return normalize(item.author).includes(q);
    const hay = normalize([item.title, item.summary, (item.tags || []).join(' '), (item.categories || []).join(' '), item.author].join(' '));
    return q.split(' ').every((w) => hay.includes(w));
  };

  const imageURL = (image) => {
    if (!image) return '';
    if (config.cdn) return '/cdn-post-small/' + image;
    return image.startsWith('/') ? image : '/' + image;
  };

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString(config.locale, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return d;
    }
  };

  const card = (r) => {
    const src = imageURL(r.image);
    const img = src
      ? `<div class="result-image"><img src="${src}" alt="${escapeAttr(r.title)}" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`
      : '';
    const cats = (r.categories || []).slice(0, 2).map((c) => `<span class="result-category">${escapeHtml(c)}</span>`).join('');
    const tags = (r.tags || []).slice(0, 3).map((x) => `<span class="result-tag">${escapeHtml(x)}</span>`).join('');
    const sum = (r.summary || '').length > 140 ? r.summary.substring(0, 140) + '…' : (r.summary || '');
    return `<article class="result-card"><a href="${r.permalink}" class="result-card-link">${img}` +
      '<div class="result-content">' +
      `<h2 class="result-title">${escapeHtml(r.title)}</h2>` +
      `<div class="result-meta">${r.date ? `<span class="result-date">${formatDate(r.date)}</span>` : ''}${cats}</div>` +
      (sum ? `<p class="result-summary">${escapeHtml(sum)}</p>` : '') +
      (tags ? `<div class="result-tags">${tags}</div>` : '') +
      '</div></a></article>';
  };

  const render = (found, query, type) => {
    const label = typeLabel[type];
    const shown = label ? `${label}: <strong>${escapeHtml(query)}</strong>` : `"<strong>${escapeHtml(query)}</strong>"`;
    if (!found.length) {
      results.innerHTML = `<p class="search-no-results">${t.noResultsFor} ${shown}</p>`;
      return;
    }
    const n = found.length;
    results.innerHTML =
      `<p class="search-count">${n} ${n === 1 ? t.resultOne : t.resultOther} ${t.for} ${shown}</p>` +
      `<div class="results-grid">${found.map(card).join('')}</div>`;
  };

  const search = (query, type) => render(index.filter((item) => matches(item, query, type)), query, type);

  fetch(config.indexURL)
    .then((r) => {
      if (!r.ok) throw new Error('Network response was not ok: ' + r.status);
      return r.json();
    })
    .then((data) => {
      index = data;
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        input.value = q;
        search(q, params.get('type'));
      }
    })
    .catch((error) => {
      console.error('Fetch error:', error);
      results.innerHTML = `<p class="search-error">${t.loadError} (${config.indexURL}). ${t.details}: ${escapeHtml(error.message)}</p>`;
    });

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const q = input.value.trim();
    debounce = setTimeout(() => {
      updateURL(q, null); // typing manually clears the type filter
      if (q.length >= 2) search(q, null);
      else if (!q) results.innerHTML = emptyState;
    }, 300);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const q = input.value.trim();
    if (q) {
      updateURL(q, null);
      search(q, null);
    }
  });
}
