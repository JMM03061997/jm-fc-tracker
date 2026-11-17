// utils.js - Utilitários gerais do JM Football Hub v2.1.1
const HubUtils = {
  generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  showModal(title, bodyHtml, buttons = []) {
    const modal = document.getElementById('global-modal');
    const titleEl = document.getElementById('global-modal-title');
    const bodyEl = document.getElementById('global-modal-body');
    const footerEl = document.getElementById('global-modal-footer');

    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHtml;
    footerEl.innerHTML = '';

    if (buttons.length === 0) {
      buttons = [{ label: 'OK', className: 'btn btn-primary', onClick: () => this.closeModal() }];
    }

    buttons.forEach(btnCfg => {
      const btn = document.createElement('button');
      btn.className = btnCfg.className || 'btn btn-primary';
      btn.textContent = btnCfg.label;
      btn.onclick = () => {
        if (btnCfg.onClick) btnCfg.onClick();
        if (btnCfg.closeOnClick !== false) this.closeModal();
      };
      footerEl.appendChild(btn);
    });

    modal.classList.remove('hidden');
  },

  closeModal() {
    document.getElementById('global-modal').classList.add('hidden');
  }
};
