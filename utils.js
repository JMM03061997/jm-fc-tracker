// utils.js - Utilitários Globais JM Football Hub v2.0
const HubUtils = (() => {
  const generateId = (prefix = 'id') => {
    const rand = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${Date.now()}_${rand}`;
  };

  const normalizeText = (text) => {
    if (!text) return '';
    return text
      .toString()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();
  };

  const escapeHtml = (str) => {
    if (!str) return '';
    return str
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR');
  };

  const showToast = (message, duration = 3000) => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  };

  const openModal = ({ title, bodyHtml, buttons = [] }) => {
    const modal = document.getElementById('global-modal');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    const footerEl = document.getElementById('modal-footer');

    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHtml;
    footerEl.innerHTML = '';

    buttons.forEach((btnConfig) => {
      const btn = document.createElement('button');
      btn.className = `btn ${btnConfig.className || 'btn-outline'}`;
      btn.textContent = btnConfig.text;
      btn.onclick = () => {
        if (btnConfig.onClick) btnConfig.onClick();
        if (btnConfig.closeAfter !== false) closeModal();
      };
      footerEl.appendChild(btn);
    });

    modal.classList.remove('hidden');
  };

  const closeModal = () => {
    const modal = document.getElementById('global-modal');
    if (modal) modal.classList.add('hidden');
  };

  return {
    generateId,
    normalizeText,
    escapeHtml,
    formatDate,
    showToast,
    openModal,
    closeModal
  };
})();
