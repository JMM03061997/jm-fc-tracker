/**
 * JM Football Hub - Gerenciamento de Cartas (js/cards.js)
 * Cadastro manual, múltiplas cartas por jogador, prévia em tempo real,
 * edição preservando imagem existente, arquivamento, restauração e exclusão.
 */

const HubCards = (() => {
  let selectedFile = null;
  let tempPreviewUrl = null;

  function init() {
    const form = document.getElementById('card-form');
    const imageInput = document.getElementById('card-image-input');
    const cancelEditBtn = document.getElementById('btn-cancel-edit');

    // Campos para atualização dinâmica da prévia
    const nameInput = document.getElementById('card-player-name');
    const ovrInput = document.getElementById('card-overall');
    const typeInput = document.getElementById('card-type');
    const posInput = document.getElementById('card-position');
    const clubInput = document.getElementById('card-club');

    if (imageInput) {
      imageInput.addEventListener('change', handleImageSelection);
    }

    [nameInput, ovrInput, typeInput, posInput, clubInput].forEach((input) => {
      if (input) {
        input.addEventListener('input', updateLivePreviewText);
        input.addEventListener('change', updateLivePreviewText);
      }
    });

    if (form) {
      form.addEventListener('submit', handleFormSubmit);
    }

    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        resetForm();
        HubNavigation.goTo('squad');
      });
    }
  }

  function handleImageSelection(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const validation = HubImages.validateImageFile(file);
    if (!validation.valid) {
      HubUtils.showToast(validation.error, 'error');
      event.target.value = '';
      return;
    }

    selectedFile = file;

    if (tempPreviewUrl) {
      URL.revokeObjectURL(tempPreviewUrl);
    }
    tempPreviewUrl = HubImages.createPreviewUrl(file);

    const previewImg = document.getElementById('card-preview-img');
    if (previewImg) {
      previewImg.src = tempPreviewUrl;
    }
  }

  function updateLivePreviewText() {
    const name = document.getElementById('card-player-name').value.trim() || 'Nome do Jogador';
    const ovr = document.getElementById('card-overall').value.trim() || '99';
    const type = document.getElementById('card-type').value || 'Epic';
    const pos = document.getElementById('card-position').value || 'CA';
    const club = document.getElementById('card-club').value.trim() || 'Clube';

    document.getElementById('preview-name').textContent = name;
    document.getElementById('preview-ovr').textContent = ovr;
    document.getElementById('preview-type').textContent = type;
    document.getElementById('preview-pos').textContent = pos;
    document.getElementById('preview-club').textContent = club;
  }

  async function handleFormSubmit(event) {
    event.preventDefault();

    const idField = document.getElementById('card-id').value.trim();
    const existingImageId = document.getElementById('card-existing-image-id').value.trim();
    const playerName = document.getElementById('card-player-name').value.trim();
    const overallRaw = document.getElementById('card-overall').value.trim();
    const cardType = document.getElementById('card-type').value;
    const position = document.getElementById('card-position').value;
    const club = document.getElementById('card-club').value.trim();

    if (!playerName) {
      HubUtils.showToast('Informe o nome do jogador.', 'error');
      return;
    }

    const overall = parseInt(overallRaw, 10);
    if (isNaN(overall) || overall < 40 || overall > 125) {
      HubUtils.showToast('Informe um Overall válido (entre 40 e 125).', 'error');
      return;
    }

    const saveBtn = document.getElementById('btn-save-card');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Salvando...';

    try {
      let finalImageId = existingImageId || null;

      // Se uma nova imagem foi escolhida, salva no IndexedDB sem perder a antiga caso não seja trocada
      if (selectedFile) {
        finalImageId = await HubImages.saveImageBlob(selectedFile, existingImageId || null);
      }

      const now = new Date().toISOString();
      const isEditing = Boolean(idField);
      let existingRecord = null;

      if (isEditing) {
        existingRecord = await HubDatabase.getRecord(HubDatabase.STORES.CARDS, idField);
      }

      const cardRecord = {
        id: isEditing ? idField : HubUtils.generateId('card'),
        playerName,
        overall,
        cardType,
        position,
        club: club || 'Sem Clube',
        imageId: finalImageId,
        archived: existingRecord ? Boolean(existingRecord.archived) : false,
        createdAt: existingRecord ? existingRecord.createdAt : now,
        updatedAt: now
      };

      await HubDatabase.putRecord(HubDatabase.STORES.CARDS, cardRecord);

      HubUtils.showToast(
        isEditing
          ? `Carta de ${playerName} atualizada com sucesso!`
          : `Carta de ${playerName} (${overall}) cadastrada!`
      );

      resetForm();
      await HubApp.refreshDashboard();
      HubNavigation.goTo('squad');
    } catch (err) {
      console.error('Erro ao salvar carta:', err);
      HubUtils.showToast('Erro ao salvar a carta no banco de dados.', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Salvar Carta';
    }
  }

  /**
   * Carrega carta existente no formulário para edição sem perder sua imagem
   */
  async function startEdit(cardId) {
    try {
      const card = await HubDatabase.getRecord(HubDatabase.STORES.CARDS, cardId);
      if (!card) {
        HubUtils.showToast('Carta não encontrada.', 'error');
        return;
      }

      resetForm();

      document.getElementById('card-form-title').textContent = `Editar Carta: ${card.playerName}`;
      document.getElementById('card-id').value = card.id;
      document.getElementById('card-existing-image-id').value = card.imageId || '';
      document.getElementById('card-player-name').value = card.playerName;
      document.getElementById('card-overall').value = card.overall;
      document.getElementById('card-type').value = card.cardType;
      document.getElementById('card-position').value = card.position;
      document.getElementById('card-club').value = card.club === 'Sem Clube' ? '' : card.club;
      document.getElementById('btn-cancel-edit').classList.remove('hidden');

      updateLivePreviewText();

      const previewImg = document.getElementById('card-preview-img');
      if (previewImg) {
        previewImg.src = await HubImages.getImageUrl(card.imageId);
      }

      HubNavigation.goTo('cards');
    } catch (err) {
      console.error('Erro ao preparar edição:', err);
      HubUtils.showToast('Erro ao carregar dados da carta.', 'error');
    }
  }

  /**
   * Alterna estado de arquivamento sem apagar dados ou histórico futuro
   */
  async function toggleArchive(cardId) {
    try {
      const card = await HubDatabase.getRecord(HubDatabase.STORES.CARDS, cardId);
      if (!card) return;

      card.archived = !card.archived;
      card.updatedAt = new Date().toISOString();

      await HubDatabase.putRecord(HubDatabase.STORES.CARDS, card);
      HubUtils.showToast(
        card.archived
          ? `Carta de ${card.playerName} movida para o arquivo.`
          : `Carta de ${card.playerName} restaurada ao elenco!`
      );

      await HubSquad.render();
      await HubApp.refreshDashboard();
    } catch (err) {
      console.error('Erro ao arquivar/restaurar:', err);
      HubUtils.showToast('Não foi possível alterar o status da carta.', 'error');
    }
  }

  /**
   * Solicita confirmação explícita antes de excluir definitivamente uma carta
   */
  async function confirmDelete(cardId) {
    const card = await HubDatabase.getRecord(HubDatabase.STORES.CARDS, cardId);
    if (!card) return;

    HubUtils.openModal({
      title: 'Excluir Carta Definitivamente',
      bodyHtml: `
        <p>Tem certeza que deseja excluir a carta <strong>${HubUtils.escapeHtml(card.playerName)} (${HubUtils.escapeHtml(card.cardType)} • ${card.overall})</strong>?</p>
        <p style="margin-top:10px; font-size:0.86rem;">Esta ação removerá a carta e sua imagem do dispositivo. Registros históricos de partidas futuras serão preservados por identificador.</p>
      `,
      buttons: [
        {
          label: 'Cancelar',
          className: 'btn-secondary'
        },
        {
          label: 'Excluir Carta',
          className: 'btn-danger',
          onClick: async () => {
            try {
              if (card.imageId) {
                await HubImages.deleteImage(card.imageId);
              }
              await HubDatabase.deleteRecord(HubDatabase.STORES.CARDS, card.id);
              HubUtils.showToast(`Carta de ${card.playerName} excluída.`);
              await HubSquad.render();
              await HubApp.refreshDashboard();
            } catch (err) {
              console.error('Erro ao excluir carta:', err);
              HubUtils.showToast('Erro ao excluir carta.', 'error');
            }
          }
        }
      ]
    });
  }

  function resetForm() {
    const form = document.getElementById('card-form');
    if (form) form.reset();

    document.getElementById('card-form-title').textContent = 'Cadastrar Nova Carta';
    document.getElementById('card-id').value = '';
    document.getElementById('card-existing-image-id').value = '';
    document.getElementById('btn-cancel-edit').classList.add('hidden');

    if (tempPreviewUrl) {
      URL.revokeObjectURL(tempPreviewUrl);
      tempPreviewUrl = null;
    }
    selectedFile = null;

    const previewImg = document.getElementById('card-preview-img');
    if (previewImg) {
      previewImg.src = HubImages.PLACEHOLDER_PATH;
    }
    updateLivePreviewText();
  }

  /**
   * Cria elemento DOM padronizado de carta com proporção original preservada
   */
  async function createCardElement(card, options = { showActions: true }) {
    const article = document.createElement('article');
    article.className = 'hub-card';
    article.dataset.cardId = card.id;

    const imgUrl = await HubImages.getImageUrl(card.imageId);

    article.innerHTML = `
      <div class="hub-card-media">
        <img src="${imgUrl}" alt="${HubUtils.escapeHtml(card.playerName)}" loading="lazy" />
      </div>
      <div class="hub-card-info">
        <div class="hub-card-top">
          <span class="pos-badge">${HubUtils.escapeHtml(card.position)}</span>
          <span class="ovr-badge">${HubUtils.escapeHtml(card.overall)}</span>
        </div>
        <h3 class="hub-card-name" title="${HubUtils.escapeHtml(card.playerName)}">${HubUtils.escapeHtml(card.playerName)}</h3>
        <div class="hub-card-meta">
          <span class="type-tag">${HubUtils.escapeHtml(card.cardType)}</span>
          <span class="club-tag" title="${HubUtils.escapeHtml(card.club)}">${HubUtils.escapeHtml(card.club)}</span>
        </div>
      </div>
    `;

    if (options.showActions) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'hub-card-actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn btn-secondary';
      editBtn.textContent = 'Editar';
      editBtn.addEventListener('click', () => startEdit(card.id));

      const archiveBtn = document.createElement('button');
      archiveBtn.type = 'button';
      archiveBtn.className = 'btn btn-outline';
      archiveBtn.textContent = card.archived ? 'Restaurar' : 'Arquivar';
      archiveBtn.addEventListener('click', () => toggleArchive(card.id));

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn btn-danger';
      deleteBtn.textContent = 'Excluir';
      deleteBtn.addEventListener('click', () => confirmDelete(card.id));

      actionsDiv.append(editBtn, archiveBtn, deleteBtn);
      article.appendChild(actionsDiv);
    }

    return article;
  }

  return {
    init,
    startEdit,
    toggleArchive,
    confirmDelete,
    resetForm,
    createCardElement
  };
})();
