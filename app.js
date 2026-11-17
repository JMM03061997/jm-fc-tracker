// app.js - Ponto de Entrada JM Football Hub v2.0
const HubApp = (() => {
  let deferredPrompt = null;

  const init = async () => {
    try {
      await HubDatabase.init();
      HubNavigation.init();
      HubCards.init();
      HubSquad.init();
      await HubFormations.init();
      HubBackup.init();

      setupPwaInstall();
      registerServiceWorker();
      await refreshDashboard();
    } catch (err) {
      console.error('Falha na inicialização do app:', err);
    }
  };

  const refreshDashboard = async () => {
    const cards = await HubDatabase.getAllRecords('cards');
    const activeCards = cards.filter((c) => !c.archived);
    const formations = await HubDatabase.getAllRecords('formations');

    document.getElementById('kpi-total-cards').textContent = activeCards.length;
    document.getElementById('kpi-total-formations').textContent = formations.length;

    if (activeCards.length > 0) {
      const sum = activeCards.reduce((acc, c) => acc + c.overall, 0);
      document.getElementById('kpi-avg-ovr').textContent = Math.round(sum / activeCards.length);

      const best = [...activeCards].sort((a, b) => b.overall - a.overall)[0];
      document.getElementById('kpi-max-ovr').textContent = best.overall;
      document.getElementById('kpi-max-player').textContent = `${best.playerName} (${best.cardType})`;
    } else {
      document.getElementById('kpi-avg-ovr').textContent = '0';
      document.getElementById('kpi-max-ovr').textContent = '-';
      document.getElementById('kpi-max-player').textContent = 'Nenhum jogador';
    }

    const recentGrid = document.getElementById('home-recent-cards');
    if (recentGrid) {
      recentGrid.innerHTML = '';
      const recent = [...activeCards]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);

      if (recent.length === 0) {
        recentGrid.innerHTML = '<p style="color:#94A3B8;">Nenhuma carta cadastrada ainda. Comece adicionando seu elenco!</p>';
      } else {
        for (const card of recent) {
          const cardEl = await HubCards.createCardElement(card, { showActions: false });
          recentGrid.appendChild(cardEl);
        }
      }
    }
  };

  const setupPwaInstall = () => {
    const installBtn = document.getElementById('btn-install-pwa');
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installBtn) installBtn.classList.remove('hidden');
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        installBtn.classList.add('hidden');
      });
    }
  };

  const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch((err) => {
        console.warn('Service Worker não registrado:', err);
      });
    }
  };

  return {
    init,
    refreshDashboard
  };
})();

document.addEventListener('DOMContentLoaded', HubApp.init);
