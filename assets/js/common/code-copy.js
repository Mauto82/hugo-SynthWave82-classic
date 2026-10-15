// Pulsante "copia" sui blocchi di codice evidenziati (.chroma).
const svg = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
const icons = {
  copy: svg('<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>'),
  done: svg('<polyline points="20 6 9 17 4 12"></polyline>'),
  error: svg('<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'),
};

document.querySelectorAll('.chroma').forEach((block) => {
  // Il contenitore non scorre, così il pulsante resta fermo mentre il codice scorre in orizzontale
  const wrapper = document.createElement('div');
  wrapper.className = 'code-wrapper';
  block.parentNode.insertBefore(wrapper, block);
  wrapper.appendChild(block);

  const button = document.createElement('button');
  button.className = 'copy-button';
  button.innerHTML = icons.copy;
  button.title = 'Copy code';
  wrapper.appendChild(button);

  const flash = (icon) => {
    button.innerHTML = icon;
    setTimeout(() => { button.innerHTML = icons.copy; }, 2000);
  };

  button.addEventListener('click', () => {
    navigator.clipboard.writeText(block.querySelector('code').innerText)
      .then(() => flash(icons.done))
      .catch(() => flash(icons.error));
  });
});
