// cards.js - Cadastro, edição e prévia de cartas com proporção preservada
const HubCards = {
  pendingImageDataUrl: null,

  init() {
    const form = document.getElementById('card-form');
    const dropArea = document.getElementById('upload-drop-area');
    const fileInput = document.getElementById('card-image-input');
    const cancelBtn = document.getElementById('btn-cancel-edit');

    dropArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 8 * 1024 * 1024) {
        HubUtils.showModal('Imagem muito grande', '<p>Escolha uma imagem de até 8MB.</p>');
        return;
      }
      this.pendingImageDataUrl = await HubImages.processUploadFile(file);
      this.updateLivePreview();
    });

    ['card-player-name', 'card-overall', 'card-position', 'card-type', 'card-club'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this.updateLivePreview());
    });

    cancelBtn.addEventListener('click', () => this.resetForm());

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveCard();
    });

    this.updateLivePreview();
  },

  async updateLivePreview() {
    const previewContainer = document.getElementById('live-card-preview');
    const name = document.getElementById('card-player-name').value.trim() || 'Nome do Jogador';
    const ovr = parseInt(document.getElementById('card-overall').value, 10) || 99;
    const pos = document.getElementById('card-position').value || 'CA';
    const type = document.getElementById('card-type').value || 'Epic';
    const club = document.getElementById('card-club').value.trim() || 'Clube / Seleção';

    let imgUrl = 'card-placeholder.svg';
    const editId = document.getElementById('card-id').value;
    if (this.pendingImageDataUrl) {
      imgUrl = this.pendingImageDataUrl;
    } else if (editId) {
      const existing = await HubDB.getById('cards', editId);
      if (existing && existing.imageId) {
        imgUrl = await HubImages.getImageUrl(existing.imageId);
      }
    }

    previewContainer.innerHTML = `
      <div class="player-card-item">
        <div class="card-art-wrapper">
          <img src="${imgUrl}" alt="${HubUtils.escapeHtml(name)}" class="card-art-img">
          <div class="card-badges-overlay">
            <span class="badge-ovr">${ovr}</span>
            <span class="badge-pos">${HubUtils.escapeHtml(pos)}</span>
          </div>
        </div>
        <div class="card-info-body">
          <div class="card-player-title">${HubUtils.escapeHtml(name)}</div>
          <div class="card-meta-line">${HubUtils.escapeHtml(type)} • ${HubUtils.escapeHtml(club)}</div>
        </div>
      </div>
    `;
  },

  async saveCard() {
    const editId = document.getElementById('card-id').value;
    const playerName = document.getElementById('card-player-name').value.trim();
    const overall = parseInt(document.getElementById('card-overall').value, 10) || 90;
    const position = document.getElementById('card-position').value;
    const cardType = document.getElementById('card-type').value;
    const club = document.getElementById('card-club').value.trim();

    if (!playerName) return;

    let existingCard = editId ? await HubDB.getById('cards', editId) : null;
    let imageId = existingCard ? existingCard.imageId : null;

    if (this.pendingImageDataUrl) {
      imageId = await HubImages.saveImage(this.pendingImageDataUrl);
    }

    const cardData = {
      id: existingCard ? existingCard.id : HubUtils.generateId('card'),
      playerName,
      overall,
      position,
      cardType,
      club,
      imageId,
      archived: existingCard ? Boolean(existingCard.archived) : false,
      createdAt: existingCard ? existingCard.createdAt : Date.now(),
      updatedAt: Date.now()
    };

    await HubDB.put('cards', cardData);
    this.resetForm();
    await HubSquad.refreshAll();
    HubNavigation.navigateTo('view-squad');
  },

  async editCard(cardId) {
    const card = await HubDB.getById('cards', cardId);
    if (!card) return;

    document.getElementById('card-id').value = card.id;
    document.getElementById('card-player-name').value = card.playerName;
    document.getElementById('card-overall').value = card.overall;
    document.getElementById('card-position').value = card.position;
    document.getElementById('card-type').value = card.cardType || 'Epic';
    document.getElementById('card-club').value = card.club || '';

    document.getElementById('card-form-title').textContent = 'Editar Carta';
    document.getElementById('btn-cancel-edit').classList.remove('hidden');
    this.pendingImageDataUrl = null;

    HubNavigation.navigateTo('view-cards');
    await this.updateLivePreview();
  },

  resetForm() {
    document.getElementById('card-form').reset();
    document.getElementById('card-id').value = '';
    document.getElementById('card-overall').value = 99;
    document.getElementById('card-form-title').textContent = 'Cadastrar Nova Carta';
    document.getElementById('btn-cancel-edit').classList.add('hidden');
    this.pendingImageDataUrl = null;
    this.updateLivePreview();
  }
};
