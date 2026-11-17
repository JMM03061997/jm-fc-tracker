// navigation.js - Navegação entre abas
const HubNavigation = {
  init() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-view');
        this.navigateTo(target);
      });
    });
  },

  navigateTo(viewId) {
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const targetView = document.getElementById(viewId);
    if (targetView) targetView.classList.add('active');

    const activeBtn = document.querySelector(`.nav-btn[data-view="${viewId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    if (viewId === 'view-home' || viewId === 'view-squad') {
      HubSquad.refreshAll();
    } else if (viewId === 'view-formations') {
      HubFormations.renderPitch();
      HubFormations.renderBench();
    } else if (viewId === 'view-settings') {
      HubBackup.updateStats();
    }
  }
};
