// Suggerimenti di ricerca per i campi .global-search-input (barra in alto, home, archivio, pagina di ricerca).
// L'indice JSON si carica solo al primo focus. Un suggerimento porta al post o alla pagina di ricerca filtrata.
document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('.global-search-input');
  if (inputs.length === 0) return;

  // URL della ricerca e dell'indice nella lingua corrente, dagli attributi data-* di <html> (baseof.html)
  const searchBase = document.documentElement.dataset.searchUrl || '/search/';
  const indexPath = document.documentElement.dataset.searchIndex || '/index.json';
  const isSearchPage = window.location.pathname.startsWith(searchBase);

  // Valori distinti per tipo di suggerimento (post: titolo -> link)
  const data = { post: new Map(), tag: new Set(), category: new Set(), author: new Set() };
  let indexRequested = false;

  const loadIndex = () => {
    if (indexRequested) return;
    indexRequested = true;
    fetch(indexPath)
      .then((r) => r.json())
      .then((items) => {
        items.forEach((item) => {
          data.post.set(item.title, item.permalink);
          (item.tags || []).forEach((x) => x && data.tag.add(x));
          (item.categories || []).forEach((x) => x && data.category.add(x));
          if (item.author) data.author.add(item.author);
        });
      })
      .catch((error) => {
        indexRequested = false;
        console.error('Errore nel caricamento dell\'indice di ricerca:', error);
      });
  };

  const escapeHtml = (s) => {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(s || ''));
    return d.innerHTML;
  };
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const highlight = (text, term) =>
    escapeHtml(text).replace(new RegExp(`(${escapeRegExp(escapeHtml(term))})`, 'gi'), '<span class="highlight">$1</span>');

  // Vai al post oppure alla pagina di ricerca filtrata per tipo
  const open = (li) => {
    const { type, value, link } = li.dataset;
    window.location.href = type === 'post' ? link : `${searchBase}?q=${encodeURIComponent(value)}&type=${type}`;
  };

  inputs.forEach((input) => {
    const wrapper = input.closest('.search-wrapper');
    const panel = wrapper?.querySelector('.search-suggestions');
    if (!panel) return;

    const lists = {
      post: wrapper.querySelector('.post-suggestions'),
      tag: wrapper.querySelector('.tag-suggestions'),
      category: wrapper.querySelector('.category-suggestions'),
      author: wrapper.querySelector('.author-suggestions'),
    };
    const items = () => [...panel.querySelectorAll('li')];
    const isOpen = () => panel.style.display !== 'none';

    const suggest = (term) => {
      if (term.length < 2) {
        panel.style.display = 'none';
        return;
      }
      const q = term.toLowerCase();
      let any = false;
      Object.entries(lists).forEach(([type, list]) => {
        if (!list) return;
        const values = type === 'post' ? [...data.post.keys()] : [...data[type]];
        const found = values.filter((v) => v.toLowerCase().includes(q)).slice(0, 5);
        list.parentElement.style.display = found.length ? 'block' : 'none';
        list.innerHTML = found
          .map((v) => {
            const link = type === 'post' ? ` data-link="${escapeHtml(data.post.get(v))}"` : '';
            return `<li data-type="${type}" data-value="${escapeHtml(v)}"${link}>${highlight(v, term)}</li>`;
          })
          .join('');
        any = any || found.length > 0;
      });
      panel.style.display = any ? 'block' : 'none';
    };

    // Evidenzia il suggerimento precedente/successivo (con giro)
    const move = (step) => {
      const list = items();
      if (!list.length) return;
      const current = panel.querySelector('li.highlight');
      const i = list.indexOf(current);
      const next = i === -1 ? (step > 0 ? list[0] : list[list.length - 1]) : list[(i + step + list.length) % list.length];
      current?.classList.remove('highlight');
      next.classList.add('highlight');
    };

    input.addEventListener('focus', loadIndex, { once: true });
    input.addEventListener('input', () => suggest(input.value));

    panel.addEventListener('click', (e) => {
      const li = e.target.closest('li[data-type]');
      if (li) open(li);
    });

    input.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'Tab':
          if (!isOpen() || !items().length) return; // a pannello chiuso Tab sposta il focus come sempre
          e.preventDefault();
          move(e.shiftKey ? -1 : 1);
          break;
        case 'ArrowUp':
          if (!isOpen() || !items().length) return;
          e.preventDefault();
          move(-1);
          break;
        case 'Enter': {
          const current = isOpen() && panel.querySelector('li.highlight');
          if (current) {
            open(current);
            break;
          }
          panel.style.display = 'none';
          // sulla pagina di ricerca l'Invio lo gestisce search-page.js
          const q = input.value.trim();
          if (!isSearchPage && q) window.location.href = `${searchBase}?q=${encodeURIComponent(q)}`;
          break;
        }
        case 'Escape':
          panel.style.display = 'none';
          break;
      }
    });
  });

  // Chiude i pannelli cliccando fuori
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
      document.querySelectorAll('.search-suggestions').forEach((panel) => { panel.style.display = 'none'; });
    }
  });
});
