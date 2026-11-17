// formations.js - Campo Tático, Formações e Banco de Reservas (Versão 2.0)
const HubFormations = (() => {
  // Coordenadas táticas (x%, y%) distribuídas proporcionalmente no gramado
  const PRESETS = {
    '4-3-3': [
      { slotId: 's1', pos: 'GO', x: 50, y: 90 },
      { slotId: 's2', pos: 'LE', x: 16, y: 74 },
      { slotId: 's3', pos: 'ZAG', x: 38, y: 77 },
      { slotId: 's4', pos: 'ZAG', x: 62, y: 77 },
      { slotId: 's5', pos: 'LD', x: 84, y: 74 },
      { slotId: 's6', pos: 'VOL', x: 50, y: 58 },
      { slotId: 's7', pos: 'MLG', x: 30, y: 47 },
      { slotId: 's8', pos: 'MLG', x: 70, y: 47 },
      { slotId: 's9', pos: 'PTE', x: 18, y: 24 },
      { slotId: 's10', pos: 'CA', x: 50, y: 18 },
      { slotId: 's11', pos: 'PTD', x: 82, y: 24 }
    ],
    '4-2-1-3': [
      { slotId: 's1', pos: 'GO', x: 50, y: 90 },
      { slotId: 's2', pos: 'LE', x: 16, y: 74 },
      { slotId: 's3', pos: 'ZAG', x: 38, y: 77 },
      { slotId: 's4', pos: 'ZAG', x: 62, y: 77 },
      { slotId: 's5', pos: 'LD', x: 84, y: 74 },
      { slotId: 's6', pos: 'VOL', x: 36, y: 58 },
      { slotId: 's7', pos: 'VOL', x: 64, y: 58 },
      { slotId: 's8', pos: 'MAT', x: 50, y: 40 },
      { slotId: 's9', pos: 'PTE', x: 18, y: 23 },
      { slotId: 's10', pos: 'CA', x: 50, y: 17 },
      { slotId: 's11', pos: 'PTD', x: 82, y: 23 }
    ],
    '4-1-2-3': [
      { slotId: 's1', pos: 'GO', x: 50, y: 90 },
      { slotId: 's2', pos: 'LE', x: 16, y: 74 },
      { slotId: 's3', pos: 'ZAG', x: 38, y: 77 },
      { slotId: 's4', pos: 'ZAG', x: 62, y: 77 },
      { slotId: 's5', pos: 'LD', x: 84, y: 74 },
      { slotId: 's6', pos: 'VOL', x: 50, y: 60 },
      { slotId: 's7', pos: 'MAT', x: 32, y: 42 },
      { slotId: 's8', pos: 'MAT', x: 68, y: 42 },
      { slotId: 's9', pos: 'PTE', x: 18, y: 23 },
      { slotId: 's10', pos: 'CA', x: 50, y: 17 },
      { slotId: 's11', pos: 'PTD', x: 82, y: 23 }
    ],
    '4-4-2': [
      { slotId: 's1', pos: 'GO', x: 50, y: 90 },
      { slotId: 's2', pos: 'LE', x: 16, y: 74 },
      { slotId: 's3', pos: 'ZAG', x: 38, y: 77 },
      { slotId: 's4', pos: 'ZAG', x: 62, y: 77 },
      { slotId: 's5', pos: 'LD', x: 84, y: 74 },
      { slotId: 's6', pos: 'MLE', x: 18, y: 48 },
      { slotId: 's7', pos: 'MLG', x: 39, y: 52 },
      { slotId: 's8', pos: 'MLG', x: 61, y: 52 },
      { slotId: 's9', pos: 'MLD', x: 82, y: 48 },
      { slotId: 's10', pos: 'CA', x: 37, y: 21 },
      { slotId: 's11', pos: 'CA', x: 63, y: 21 }
    ],
    '4-2-2-2': [
      { slotId: 's1', pos: 'GO', x: 50, y: 90 },
      { slotId: 's2', pos: 'LE', x: 16, y: 74 },
      { slotId: 's3', pos: 'ZAG', x: 38, y: 77 },
      { slotId: 's4', pos: 'ZAG', x: 62, y: 77 },
      { slotId: 's5', pos: 'LD', x: 84, y: 74 },
      { slotId: 's6', pos: 'VOL', x: 37, y: 58 },
      { slotId: 's7', pos: 'VOL', x: 63, y: 58 },
      { slotId: 's8', pos: 'MAT', x: 26, y: 39 },
      { slotId: 's9', pos: 'MAT', x: 74, y: 39 },
      { slotId: 's10', pos: 'CA', x: 37, y: 19 },
      { slotId: 's11', pos: 'CA', x: 63, y: 19 }
    ],
    '4-3-1-2': [
      { slotId: 's1', pos: 'GO', x: 50, y: 90 },
      { slotId: 's2', pos: 'LE', x: 16, y: 74 },
      { slotId: 's3', pos: 'ZAG', x: 38, y: 77 },
      { slotId: 's4', pos: 'ZAG', x: 62, y: 77 },
      { slotId: 's5', pos: 'LD', x: 84, y: 74 },
      { slotId: 's6', pos: 'VOL', x: 50, y: 60 },
      { slotId: 's7', pos: 'MLG', x: 28, y: 49 },
      { slotId: 's8', pos: 'MLG', x: 72, y: 49 },
      { slotId: 's9', pos: 'MAT', x: 50, y: 36 },
      { slotId: 's10', pos: 'CA', x: 37, y: 19 },
      { slotId: 's11', pos: 'CA', x: 63, y: 19 }
    ],
    '3-2-3-2': [
      { slotId: 's1', pos: 'GO', x: 50, y: 90 },
      { slotId: 's2', pos: 'ZAG', x: 25, y: 75 },
      { slotId: 's3', pos: 'ZAG', x: 50, y: 77 },
      { slotId: 's4', pos: 'ZAG', x: 75, y: 75 },
      { slotId: 's5', pos: 'VOL', x: 37, y: 57 },
      { slotId: 's6', pos: 'VOL', x: 63, y: 57 },
      { slotId: 's7', pos: 'MLE', x: 16, y: 41 },
      { slotId: 's8', pos: 'MAT', x: 50, y: 38 },
      { slotId: 's9', pos: 'MLD', x: 84, y: 41 },
      { slotId: 's10', pos: 'CA', x: 37, y: 19 },
      { slotId: 's11', pos: 'CA', x: 63, y: 19 }
    ],
    '3-1-4-2': [
      { slotId: 's1', pos: 'GO', x: 50, y: 90 },
      { slotId: 's2', pos: 'ZAG', x: 25, y: 75 },
      { slotId: 's3', pos: 'ZAG', x: 50, y: 77 },
      { slotId: 's4', pos: 'ZAG', x: 75, y: 75 },
      { slotId: 's5', pos: 'VOL', x: 50, y: 60 },
      { slotId: 's6', pos: 'MLE', x: 16, y: 42 },
      { slotId: 's7', pos: 'MLG', x: 38, y: 45 },
      { slotId: 's8', pos: 'MLG', x: 62, y: 45 },
      { slotId: 's9', pos: 'MLD', x: 84, y: 42 },
      { slotId: 's10', pos: 'CA', x: 37, y: 19 },
      { slotId: 's11', pos: 'CA', x: 63, y: 19 }
    ],
    '5-3-2': [
      { slotId: 's1', pos: 'GO', x: 50, y: 90 },
      { slotId: 's2', pos: 'LE', x: 14, y: 69 },
      { slotId: 's3', pos: 'ZAG', x: 32, y: 76 },
      { slotId: 's4', pos: 'ZAG', x: 50, y: 78 },
      { slotId: 's5', pos: 'ZAG', x: 68, y: 76 },
      { slotId: 's6', pos: 'LD', x: 86, y: 69 },
      { slotId: 's7', pos: 'MLG', x: 30, y: 49 },
      { slotId: 's8', pos: 'VOL', x: 50, y: 54 },
      { slotId: 's9', pos: 'MLG', x: 70, y: 49 },
      { slotId: 's10', pos: 'CA', x: 37, y: 20 },
      { slotId: 's11', pos: 'CA', x: 63, y: 20 }
    ],
    'custom': [
      { slotId: 's1', pos: 'GO', x: 50, y: 90 },
      { slotId: 's2', pos: 'ZAG', x: 25, y: 75 },
      { slotId: 's3', pos: 'ZAG', x: 50, y: 75 },
      { slotId: 's4', pos: 'ZAG', x: 75, y: 75 },
      { slotId: 's5', pos: 'VOL', x: 35, y: 56 },
      { slotId: 's6', pos: 'VOL', x: 65, y: 56 },
      { slotId: 's7', pos: 'MAT', x: 25, y: 38 },
      { slotId: 's8', pos: 'MAT', x: 50, y: 38 },
      { slotId: 's9', pos: 'MAT', x: 75, y: 38 },
      { slotId: 's10', pos: 'CA', x: 36, y: 19 },
      { slotId: 's11', pos: 'CA', x: 64, y: 19 }
    ]
  };

  let currentSquad = null;
  let swapSourceSlotId = null; // Armazena slotId quando o usuário escolhe "Trocar de Posição"
  let pickerMode = 'pitch'; // 'pitch' ou 'bench'
  let activeSlotId = null;

  const init = async () => {
    bindEvents();
    await loadOrCreateDefaultSquad();
  };

  const bindEvents = () => {
    document.getElementById('saved-squad-select')?.addEventListener('change', async (e) => {
      const id = e.target.value;
      if (id) {
        const found = await HubDatabase.getRecord('formations', id);
        if (found) {
          currentSquad = found;
          swapSourceSlotId = null;
          renderAll();
        }
      }
    });

    document.getElementById('formation-preset-select')?.addEventListener('change', (e) => {
      if (!currentSquad) return;
      currentSquad.formationType = e.target.value;
      swapSourceSlotId = null;
      renderAll();
    });

    document.getElementById('squad-name-input')?.addEventListener('input', (e) => {
      if (currentSquad) currentSquad.name = e.target.value;
    });

    document.getElementById('btn-save-squad')?.addEventListener('click', saveCurrentSquad);
    document.getElementById('btn-new-squad')?.addEventListener('click', createNewSquad);
    document.getElementById('btn-delete-squad')?.addEventListener('click', deleteCurrentSquad);
    document.getElementById('btn-clear-pitch')?.addEventListener('click', clearPitch);
    document.getElementById('btn-add-bench')?.addEventListener('click', () => openPickerForBench());

    // Modal Picker Events
    document.getElementById('btn-close-picker')?.addEventListener('click', closePicker);
    document.getElementById('picker-search')?.addEventListener('input', renderPickerList);
    document.getElementById('picker-pos-filter')?.addEventListener('change', renderPickerList);

    document.getElementById('btn-slot-remove')?.addEventListener('click', () => {
      if (activeSlotId && currentSquad) {
        delete currentSquad.slots[activeSlotId];
        closePicker();
        renderAll();
        HubUtils.showToast('Jogador removido do campo.');
      }
    });

    document.getElementById('btn-slot-move')?.addEventListener('click', () => {
      if (activeSlotId) {
        swapSourceSlotId = activeSlotId;
        closePicker();
        renderAll();
        HubUtils.showToast('Toque na posição de destino no campo para trocar os jogadores.');
      }
    });
  };

  const loadOrCreateDefaultSquad = async () => {
    const all = await HubDatabase.getAllRecords('formations');
    if (all.length > 0) {
      currentSquad = all[0];
    } else {
      currentSquad = {
        id: HubUtils.generateId('form'),
        name: 'Time Principal',
        formationType: '4-3-3',
        slots: {},
        bench: [],
        updatedAt: new Date().toISOString()
      };
      await HubDatabase.putRecord('formations', currentSquad);
    }
    await refresh();
  };

  const refresh = async () => {
    await populateSavedSelect();
    renderAll();
  };

  const populateSavedSelect = async () => {
    const select = document.getElementById('saved-squad-select');
    if (!select) return;

    const all = await HubDatabase.getAllRecords('formations');
    select.innerHTML = '';

    all.forEach((sq) => {
      const opt = document.createElement('option');
      opt.value = sq.id;
      opt.textContent = `${sq.name || 'Sem Nome'} (${sq.formationType})`;
      if (currentSquad && sq.id === currentSquad.id) opt.selected = true;
      select.appendChild(opt);
    });
  };

  const createNewSquad = async () => {
    const all = await HubDatabase.getAllRecords('formations');
    const newSquad = {
      id: HubUtils.generateId('form'),
      name: `Escalação #${all.length + 1}`,
      formationType: '4-3-3',
      slots: {},
      bench: [],
      updatedAt: new Date().toISOString()
    };
    await HubDatabase.putRecord('formations', newSquad);
    currentSquad = newSquad;
    swapSourceSlotId = null;
    await refresh();
    HubUtils.showToast('Nova escalação criada!');
  };

  const saveCurrentSquad = async () => {
    if (!currentSquad) return;
    const nameInput = document.getElementById('squad-name-input');
    currentSquad.name = (nameInput?.value || '').trim() || 'Escalação Sem Nome';
    await HubDatabase.putRecord('formations', currentSquad);
    await populateSavedSelect();
    HubUtils.showToast('Escalação salva no banco de dados!');
  };

  const deleteCurrentSquad = async () => {
    const all = await HubDatabase.getAllRecords('formations');
    if (all.length <= 1) {
      HubUtils.showToast('Você precisa manter pelo menos uma escalação salva.');
      return;
    }

    HubUtils.openModal({
      title: 'Excluir Escalação',
      bodyHtml: `<p>Deseja excluir a escalação <strong>${HubUtils.escapeHtml(currentSquad.name)}</strong>? Suas cartas não serão apagadas.</p>`,
      buttons: [
        { text: 'Cancelar', className: 'btn-outline' },
        {
          text: 'Excluir',
          className: 'btn-danger',
          onClick: async () => {
            await HubDatabase.deleteRecord('formations', currentSquad.id);
            await loadOrCreateDefaultSquad();
            HubUtils.showToast('Escalação excluída.');
          }
        }
      ]
    });
  };

  const clearPitch = () => {
    if (!currentSquad) return;
    currentSquad.slots = {};
    swapSourceSlotId = null;
    renderAll();
    HubUtils.showToast('Campo limpo.');
  };

  const renderAll = async () => {
    if (!currentSquad) return;

    const nameInput = document.getElementById('squad-name-input');
    const presetSelect = document.getElementById('formation-preset-select');

    if (nameInput) nameInput.value = currentSquad.name || '';
    if (presetSelect) presetSelect.value = currentSquad.formationType || '4-3-3';

    await renderPitch();
    await renderBench();
  };

  const renderPitch = async () => {
    const layer = document.getElementById('pitch-slots-layer');
    if (!layer) return;

    const layout = PRESETS[currentSquad.formationType] || PRESETS['4-3-3'];
    const allCards = await HubDatabase.getAllRecords('cards');
    const cardsMap = new Map(allCards.map((c) => [c.id, c]));

    layer.innerHTML = '';

    let startersCount = 0;
    let totalOvr = 0;

    for (const slotDef of layout) {
      const assignedCardId = currentSquad.slots[slotDef.slotId];
      const card = assignedCardId ? cardsMap.get(assignedCardId) : null;

      // Proteção de integridade caso a carta tenha sido excluída ou arquivada
      if (assignedCardId && (!card || card.archived)) {
        delete currentSquad.slots[slotDef.slotId];
      }

      const slotEl = document.createElement('div');
      slotEl.className = 'tactical-slot';
      if (swapSourceSlotId === slotDef.slotId) {
        slotEl.classList.add('swap-source');
      }

      slotEl.style.left = `${slotDef.x}%`;
      slotEl.style.top = `${slotDef.y}%`;

      if (card && !card.archived) {
        startersCount++;
        totalOvr += card.overall;
        slotEl.classList.add('occupied');
        const imgUrl = await HubImages.getImageUrl(card.imageId);

        slotEl.innerHTML = `
          <div class="slot-card-wrapper" title="${HubUtils.escapeHtml(card.playerName)} (${card.overall})">
            <img src="${imgUrl}" alt="${HubUtils.escapeHtml(card.playerName)}">
            <span class="slot-pos-pill">${slotDef.pos} • ${card.overall}</span>
          </div>
        `;
      } else {
        slotEl.innerHTML = `
          <span class="slot-empty-pos">${slotDef.pos}</span>
          <span class="slot-empty-plus">+</span>
        `;
      }

      slotEl.addEventListener('click', () => handleSlotClick(slotDef));
      layer.appendChild(slotEl);
    }

    const countEl = document.getElementById('pitch-starters-count');
    const ovrEl = document.getElementById('pitch-avg-ovr');
    if (countEl) countEl.textContent = `${startersCount}/11`;
    if (ovrEl) ovrEl.textContent = startersCount > 0 ? Math.round(totalOvr / startersCount) : 0;
  };

  const handleSlotClick = (slotDef) => {
    // Se estamos no modo de troca (Swap) entre posições do campo
    if (swapSourceSlotId) {
      if (swapSourceSlotId !== slotDef.slotId) {
        const sourceCardId = currentSquad.slots[swapSourceSlotId];
        const targetCardId = currentSquad.slots[slotDef.slotId];

        if (targetCardId) {
          currentSquad.slots[swapSourceSlotId] = targetCardId;
        } else {
          delete currentSquad.slots[swapSourceSlotId];
        }

        if (sourceCardId) {
          currentSquad.slots[slotDef.slotId] = sourceCardId;
        }

        HubUtils.showToast('Posições trocadas!');
      }
      swapSourceSlotId = null;
      renderAll();
      return;
    }

    // Abre modal de seleção/detalhes para o slot clicado
    pickerMode = 'pitch';
    activeSlotId = slotDef.slotId;
    openPickerModal(slotDef);
  };

  const openPickerForBench = () => {
    pickerMode = 'bench';
    activeSlotId = null;
    openPickerModal(null);
  };

  const openPickerModal = async (slotDef) => {
    const modal = document.getElementById('player-picker-modal');
    const titleEl = document.getElementById('picker-modal-title');
    const actionsBox = document.getElementById('picker-current-slot-actions');
    const infoBox = document.getElementById('picker-current-player-info');
    const posFilter = document.getElementById('picker-pos-filter');

    document.getElementById('picker-search').value = '';

    if (pickerMode === 'pitch' && slotDef) {
      titleEl.textContent = `Posição: ${slotDef.pos}`;
      if (posFilter) posFilter.value = slotDef.pos;

      const currentCardId = currentSquad.slots[slotDef.slotId];
      if (currentCardId) {
        const card = await HubDatabase.getRecord('cards', currentCardId);
        if (card) {
          actionsBox.classList.remove('hidden');
          infoBox.innerHTML = `<strong>${HubUtils.escapeHtml(card.playerName)}</strong> • OVR ${card.overall} (${HubUtils.escapeHtml(card.cardType)})`;
        } else {
          actionsBox.classList.add('hidden');
        }
      } else {
        actionsBox.classList.add('hidden');
      }
    } else {
      titleEl.textContent = 'Adicionar ao Banco de Reservas';
      if (posFilter) posFilter.value = '';
      actionsBox.classList.add('hidden');
    }

    await renderPickerList();
    modal.classList.remove('hidden');
  };

  const closePicker = () => {
    const modal = document.getElementById('player-picker-modal');
    if (modal) modal.classList.add('hidden');
  };

  const renderPickerList = async () => {
    const listEl = document.getElementById('picker-cards-list');
    if (!listEl) return;

    const allCards = await HubDatabase.getAllRecords('cards');
    const activeCards = allCards.filter((c) => !c.archived);

    const search = HubUtils.normalizeText(document.getElementById('picker-search')?.value || '');
    const pos = document.getElementById('picker-pos-filter')?.value || '';

    const startersIds = new Set(Object.values(currentSquad.slots || {}));
    const benchIds = new Set(currentSquad.bench || []);

    let filtered = activeCards;
    if (search) {
      filtered = filtered.filter((c) => HubUtils.normalizeText(c.playerName).includes(search));
    }
    if (pos) {
      filtered = filtered.filter((c) => c.position === pos);
    }

    filtered.sort((a, b) => b.overall - a.overall);
    listEl.innerHTML = '';

    if (filtered.length === 0) {
      listEl.innerHTML = '<p style="grid-column: 1 / -1; text-align:center;">Nenhuma carta ativa encontrada.</p>';
      return;
    }

    for (const card of filtered) {
      const imgUrl = await HubImages.getImageUrl(card.imageId);
      const isStarter = startersIds.has(card.id);
      const isBench = benchIds.has(card.id);

      const item = document.createElement('div');
      item.className = 'picker-card-option';
      if (isStarter || isBench) item.classList.add('in-use');

      let statusTag = '';
      if (isStarter) statusTag = '<small style="color:#58C7F5; display:block;">Titular</small>';
      else if (isBench) statusTag = '<small style="color:#F59E0B; display:block;">Reserva</small>';

      item.innerHTML = `
        <img src="${imgUrl}" alt="${HubUtils.escapeHtml(card.playerName)}">
        <div style="font-weight:700; font-size:0.8rem; margin-top:4px;">${HubUtils.escapeHtml(card.playerName)}</div>
        <div style="font-size:0.72rem; color:#94A3B8;">${card.position} • ${card.overall} (${HubUtils.escapeHtml(card.cardType)})</div>
        ${statusTag}
      `;

      item.onclick = () => assignCardSelection(card.id);
      listEl.appendChild(item);
    }
  };

  const assignCardSelection = (cardId) => {
    if (!currentSquad) return;

    // Remove de qualquer outra posição no campo ou banco para evitar duplicação da mesma carta
    for (const [sId, cId] of Object.entries(currentSquad.slots)) {
      if (cId === cardId) delete currentSquad.slots[sId];
    }
    currentSquad.bench = (currentSquad.bench || []).filter((id) => id !== cardId);

    if (pickerMode === 'pitch' && activeSlotId) {
      currentSquad.slots[activeSlotId] = cardId;
      HubUtils.showToast('Jogador escalado no campo!');
    } else if (pickerMode === 'bench') {
      if (currentSquad.bench.length >= 12) {
        HubUtils.showToast('Limite máximo de 12 reservas atingido.');
        return;
      }
      currentSquad.bench.push(cardId);
      HubUtils.showToast('Jogador adicionado ao banco de reservas!');
    }

    closePicker();
    renderAll();
  };

  const renderBench = async () => {
    const grid = document.getElementById('bench-slots-grid');
    const countEl = document.getElementById('bench-count');
    if (!grid) return;

    const allCards = await HubDatabase.getAllRecords('cards');
    const cardsMap = new Map(allCards.map((c) => [c.id, c]));

    // Filtra reservas válidas (não excluídas e não arquivadas)
    currentSquad.bench = (currentSquad.bench || []).filter((id) => {
      const c = cardsMap.get(id);
      return c && !c.archived;
    });

    if (countEl) countEl.textContent = `${currentSquad.bench.length}/12`;
    grid.innerHTML = '';

    if (currentSquad.bench.length === 0) {
      grid.innerHTML = '<p style="grid-column: 1 / -1; font-size:0.8rem; color:#64748B;">Nenhum jogador no banco.</p>';
      return;
    }

    for (const cardId of currentSquad.bench) {
      const card = cardsMap.get(cardId);
      const imgUrl = await HubImages.getImageUrl(card.imageId);

      const item = document.createElement('div');
      item.className = 'bench-card-item';
      item.title = 'Toque para remover do banco';
      item.innerHTML = `
        <img src="${imgUrl}" alt="${HubUtils.escapeHtml(card.playerName)}" class="bench-card-img">
        <div class="bench-card-name">${HubUtils.escapeHtml(card.playerName)}</div>
        <div class="bench-card-meta">${card.position} • ${card.overall}</div>
      `;

      item.onclick = () => {
        currentSquad.bench = currentSquad.bench.filter((id) => id !== cardId);
        renderAll();
        HubUtils.showToast('Removido do banco de reservas.');
      };

      grid.appendChild(item);
    }
  };

  return {
    init,
    refresh
  };
})();
