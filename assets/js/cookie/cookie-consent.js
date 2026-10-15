function notifyConsent(consent) {
  window.dispatchEvent(new CustomEvent('cookieconsentchange', {
    detail: { consent: consent === 'true', value: consent }
  }));
}
window.notifyConsent = notifyConsent;

function showCookieSettings(e) {
  e.preventDefault();
  const modal = document.querySelector('.cookie-modal');
  if (modal) {
    modal.style.display = 'block';
    trapFocus(modal);
  }
}
window.showCookieSettings = showCookieSettings;

function trapFocus(element) {
  const focusable = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  first && first.focus();
  element.addEventListener('keydown', function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if (e.key === 'Escape') { element.style.display = 'none'; element.removeEventListener('keydown', handler); }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const config = window.cookieConfig || {
    message: 'This site uses no cookies.',
    messageLong: 'This site uses no cookies.',
    acceptText: 'Accept',
    rejectText: 'Decline',
    settingsText: 'Details',
    modalTitle: 'Privacy Preferences'
  };

  function createPreferencesModal() {
    const modal = document.createElement('div');
    modal.className = 'cookie-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'cookie-modal-title');
    modal.innerHTML = `
      <div class="cookie-modal-content">
        <h3 id="cookie-modal-title">${config.modalTitle}</h3>
        <div class="modal-text-content">
          ${config.messageLong.split('\n').map(line => `<p>${line}</p>`).join('')}
        </div>
        <div class="cookie-modal-buttons">
          <button class="accept-btn">${config.acceptText}</button>
          <button class="reject-btn">${config.rejectText}</button>
        </div>
        <button class="modal-close-btn" aria-label="${config.rejectText}">&times;</button>
      </div>
    `;
    return modal;
  }

  let banner = document.querySelector('.cookie-banner');
  let modal = document.querySelector('.cookie-modal');

  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = `
      <div class="cookie-content">
        <p>${config.message}</p>
        <div class="cookie-buttons">
          <button class="accept-btn">${config.acceptText}</button>
          <button class="reject-btn">${config.rejectText}</button>
          <button class="settings-btn">${config.settingsText}</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
  }

  if (!modal) {
    modal = createPreferencesModal();
    document.body.appendChild(modal);
  }

  const handleConsent = (consent) => {
    localStorage.setItem('cookie-consent', consent);
    banner.style.display = 'none';
    modal.style.display = 'none';
    const settingsLink = document.getElementById('cookie-settings-link');
    if (settingsLink) settingsLink.style.display = 'inline-block';
    notifyConsent(consent);
  };

  banner.querySelector('.accept-btn').addEventListener('click', () => handleConsent('true'));
  banner.querySelector('.reject-btn').addEventListener('click', () => handleConsent('false'));
  banner.querySelector('.settings-btn').addEventListener('click', () => {
    modal.style.display = 'block';
    trapFocus(modal);
  });

  modal.querySelector('.accept-btn').addEventListener('click', () => handleConsent('true'));
  modal.querySelector('.reject-btn').addEventListener('click', () => handleConsent('false'));
  modal.querySelector('.modal-close-btn').addEventListener('click', () => handleConsent('false'));

  const existingConsent = localStorage.getItem('cookie-consent');
  if (existingConsent !== null) {
    banner.style.display = 'none';
    const settingsLink = document.getElementById('cookie-settings-link');
    if (settingsLink) settingsLink.style.display = 'inline-block';
    notifyConsent(existingConsent);
  } else {
    banner.style.display = 'block';
    const settingsLink = document.getElementById('cookie-settings-link');
    if (settingsLink) settingsLink.style.display = 'none';
  }
});
