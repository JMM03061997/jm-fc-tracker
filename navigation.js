// navigation.js - Roteador SPA JM Football Hub v2.0
const HubNavigation = (() => {
  const init = () => {
    const buttons = document.querySelectorAll('.nav-btn[data-view]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetView = btn.getAttribute('data-view');
        navigateTo(targetView);
      });
    });
  };

  const navigateTo = (viewId) => {
    document.querySelectorAll('.app-view').forEach((view) => {
      view.classList.remove('active');
    });

    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-view') === viewId) {
        btn.classList.add('active');
      }
    });

    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Gatilhos de atualização automática por tela
    if (viewId === 'view-home' && typeof HubApp !== 'undefined') {
      HubApp.refreshDashboard();
    } else if (viewId === 'view-squad' && typeof HubSquad !== 'undefined') {
      HubSquad.renderSquad();
    } else if (viewId === 'view-formations' && typeof HubFormations !== 'undefined') {
      HubFormations.refresh();
    } else if (viewId === 'view-settings' && typeof HubBackup !== 'undefined') {
      HubBackup.updateStorageSummary();
    }
  };

  return {
    init,
    navigateTo
  };
})();
