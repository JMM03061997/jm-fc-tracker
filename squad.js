// squad.js - Gerenciamento do Elenco Ativo e Arquivado v2.0
const HubSquad = (() => {
  let showArchived = false;

  const init = () => {
    const searchInput = document.getElementById('filter-search');
    const posSelect = document.getElementById('filter-position');
    const typeSelect = document.getElementById('filter-type');
    const sortSelect = document.getElementById('filter-sort');
    const toggleArchivedBtn = document.getElementById('btn-toggle-archived');

    [searchInput, posSelect, typeSelect, sortSelect].forEach((el) => {
      if (el) el.addEventListener('input', renderSquad);
    });

    if (toggleArchivedBtn) {
      toggleArchivedBtn.addEventListener('click', () => {
        showArchived = !showArchived;
        toggleArchivedBtn.classList.toggle('btn-primary', showArchived);
        toggleArchivedBtn.classList.toggle('btn-outline', !showArchived);
        renderSquad();
      });
    }
  };

  const renderSquad = async () => {
    const grid = document.getElementById('squad-cards-grid');
    if (!grid) return;

    const allCards = await HubDatabase.getAllRecords('cards');
    const archivedCards = allCards.filter((c) => c.archived);
    const archivedCountEl = document.getElementById('archived-count');
    if (archivedCountEl) archivedCountEl.textContent = archivedCards.length;

    let filtered = allCards.filter((c) => Boolean(c.archived) === showArchived);

    const searchTerm = HubUtils.normalizeText(document.getElementById('filter-search')?.value || '');
    const posFilter = document.getElementById('filter-position')?.value || '';
    const typeFilter = document.getElementById('filter-type')?.value || '';
    const sortBy = document.getElementById('filter-sort')?.value || 'ovr-desc';

    if (searchTerm) {
      filtered = filtered.filter((c) => {
        const nameNorm = HubUtils.normalizeText(c.playerName);
        const clubNorm = HubUtils.normalizeText(c.club || '');
        return nameNorm.includes(searchTerm) || clubNorm.includes(searchTerm);
      });
    }

    if (posFilter) {
      filtered = filtered.filter((c) => c.position === posFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter((c) => c.cardType === typeFilter);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'ovr-desc') return b.overall - a.overall;
      if (sortBy === 'ovr-asc') return a.overall - b.overall;
      if (sortBy === 'name-asc') return a.playerName.localeCompare(b.playerName);
      if (sortBy === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state-card" style="grid-column: 1 / -1;">
          <p>${showArchived ? 'Nenhuma carta arquivada encontrada.' : 'Nenhuma carta encontrada no elenco com os filtros atuais.'}</p>
        </div>
      `;
      return;
    }

    for (const card of filtered) {
      const cardEl = await HubCards.createCardElement(card, { showActions: true });
      grid.appendChild(cardEl);
    }
  };

  return {
    init,
    renderSquad
  };
})();
