// cards.js - Cadastro e Gerenciamento de Cartas v2.0
const HubCards = (() => {
  let selectedFile = null;
  let editingCardId = null;
  let editingImageId = null;

  const init = () => {
    const form = document.getElementById('card-form');
    const dropArea = document.getElementById('upload-drop-area');
    const fileInput = document.getElementById('card-image-input');
    const cancelBtn = document.getElementById('btn-cancel-edit');

    if (dropArea && fileInput) {
      dropArea.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', handleFileSelect);
    }

    if (form) {
      form.addEventListener('submit', handleFormSubmit);
      ['card-player-name', 'card-overall', 'card-position', 'card-type', 'card-club'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateLivePreview);
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', resetForm);
    }

    updateLivePreview();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const check = HubImages.validateFile(file);
    if (!check.valid) {
      HubUtils.showToast(check.error);
      return;
    }

    selectedFile = file;
    updateLivePreview();
  };

  const updateLivePreview = async () => {
    const previewContainer = document.getElementById('live-card-preview');
    if (!previewContainer) return;

    const name = document.getElementById('card-player-name').value || 'Nome do Jogador';
    const overall = document.getElementById('card-overall').value || '99';
    const position = document.getElementById('card-position').value || 'CA';
    const cardType = document.getElementById('card-type').value || 'Epic';
    const club = document.getElementById('card-club').value || '';

    let imgSrc = 'card-placeholder.svg';
    if (selectedFile) {
      imgSrc = URL.createObjectURL(selectedFile);
    } else if (editingImageId) {
      imgSrc = await HubImages.getImageUrl(editingImageId);
    }

    previewContainer.innerHTML = `
      <div class="hub-card">
        <div class="hub-card-media">
          <img src="${imgSrc}" alt="${HubUtils.escapeHtml(name)}">
          <div class="hub-card-badges">
            <span class="badge-ovr">${HubUtils.escapeHtml(overall)}</span>
            <span class="badge-pos">${HubUtils.escapeHtml(position)}</span>
          </div>
        </div>
        <div class="hub-card-body">
          <div class="hub-card-name">${HubUtils.escapeHtml(name)}</div>
          <div class="hub-card-meta">${HubUtils.escapeHtml(cardType)}${club ? ' • ' + HubUtils.escapeHtml(club) : ''}</div>
        </div>
      </div>
    `;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const playerName = document.getElementById('card-player-name').value.trim();
    const overall = parseInt(document.getElementById('card-overall').value, 10);
    const position = document.getElementById('card-position').value;
    const cardType = document.getElementById('card-type').value;
    const club = document.getElementById('card-club').value.trim();

    if (!playerName || isNaN(overall) || overall < 40 || overall > 125) {
      HubUtils.showToast('Preencha o nome e um Overall válido (40 a 125).');
      return;
    }

    try {
      let imageId = editingImageId;
      if (selectedFile) {
        imageId = await HubImages.saveImageBlob(selectedFile, editingImageId);
      }

      const existingCard = editingCardId ? await HubDatabase.getRecord('cards', editingCardId) : null;

      const cardRecord = {
        id: editingCardId || HubUtils.generateId('card'),
        playerName,
        overall,
        position,
        cardType,
        club,
        imageId: imageId || null,
        archived: existingCard ? Boolean(existingCard.archived) : false,
        createdAt: existingCard ? existingCard.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await HubDatabase.putRecord('cards', cardRecord);
      HubUtils.showToast(editingCardId ? 'Carta atualizada com sucesso!' : 'Carta cadastrada no elenco!');

      resetForm();
      HubNavigation.navigateTo('view-squad');
    } catch (err) {
      console.error('Erro ao salvar carta:', err);
      HubUtils.showToast('Erro ao salvar carta.');
    }
  };

  const startEdit = async (cardId) => {
    const card = await HubDatabase.getRecord('cards', cardId);
    if (!card) return;

    editingCardId = card.id;
    editingImageId = card.imageId;
    selectedFile = null;

    document.getElementById('card-form-title').textContent = 'Editar Carta';
    document.getElementById('card-id').value = card.id;
    document.getElementById('card-player-name').value = card.playerName;
    document.getElementById('card-overall').value = card.overall;
    document.getElementById('card-position').value = card.position;
    document.getElementById('card-type').value = card.cardType;
    document.getElementById('card-club').value = card.club || '';
    document.getElementById('btn-cancel-edit').classList.remove('hidden');

    HubNavigation.navigateTo('view-cards');
    updateLivePreview();
  };

  const resetForm = () => {
    editingCardId = null;
    editingImageId = null;
    selectedFile = null;

    const form = document.getElementById('card-form');
    if (form) form.reset();

    document.getElementById('card-form-title').textContent = 'Cadastrar Nova Carta';
    document.getElementById('btn-cancel-edit').classList.add('hidden');
    updateLivePreview();
  };

  const toggleArchive = async (cardId) => {
    const card = await HubDatabase.getRecord('cards', cardId);
    if (!card) return;

    card.archived = !card.archived;
    await HubDatabase.putRecord('cards', card);
    HubUtils.showToast(card.archived ? 'Carta arquivada.' : 'Carta restaurada ao elenco.');

    if (typeof HubSquad !== 'undefined') HubSquad.renderSquad();
    if (typeof HubApp !== 'undefined') HubApp.refreshDashboard();
  };

  const confirmDelete = (cardId) => {
    HubUtils.openModal({
      title: 'Excluir Carta',
      bodyHtml: '<p>Tem certeza que deseja excluir esta carta permanentemente? Essa ação não pode ser desfeita.</p>',
      buttons: [
        { text: 'Cancelar', className: 'btn-outline' },
        {
          text: 'Excluir',
          className: 'btn-danger',
          onClick: async () => {
            const card = await HubDatabase.getRecord('cards', cardId);
            if (card && card.imageId) {
              await HubImages.deleteImage(card.imageId);
            }
            await HubDatabase.deleteRecord('cards', cardId);
            HubUtils.showToast('Carta excluída.');
            if (typeof HubSquad !== 'undefined') HubSquad.renderSquad();
            if (typeof HubApp !== 'undefined') HubApp.refreshDashboard();
          }
        }
      ]
    });
  };

  const createCardElement = async (card, options = {}) => {
    const imgUrl = await HubImages.getImageUrl(card.imageId);
    const el = document.createElement('div');
    el.className = 'hub-card';

    el.innerHTML = `
      <div class="hub-card-media">
        <img src="${imgUrl}" alt="${HubUtils.escapeHtml(card.playerName)}" loading="lazy">
        <div class="hub-card-badges">
          <span class="badge-ovr">${card.overall}</span>
          <span class="badge-pos">${HubUtils.escapeHtml(card.position)}</span>
        </div>
      </div>
      <div class="hub-card-body">
        <div class="hub-card-name" title="${HubUtils.escapeHtml(card.playerName)}">${HubUtils.escapeHtml(card.playerName)}</div>
        <div class="hub-card-meta">${HubUtils.escapeHtml(card.cardType)}${card.club ? ' • ' + HubUtils.escapeHtml(card.club) : ''}</div>
        ${options.showActions ? `
          <div class="hub-card-actions">
            <button class="btn btn-outline" data-action="edit">Editar</button>
            <button class="btn btn-outline" data-action="archive">${card.archived ? 'Restaurar' : 'Arquivar'}</button>
            <button class="btn btn-danger" data-action="delete">🗑️</button>
          </div>
        ` : ''}
      </div>
    `;

    if (options.showActions) {
      el.querySelector('[data-action="edit"]').onclick = () => startEdit(card.id);
      el.querySelector('[data-action="archive"]').onclick = () => toggleArchive(card.id);
      el.querySelector('[data-action="delete"]').onclick = () => confirmDelete(card.id);
    }

    return el;
  };

  return {
    init,
    startEdit,
    resetForm,
    toggleArchive,
    confirmDelete,
    createCardElement
  };
})();
