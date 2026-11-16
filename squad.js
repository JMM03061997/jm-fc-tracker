/**
 * JM Football Hub - Módulo Meu Elenco (js/squad.js)
 * Gerencia listagem, busca em tempo real, filtros por posição, tipo e overall,
 * ordenação e alternância entre visualização ativa e de cartas arquivadas.
 */

const HubSquad = (() => {
  let viewingArchived = false;

  function init() {
    const searchInput = document.getElementById('filter-search');
    const posSelect = document.getElementById('filter-position');
    const typeSelect = document.getElementById('filter-card-type');
    const minOvrInput = document.getElementById('filter-min-ovr');
    const sortSelect = document.getElementById('filter-sort');
    const clearFiltersBtn = document.getElementById('btn-clear-filters');
    const toggleArchivedBtn = document.getElementById('btn-toggle-archived-view');
    const exitArchivedBtn = document.getElementById('btn-exit-archived-view');

    const filterElements = [searchInput, posSelect, typeSelect, minOvrInput, sortSelect];
    filterElements.forEach((el) => {
      if (el) {
        el.addEventListener('input', () => render());
        el.addEventListener('change', () => render());
      }
    });

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (posSelect) posSelect.value = '';
        if (typeSelect) typeSelect.value = '';
        if (minOvrInput) minOvrInput.value = '';
        if (sortSelect) sortSelect.value = 'ovr-desc';
        render();
      });
    }

    if (toggleArchivedBtn) {
      toggleArchivedBtn.addEventListener('click', () => {
        viewingArchived = !viewingArchived;
        updateArchivedBannerState();
        render();
      });
    }

    if (exitArchivedBtn) {
      exitArchivedBtn.addEventListener('click', () => {
        viewingArchived = false;
        updateArchivedBannerState();
        render();
      });
    }
  }

  function updateArchivedBannerState() {
    const banner = document.getElementById('archived-mode-banner');
    const toggleBtn = document.getElementById('btn-toggle-archived-view');
    if (banner) {
      banner.classList.toggle('hidden', !viewingArchived);
    }
    if (toggleBtn) {
      toggleBtn.textContent = viewingArchived ? 'Voltar ao Elenco Ativo' : `Ver Arquivadas`;
    }
  }

  async function render() {
    const gridContainer = document.getElementById('squad-cards-grid');
    const emptyState = document.getElementById('squad-empty-state');
    const resultsLabel = document.getElementById('squad-results-label');
    const archivedCountEl = document.getElementById('squad-archived-count');

    if (!gridContainer) return;

    try {
      const allCards = await HubDatabase.getAllRecords(HubDatabase.STORES.CARDS);
      
      const archivedCount = allCards.filter(c => c.archived).length;
      if (archivedCountEl) archivedCountEl.textContent = archivedCount;

      // Filtra por status (ativo vs arquivado)
      let cards = allCards.filter(c => viewingArchived ? c.archived : !c.archived);

      // Aplica filtros de busca
      const searchVal = HubUtils.normalizeText(document.getElementById('filter-search')?.value);
      const posVal = document.getElementById('filter-position')?.value;
      const typeVal = document.getElementById('filter-card-type')?.value;
      const minOvrVal = parseInt(document.getElementById('filter-min-ovr')?.value, 10);

      if (searchVal) {
        cards = cards.filter(c => 
          HubUtils.normalizeText(c.playerName).includes(searchVal) ||
          HubUtils.normalizeText(c.club).includes(searchVal) ||
          HubUtils.normalizeText(c.cardType).includes(searchVal)
        );
      }

      if (posVal) {
        cards = cards.filter(c => c.position === posVal);
      }

      if (typeVal) {
        cards = cards.filter(c => c.cardType === typeVal);
      }

      if (!isNaN(minOvrVal)) {
        cards = cards.filter(c => Number(c.overall) >= minOvrVal);
      }

      // Ordenação
      const sortVal = document.getElementById('filter-sort')?.value || 'ovr-desc';
      cards.sort((a, b) => {
        if (sortVal === 'ovr-desc') return Number(b.overall) - Number(a.overall);
        if (sortVal === 'ovr-asc') return Number(a.overall) - Number(b.overall);
        if (sortVal === 'name-asc') return a.playerName.localeCompare(b.playerName);
        if (sortVal === 'name-desc') return b.playerName.localeCompare(a.playerName);
        if (sortVal === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        return 0;
      });

      if (resultsLabel) {
        resultsLabel.textContent = `Mostrando ${cards.length} de ${allCards.filter(c => viewingArchived ? c.archived : !c.archived).length} cartas`;
      }

      gridContainer.innerHTML = '';

      if (cards.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
      }

      if (emptyState) emptyState.classList.add('hidden');

      for (const card of cards) {
        const cardEl = await HubCards.createCardElement(card, { showActions: true });
        gridContainer.appendChild(cardEl);
      }
    } catch (err) {
      console.error('Erro ao renderizar elenco:', err);
      HubUtils.showToast('Erro ao carregar o elenco do IndexedDB.', 'error');
    }
  }

  return {
    init,
    render
  };
})();
