/**
 * JM Football Hub - Navegação Modular SPA (js/navigation.js)
 * Controla alternância entre as 7 views sem recarregar a página.
 */

const HubNavigation = (() => {
  const VALID_VIEWS = ['home', 'squad', 'cards', 'formations', 'matches', 'stats', 'settings'];
  let currentView = 'home';

  function init() {
    document.querySelectorAll('[data-nav]').forEach((el) => {
      el.addEventListener('click', () => {
        const target = el.getAttribute('data-nav');
        if (target) {
          goTo(target);
        }
      });
    });

    document.querySelectorAll('[data-action="open-card-modal"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (typeof HubCards !== 'undefined') {
          HubCards.resetForm();
        }
        goTo('cards');
      });
    });
  }

  function goTo(viewName) {
    if (!VALID_VIEWS.includes(viewName)) return;
    currentView = viewName;

    // Atualiza estado das views
    document.querySelectorAll('.view').forEach((section) => {
      section.classList.toggle('active', section.id === `view-${viewName}`);
    });

    // Atualiza menu lateral / inferior
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.toggle('active', item.getAttribute('data-nav') === viewName);
    });

    // Atualiza dados específicos da tela aberta
    if (viewName === 'home' && typeof HubApp !== 'undefined') {
      HubApp.refreshDashboard();
    } else if (viewName === 'squad' && typeof HubSquad !== 'undefined') {
      HubSquad.render();
    } else if (viewName === 'settings' && typeof HubBackup !== 'undefined') {
      HubBackup.updateSummary();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getCurrentView() {
    return currentView;
  }

  return {
    init,
    goTo,
    getCurrentView
  };
})();
