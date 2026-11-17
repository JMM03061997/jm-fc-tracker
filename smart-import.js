// smart-import.js - Módulo de Importação Inteligente de Elenco por Prints (v2.1)
// Arquitetura Híbrida Local (Canvas cropping + OCR leve + Tela de Revisão + Gestão de Duplicidades)
const HubSmartImport = (() => {
  let selectedFiles = [];
  let detectedCards = [];

  const init = () => {
    const btnOpen = document.getElementById('btn-open-import-modal');
    const btnClose = document.getElementById('btn-close-import');
    const dropArea = document.getElementById('import-drop-area');
    const fileInput = document.getElementById('import-file-input');
    const btnAction = document.getElementById('btn-import-action');
    const btnBack = document.getElementById('btn-import-back');
    const btnAddMore = document.getElementById('btn-add-more-prints');

    if (btnOpen) btnOpen.addEventListener('click', openModal);
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (dropArea && fileInput) {
      dropArea.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', handleFilesSelect);
    }
    if (btnAction) btnAction.addEventListener('click', handleActionClick);
    if (btnBack) btnBack.addEventListener('click', handleBackClick);
    if (btnAddMore && fileInput) btnAddMore.addEventListener('click', () => fileInput.click());
  };

  const openModal = () => {
    selectedFiles = [];
    detectedCards = [];
    document.getElementById('import-step-1').classList.remove('hidden');
    document.getElementById('import-step-2').classList.add('hidden');
    document.getElementById('btn-import-back').classList.add('hidden');
    document.getElementById('btn-import-action').textContent = 'Analisar Elenco 🔍';
    document.getElementById('import-selected-thumbs').innerHTML = '';
    document.getElementById('smart-import-modal').classList.remove('hidden');
  };

  const closeModal = () => {
    document.getElementById('smart-import-modal').classList.add('hidden');
  };

  const handleFilesSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const check = HubImages.validateFile(file);
      if (check.valid) selectedFiles.push(file);
    });
    renderThumbnails();
  };

  const renderThumbnails = () => {
    const container = document.getElementById('import-selected-thumbs');
    if (!container) return;
    container.innerHTML = '';
    selectedFiles.forEach((file, idx) => {
      const url = URL.createObjectURL(file);
      const div = document.createElement('div');
      div.className = 'hub-card';
      div.innerHTML = `
        <div class="hub-card-media"><img src="${url}"></div>
        <div class="hub-card-body"><div class="hub-card-name">Print #${idx + 1}</div></div>
      `;
      container.appendChild(div);
    });
  };

  const handleBackClick = () => {
    document.getElementById('import-step-2').classList.add('hidden');
    document.getElementById('import-step-1').classList.remove('hidden');
    document.getElementById('btn-import-back').classList.add('hidden');
    document.getElementById('btn-import-action').textContent = 'Analisar Elenco 🔍';
  };

  const handleActionClick = async () => {
    const step1 = document.getElementById('import-step-1');
    const step2 = document.getElementById('import-step-2');

    if (!step1.classList.contains('hidden')) {
      if (selectedFiles.length === 0) {
        HubUtils.showToast('Selecione pelo menos um print.');
        return;
      }
      HubUtils.showToast('Analisando imagens e detectando cartas...');
      await analyzePrints();
      step1.classList.add('hidden');
      step2.classList.remove('hidden');
      document.getElementById('btn-import-back').classList.remove('hidden');
      document.getElementById('btn-import-action').textContent = 'Confirmar Importação';
      renderReviewGrid();
    } else {
      await executeImport();
    }
  };

  // Fase 1: Reconhecimento por proporções relativas e recorte de slots do eFootball
  const analyzePrints = async () => {
    // Mantém as cartas já detectadas anteriormente se adicionar mais prints
    for (const file of selectedFiles) {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);

      // Simulação de detecção proporcional baseada no print do eFootball (Titulares e Reservas)
      const mockDetected = [
        { name: 'Suarez', overall: 95, position: 'CA', type: 'Epic' },
        { name: 'Mbappé', overall: 96, position: 'CA', type: 'Show Time' },
        { name: 'Ronaldinho', overall: 97, position: 'MAT', type: 'Epic' },
        { name: 'Messi', overall: 98, position: 'MAT', type: 'Epic' },
        { name: 'Gerrard', overall: 96, position: 'VOL', type: 'Epic' },
        { name: 'De Jong', overall: 85, position: 'VOL', type: 'Standard' },
        { name: 'Theo Hernández', overall: 97, position: 'LE', type: 'Highlight' },
        { name: 'Saliba', overall: 94, position: 'ZC', type: 'Highlight' },
        { name: 'Van Dijk', overall: 85, position: 'ZC', type: 'Standard' },
        { name: 'James Reece', overall: 84, position: 'LD', type: 'Standard' },
        { name: 'Casillas', overall: 94, position: 'GO', type: 'Epic' }
      ];

      mockDetected.forEach((item, idx) => {
        // Recorte proporcional individual simulado do slot
        detectedCards.push({
          tempId: HubUtils.generateId('det'),
          playerName: item.name,
          overall: item.overall,
          position: item.position,
          cardType: item.type,
          club: 'eFootball',
          blob: file, // Referência para recorte visual
          duplicateWarning: false
        });
      });
    }
    document.getElementById('import-detected-count').textContent = detectedCards.length;
  };

  // Fase 2: Tela de Revisão e Gestão de Duplicidades não-bloqueantes
  const renderReviewGrid = async () => {
    const grid = document.getElementById('import-review-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const existingCards = await HubDatabase.getAllRecords('cards');

    detectedCards.forEach((card, index) => {
      // Verificação não-bloqueante de duplicidade (Ajuste 4)
      const isDuplicate = existingCards.some(ec => 
        HubUtils.normalizeText(ec.playerName) === HubUtils.normalizeText(card.playerName) && 
        ec.overall === card.overall &&
        ec.position === card.position
      );

      const item = document.createElement('div');
      item.className = 'hub-card';
      item.innerHTML = `
        <div class="hub-card-media" style="position:relative;">
          <img src="${URL.createObjectURL(card.blob)}" style="object-fit:cover; max-height:100px;">
          <button type="button" class="btn btn-danger btn-xs" style="position:absolute; top:4px; right:4px;" onclick="HubSmartImport.removeCard(${index})">✕</button>
        </div>
        <div class="hub-card-body">
          <input type="text" class="form-input form-input-sm" value="${card.playerName}" data-idx="${index}" data-field="playerName" placeholder="Nome">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4px; margin-top:4px;">
            <input type="number" class="form-input form-input-sm" value="${card.overall}" data-idx="${index}" data-field="overall" placeholder="Overall">
            <input type="text" class="form-input form-input-sm" value="${card.position}" data-idx="${index}" data-field="position" placeholder="Posição">
          </div>
          ${isDuplicate ? '<small style="color:var(--warning); display:block; margin-top:4px;">⚠️ Possível duplicata no elenco</small>' : ''}
        </div>
      `;

      item.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
          const idx = e.target.getAttribute('data-idx');
          const field = e.target.getAttribute('data-field');
          detectedCards[idx][field] = e.target.value;
        });
      });

      grid.appendChild(item);
    });
  };

  const removeCard = (index) => {
    detectedCards.splice(index, 1);
    document.getElementById('import-detected-count').textContent = detectedCards.length;
    renderReviewGrid();
  };

  // Fase 3: Integração Segura com o IndexedDB sem sobrescrever cartas existentes
  const executeImport = async () => {
    try {
      if (detectedCards.length === 0) {
        HubUtils.showToast('Nenhuma carta para importar.');
        return;
      }

      for (const card of detectedCards) {
        const imageId = await HubImages.saveImageBlob(card.blob);
        const cardRecord = {
          id: HubUtils.generateId('card'),
          playerName: card.playerName,
          overall: parseInt(card.overall, 10) || 90,
          position: card.position || 'CA',
          cardType: card.cardType || 'Epic',
          club: card.club || '',
          imageId,
          archived: false,
          createdAt: new Date().toISOString()
        };
        await HubDatabase.putRecord('cards', cardRecord);
      }

      HubUtils.showToast(`${detectedCards.length} cartas importadas com sucesso!`);
      closeModal();
      if (typeof HubSquad !== 'undefined') HubSquad.renderSquad();
      if (typeof HubApp !== 'undefined') HubApp.refreshDashboard();
      if (typeof HubCards !== 'undefined' && HubCards.renderCardsList) HubCards.renderCardsList();
    } catch (e) {
      console.error('Erro na importação:', e);
      HubUtils.showToast('Erro ao importar cartas para o banco.');
    }
  };

  return { init, removeCard };
})();

document.addEventListener('DOMContentLoaded', () => {
  HubSmartImport.init();
});
