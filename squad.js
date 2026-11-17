// squad.js - Gerenciamento do Elenco, KPIs e Renderização das Cartas
const HubSquad = {
  showArchived: false,
  allCards: [],

  init() {
    ['filter-search', 'filter-position', 'filter-type', 'filter-sort'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.renderSquadGrid());
        el.addEventListener('change', () => this.renderSquadGrid());
      }
    });

    const toggleArchBtn = document.getElementById('btn-toggle-archived');
    if (toggleArchBtn) {
      toggleArchBtn.addEventListener('click', () => {
        this.showArchived = !this.showArchived;
        this.renderSquadGrid();
      });
    }
  },

  async refreshAll() {
    this.allCards = await HubDB.getAll('cards');
    const formations = await HubDB.getAll('formations');

    const activeCards = this.allCards.filter(c => !c.archived);
    const archivedCards = this.allCards.filter(c => c.archived);

    document.getElementById('archived-count').textContent = archivedCards.length;
    document.getElementById('kpi-total-cards').textContent = activeCards.length;
    document.getElementById('kpi-total-formations').textContent = formations.length;

    if (activeCards.length > 0) {
      const sumOvr = activeCards.reduce((acc, c) => acc + (Number(c.overall) || 0), 0);
      document.getElementById('kpi-avg-ovr').textContent = Math.round(sumOvr / activeCards.length);

      const best = [...activeCards].sort((a, b) => b.overall - a.overall)[0];
      document.getElementById('kpi-max-ovr').textContent = best.overall;
      document.getElementById('kpi-max-player').textContent = `${best.playerName} (${best.position})`;
    } else {
      document.getElementById('kpi-avg-ovr').textContent = '0';
      document.getElementById('kpi-max-ovr').textContent = '-';
      document.getElementById('kpi-max-player').textContent = 'Nenhum jogador';
    }

    await this.renderHomeRecent(activeCards);
    await this.renderSquadGrid();
  },

  async createCardElement(card, compact = false) {
    const imgUrl = await HubImages.getImageUrl(card.imageId);
    const div = document.createElement('div');
    div.className = 'player-card-item';
    div.innerHTML = `
      <div class="card-art-wrapper">
        <img src="${imgUrl}" alt="${HubUtils.escapeHtml(card.playerName)}" class="card-art-img" loading="lazy">
        <div class="card-badges-overlay">
          <span class="badge-ovr">${card.overall}</span>
          <span class="badge-pos">${HubUtils.escapeHtml(card.position)}</span>
        </div>
      </div>
      <div class="card-info-body">
        <div class="card-player-title" title="${HubUtils.escapeHtml(card.playerName)}">${HubUtils.escapeHtml(card.playerName)}</div>
        <div class="card-meta-line">${HubUtils.escapeHtml(card.cardType || '')}${card.club ? ' • ' + HubUtils.escapeHtml(card.club) : ''}</div>
      </div>
      ${compact ? '' : `
      <div class="card-actions-bar">
        <button class="btn btn-outline js-edit-card">✏️ Editar</button>
        <button class="btn btn-outline js-archive-card">${card.archived ? '♻️ Ativar' : '📦 Arquivar'}</button>
        <button class="btn btn-danger js-delete-card">🗑️</button>
      </div>`}
    `;

    if (!compact) {
      div.querySelector('.js-edit-card').onclick = () => HubCards.editCard(card.id);
      div.querySelector('.js-archive-card').onclick = async () => {
        card.archived = !card.archived;
        await HubDB.put('cards', card);
        await this.refreshAll();
      };
      div.querySelector('.js-delete-card').onclick = () => {
        HubUtils.showModal(
          'Excluir Carta',
          `<p>Deseja realmente excluir <strong>${HubUtils.escapeHtml(card.playerName)}</strong>?</p>`,
          [
            { label: 'Cancelar', className: 'btn btn-outline' },
            {
              label: 'Excluir',
              className: 'btn btn-danger',
              onClick: async () => {
                await HubDB.delete('cards', card.id);
                await this.refreshAll();
              }
            }
          ]
        );
      };
    }
    return div;
  },

  async renderHomeRecent(activeCards) {
    const container = document.getElementById('home-recent-cards');
    container.innerHTML = '';
    const recent = [...activeCards].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 6);
    if (recent.length === 0) {
      container.innerHTML = '<p class="subtitle">Nenhuma carta cadastrada ainda. Use "+ Nova Carta" ou "Importar por Print".</p>';
      return;
    }
    for (const card of recent) {
      container.appendChild(await this.createCardElement(card, true));
    }
  },

  async renderSquadGrid() {
    const container = document.getElementById('squad-cards-grid');
    const search = (document.getElementById('filter-search').value || '').toLowerCase();
    const pos = document.getElementById('filter-position').value;
    const type = document.getElementById('filter-type').value;
    const sort = document.getElementById('filter-sort').value;

    let list = this.allCards.filter(c => Boolean(c.archived) === this.showArchived);

    if (search) {
      list = list.filter(c =>
        (c.playerName || '').toLowerCase().includes(search) ||
        (c.club || '').toLowerCase().includes(search)
      );
    }
    if (pos) list = list.filter(c => c.position === pos);
    if (type) list = list.filter(c => c.cardType === type);

    list.sort((a, b) => {
      if (sort === 'ovr-desc') return b.overall - a.overall;
      if (sort === 'ovr-asc') return a.overall - b.overall;
      if (sort === 'name-asc') return (a.playerName || '').localeCompare(b.playerName || '');
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    container.innerHTML = '';
    if (list.length === 0) {
      container.innerHTML = '<p class="subtitle">Nenhuma carta encontrada com os filtros atuais.</p>';
      return;
    }

    for (const card of list) {
      container.appendChild(await this.createCardElement(card, false));
    }
  }
};
