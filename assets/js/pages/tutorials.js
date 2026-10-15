// Pagina Guide: serie di post raggruppate per `tutorial`, con "Mostra altri" e ricerca locale.
const config = JSON.parse(document.getElementById('tutorials-config')?.textContent || '{}');
const visible = config.visiblePosts || 3;
const t = config.i18n || {};

const input = document.getElementById('tutorial-search');
const panel = input?.closest('.search-wrapper')?.querySelector('.search-suggestions');
const lists = {
  tutorial: panel?.querySelector('.tutorial-suggestions'),
  post: panel?.querySelector('.post-suggestions'),
  tag: panel?.querySelector('.tag-suggestions'),
};
const groups = [...document.querySelectorAll('.tutorial .post')];

const escapeHtml = (s) => {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(s || ''));
  return d.innerHTML;
};
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const highlight = (text, term) =>
  escapeHtml(text).replace(new RegExp(`(${escapeRegExp(escapeHtml(term))})`, 'gi'), '<span class="highlight">$1</span>');

// Dati di ogni post letti dall'HTML
const posts = groups.flatMap((group) => {
  const tutorial = group.querySelector('h2').dataset.tutorial;
  return [...group.querySelectorAll('li > a')].map((link) => ({
    item: link.parentElement,
    title: link.dataset.title,
    href: link.href,
    tags: link.dataset.tags ? link.dataset.tags.split(', ') : [],
    tutorial,
  }));
});
const allTags = [...new Set(posts.flatMap((p) => p.tags))];
const allTutorials = [...new Set(posts.map((p) => p.tutorial))];

// "Mostra altri N": tiene visibili solo i primi `visible` elementi di ogni serie
const applyCollapse = (group, items) => {
  const button = group.querySelector('.show-more');
  const hiddenCount = items.length - visible;
  items.forEach((item, i) => item.classList.toggle('hidden', i >= visible));
  button.style.display = hiddenCount > 0 ? 'block' : 'none';
  button.textContent = `${t.showMore} ${Math.max(0, hiddenCount)}`;
  button.dataset.expanded = 'false';
};

groups.forEach((group) => {
  const button = group.querySelector('.show-more');
  applyCollapse(group, [...group.querySelectorAll('li')]);
  button.addEventListener('click', () => {
    const expanded = button.dataset.expanded === 'true';
    const items = [...group.querySelectorAll('li')].filter((li) => li.style.display !== 'none');
    items.forEach((item, i) => item.classList.toggle('hidden', expanded && i >= visible));
    button.dataset.expanded = String(!expanded);
    button.textContent = expanded ? `${t.showMore} ${items.length - visible}` : t.showLess;
  });
});

const filter = (term, type = 'all') => {
  const q = term.toLowerCase();
  posts.forEach((p) => {
    let match;
    if (type === 'tag') match = p.tags.some((tag) => tag.toLowerCase() === q);
    else if (type === 'tutorial') match = p.tutorial.toLowerCase().includes(q);
    else match = [p.title, p.tags.join(' '), p.tutorial].join(' ').toLowerCase().includes(q);
    p.item.style.display = match ? '' : 'none';
  });
  groups.forEach((group) => {
    const items = [...group.querySelectorAll('li')].filter((li) => li.style.display !== 'none');
    group.style.display = items.length ? '' : 'none';
    if (items.length) applyCollapse(group, items);
  });
};

const suggest = (term) => {
  if (!panel) return;
  if (term.length < 2) {
    panel.style.display = 'none';
    return;
  }
  const q = term.toLowerCase();
  const found = {
    tutorial: allTutorials.filter((x) => x.toLowerCase().includes(q)).slice(0, 5).map((x) => ({ value: x })),
    post: posts.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 5).map((p) => ({ value: p.title, link: p.href })),
    tag: allTags.filter((x) => x.toLowerCase().includes(q)).slice(0, 5).map((x) => ({ value: x })),
  };
  Object.entries(found).forEach(([type, entries]) => {
    const list = lists[type];
    if (!list) return;
    list.parentElement.style.display = entries.length ? 'block' : 'none';
    list.innerHTML = entries
      .map((e) => `<li data-type="${type}" data-value="${escapeHtml(e.value)}"${e.link ? ` data-link="${e.link}"` : ''}>${highlight(e.value, term)}</li>`)
      .join('');
  });
  panel.style.display = Object.values(found).some((e) => e.length) ? 'block' : 'none';
};

if (input) {
  input.addEventListener('input', () => {
    const term = input.value;
    suggest(term);
    filter(term.length >= 2 ? term : '');
  });

  panel?.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-type]');
    if (!li) return;
    if (li.dataset.type === 'post' && li.dataset.link) {
      window.location.href = li.dataset.link;
      return;
    }
    input.value = li.dataset.value;
    filter(li.dataset.value, li.dataset.type);
    panel.style.display = 'none';
  });

  document.addEventListener('click', (e) => {
    if (panel && !e.target.closest('.search-wrapper')) panel.style.display = 'none';
  });
}
