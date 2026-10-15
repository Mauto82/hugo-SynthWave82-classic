// Barra di condivisione: "copia link" negli appunti con un tooltip di conferma.
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-copy-url]');
  if (!link || !navigator.clipboard) return;
  e.preventDefault();
  navigator.clipboard.writeText(link.dataset.copyUrl).then(() => {
    const tooltip = link.querySelector('.tooltip');
    if (!tooltip) return;
    tooltip.style.display = 'block';
    setTimeout(() => { tooltip.style.display = 'none'; }, 2000);
  });
});
