// Navbar: collapsible menu on mobile and a shadow when the page scrolls.
const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('navbar-menu');
const header = document.getElementById('site-header');

const svg = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
const iconMenu = svg('<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>');
const iconClose = svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>');

if (hamburger && menu) {
  hamburger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    hamburger.innerHTML = isOpen ? iconClose : iconMenu;
  });

  // Switching back to desktop closes the mobile menu
  window.matchMedia('(min-width: 921px)').addEventListener('change', (e) => {
    if (e.matches) {
      menu.classList.remove('open');
      hamburger.innerHTML = iconMenu;
    }
  });
}

if (header) {
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 0), { passive: true });
}
