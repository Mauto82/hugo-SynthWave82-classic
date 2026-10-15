// Archivio: mostra 12 mesi per pagina con una paginazione lato client.
const MONTHS_PER_PAGE = 12;

const archive = document.getElementById('archive-content');
const container = document.getElementById('archive-pagination');

if (archive && container) {
  const months = [...archive.querySelectorAll('.archive-year .month')];
  const years = [...archive.querySelectorAll('.archive-year')];
  const totalPages = Math.ceil(months.length / MONTHS_PER_PAGE);
  let currentPage = 1;

  const pageItem = (label, { page = null, active = false, disabled = false, extraClass = '' } = {}) => {
    const clickable = page !== null && !active && !disabled;
    const el = document.createElement(clickable ? 'a' : 'span');
    el.className = ['page-item', extraClass, active && 'active', disabled && 'disabled'].filter(Boolean).join(' ');
    if (clickable) {
      el.href = '#';
      el.addEventListener('click', (e) => { e.preventDefault(); showPage(page); });
    }
    if (extraClass === 'mobile-nav') {
      const span = document.createElement('span');
      span.textContent = label;
      el.appendChild(span);
    } else {
      el.textContent = label;
    }
    return el;
  };

  const renderPagination = () => {
    container.replaceChildren();
    if (totalPages <= 1) {
      container.style.display = 'none';
      return;
    }
    container.style.display = 'flex';

    const nav = document.createElement('nav');
    nav.className = 'pagination';
    nav.setAttribute('aria-label', 'Pagination');

    nav.appendChild(pageItem('<', { page: currentPage - 1, disabled: currentPage === 1, extraClass: 'mobile-nav' }));

    // 1 … (corrente-1) corrente (corrente+1) … ultima
    const pages = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
    pages.forEach((p, i) => {
      if (i > 0 && p - pages[i - 1] > 1) nav.appendChild(pageItem('...', { extraClass: 'dots' }));
      nav.appendChild(pageItem(String(p), { page: p, active: p === currentPage }));
    });

    nav.appendChild(pageItem('>', { page: currentPage + 1, disabled: currentPage === totalPages, extraClass: 'mobile-nav' }));
    container.appendChild(nav);
  };

  const showPage = (page) => {
    if (page < 1 || page > totalPages) return;
    currentPage = page;

    const visible = new Set(months.slice((page - 1) * MONTHS_PER_PAGE, page * MONTHS_PER_PAGE));
    months.forEach((m) => { m.style.display = visible.has(m) ? '' : 'none'; });
    years.forEach((y) => {
      const hasVisible = [...y.querySelectorAll('.month')].some((m) => visible.has(m));
      y.style.display = hasVisible ? '' : 'none';
    });

    renderPagination();
    window.scrollTo(0, 0);
  };

  if (months.length > 0) showPage(1);
}
