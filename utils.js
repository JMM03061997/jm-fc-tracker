/**
 * JM Football Hub - Utilitários Compartilhados (js/utils.js)
 * Centraliza geração de IDs, formatação, validações, notificações e modais.
 */

const HubUtils = (() => {
  /**
   * Gera identificador único seguro para cartas, imagens e registros futuros
   */
  function generateId(prefix = 'id') {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `${prefix}_${crypto.randomUUID()}`;
    }
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `${prefix}_${timestamp}_${randomPart}`;
  }

  /**
   * Normaliza texto para buscas e comparações sem diferenciar acentos ou maiúsculas
   */
  function normalizeText(value) {
    if (!value) return '';
    return String(value)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();
  }

  /**
   * Escapa caracteres HTML para evitar injeção ao renderizar strings dinâmicas
   */
  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Formata data ISO para padrão brasileiro legível
   */
  function formatDate(isoString) {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  }

  /**
   * Exibe notificação temporária (Toast)
   */
  function showToast(message, type = 'info', duration = 3400) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.25s ease';
      setTimeout(() => toast.remove(), 260);
    }, duration);
  }

  /**
   * Abre modal genérico reutilizável com botões customizados
   */
  function openModal({ title, bodyHtml, buttons = [] }) {
    const backdrop = document.getElementById('app-modal');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    const footerEl = document.getElementById('modal-footer');
    const closeBtn = document.getElementById('modal-close-btn');

    if (!backdrop || !titleEl || !bodyEl || !footerEl) return;

    titleEl.textContent = title || 'Confirmação';
    bodyEl.innerHTML = bodyHtml || '';
    footerEl.innerHTML = '';

    buttons.forEach((btnCfg) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn ${btnCfg.className || 'btn-secondary'}`;
      btn.textContent = btnCfg.label;
      btn.addEventListener('click', () => {
        if (typeof btnCfg.onClick === 'function') {
          btnCfg.onClick();
        }
        if (btnCfg.closeOnClick !== false) {
          closeModal();
        }
      });
      footerEl.appendChild(btn);
    });

    const handleClose = () => closeModal();
    closeBtn.onclick = handleClose;
    backdrop.onclick = (e) => {
      if (e.target === backdrop) closeModal();
    };

    backdrop.classList.remove('hidden');
  }

  function closeModal() {
    const backdrop = document.getElementById('app-modal');
    if (backdrop) {
      backdrop.classList.add('hidden');
    }
  }

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
