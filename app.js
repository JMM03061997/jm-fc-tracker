/**
 * JM Football Hub - Ponto de Entrada Principal (js/app.js)
 * Inicializa IndexedDB, gerencia Dashboard, PWA Install Prompt e ciclo de vida.
 */

const HubApp = (() => {
  let deferredPrompt = null;

  async function init() {
    try {
      await HubDatabase.init();
      console.log('JM Football Hub DB inicializado com sucesso.');
    } catch (err) {
      console.error('Erro crítico ao iniciar banco de dados:', err);
      HubUtils.showToast('Erro ao iniciar banco de dados local.', 'error');
      return;
    }

    // Inicializa módulos
    HubNavigation.init();
    HubCards.init();
    HubSquad.init();
    HubBackup.init();

    // Configura PWA Service Worker e Install Prompt
    setupServiceWorker();
    setupPWAInstallPrompt();

    // Atualiza Dashboard inicial
    await refreshDashboard();
  }

  function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => console.log('Service Worker registrado com escopo:', reg.scope))
          .catch((err) => console.warn('Falha no registro do Service Worker:', err));
      });
    }
  }

  function setupPWAInstallPrompt() {
    const installBtn = document.getElementById('btn-install-pwa');
    if (!installBtn) return;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      installBtn.classList.remove('hidden');
    });

    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        HubUtils.showToast('Obrigado por instalar o JM Football Hub!');
      }
      deferredPrompt = null;
      installBtn.classList.add('hidden');
    });

    window.addEventListener('appinstalled', () => {
      installBtn.classList.add('hidden');
      deferredPrompt = null;
      HubUtils.showToast('Aplicativo instalado com sucesso!');
    });
  }

  async function refreshDashboard() {
    try {
      const cards = await HubDatabase.getAllRecords(HubDatabase.STORES.CARDS);
      const activeCards = cards.filter(c => !c.archived);
      const archivedCount = cards.filter(c => c.archived).length;

      const totalCardsEl = document.getElementById('dash-total-cards');
      const archivedInfoEl = document.getElementById('dash-archived-info');
      const avgOvrEl = document.getElementById('dash-avg-ovr');
      const maxOvrEl = document.getElementById('dash-max-ovr');
      const topPlayerEl = document.getElementById('dash-top-player');
      const uniquePlayersEl = document.getElementById('dash-unique-players');

      const emptyStateEl = document.getElementById('dash-empty-state');
      const recentSectionEl = document.getElementById('dash-recent-section');
      const recentGridEl = document.getElementById('dash-recent-grid');

      if (totalCardsEl) totalCardsEl.textContent = activeCards.length;
      if (archivedInfoEl) archivedInfoEl.textContent = `${archivedCount} arquivadas`;

      if (activeCards.length === 0) {
        if (avgOvrEl) avgOvrEl.textContent = '—';
        if (maxOvrEl) maxOvrEl.textContent = '—';
        if (topPlayerEl) topPlayerEl.textContent = 'Nenhum jogador cadastrado';
        if (uniquePlayersEl) uniquePlayersEl.textContent = '0';

        if (emptyStateEl) emptyStateEl.classList.remove('hidden');
        if (recentSectionEl) recentSectionEl.classList.add('hidden');
        return;
      }

      if (emptyStateEl) emptyStateEl.classList.add('hidden');
      if (recentSectionEl) recentSectionEl.classList.remove('hidden');

      // Calcula estatísticas
      const totalOvr = activeCards.reduce((acc, c) => acc + Number(c.overall || 0), 0);
      const avgOvr = Math.round(totalOvr / activeCards.length);
      if (avgOvrEl) avgOvrEl.textContent = avgOvr;

      const sortedByOvr = [...activeCards].sort((a, b) => Number(b.overall) - Number(a.overall));
      const topCard = sortedByOvr[0];
      if (maxOvrEl) maxOvrEl.textContent = topCard.overall;
      if (topPlayerEl) topPlayerEl.textContent = `${topCard.playerName} (${topCard.cardType})`;

      const uniqueNames = new Set(activeCards.map(c => HubUtils.normalizeText(c.playerName)));
      if (uniquePlayersEl) uniquePlayersEl.textContent = uniqueNames.size;

      // Renderiza últimas 4 cartas no dashboard
      if (recentGridEl) {
        recentGridEl.innerHTML = '';
        const recentCards = [...activeCards].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);
        for (const card of recentCards) {
          const cardEl = await HubCards.createCardElement(card, { showActions: false });
          // Ao clicar na carta no dashboard, vai para o elenco ou edição
          cardEl.style.cursor = 'pointer';
          cardEl.addEventListener('click', () => HubCards.startEdit(card.id));
          recentGridEl.appendChild(cardEl);
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar Dashboard:', err);
    }
  }

  return {
    init,
    refreshDashboard
  };
})();

// Inicializa aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  HubApp.init();
});
