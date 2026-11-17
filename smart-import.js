// smart-import.js - Importação Inteligente de Elenco por Prints (v2.1)
const HubSmartImport = (() => {
  let selectedFiles = [];
  let detectedCards = [];

  const init = () => {
    // Delegação global para garantir que qualquer botão de importar funcione no celular e desktop
    document.addEventListener('click', (e) => {
      const openBtn = e.target.closest('.js-open-import-modal, #btn-open-import-modal');
      if (openBtn) {
        e.preventDefault();
        openModal();
        return;
      }

      if (e.target.closest('#btn-close-import')) {
        e.preventDefault();
        closeModal();
        return;
      }

      if (e.target.closest('#import-drop-area') || e.target.closest('#btn-add-more-prints')) {
        const fileInput = document.getElementById('import-file-input');
        if (fileInput) fileInput.click();
        return;
      }

      if (e.target.closest('#btn-import-back')) {
        e.preventDefault();
        handleBackClick();
        return;
      }

      if (e.target.closest('#btn-import-action')) {
        e.preventDefault();
        handleActionClick();
      }
    });

    const fileInput = document.getElementById('import-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', handleFilesSelect);
    }
  };

  const openModal = () => {
    const modal = document.getElementById('smart-import-modal');
    if (!modal) return;

    selectedFiles = [];
    detectedCards = [];
    document.getElementById('import-step-1').classList.remove('hidden');
    document.getElementById('import-step-2').classList.add('hidden');
    document.getElementById('btn-import-back').classList.add('hidden');
    document.getElementById('btn-import-action').textContent = 'Analisar Elenco 🔍';
    document.getElementById('import-selected-thumbs').innerHTML = '';
    const fileInput = document.getElementById('import-file-input');
    if (fileInput) fileInput.value = '';
    modal.classList.remove('hidden');
  };

  const closeModal = () => {
    const modal = document.getElementById('smart-import-modal');
    if (modal) modal.classList.add('hidden');
  };

  const handleFilesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const check = HubImages.validateFile(file);
      if (check.valid) {
        selectedFiles.push(file);
      } else {
        HubUtils.showToast(check.error);
      }
    });
    e.target.value = '';
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
        <div class="hub-card-media" style="aspect-ratio:16/9;">
          <img src="${url}" alt="Print ${idx + 1}">
        </div>
        <div class="hub-card-body">
          <div class="hub-card-name">Print #${idx + 1}</div>
        </div>
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
        HubUtils.showToast('Selecione pelo menos um print do seu time.');
        return;
      }
      HubUtils.showToast('Recortando cartas do print...');
      await analyzePrints();
      step1.classList.add('hidden');
      step2.classList.remove('hidden');
      document.getElementById('btn-import-back').classList.remove('hidden');
      document.getElementById('btn-import-action').textContent = 'Confirmar Importação';
      await renderReviewGrid();
    } else {
      await executeImport();
    }
  };

  // Recorta uma região proporcional (x%, y%, w%, h%) da imagem original e devolve um Blob PNG
  const cropRegionToBlob = (imgSource, rx, ry, rw, rh) => {
    return new Promise((resolve) => {
      const sx = Math.max(0, Math.round(imgSource.width * rx));
      const sy = Math.max(0, Math.round(imgSource.height * ry));
      const sw = Math.max(20, Math.round(imgSource.width * rw));
      const sh = Math.max(20, Math.round(imgSource.height * rh));

      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgSource, sx, sy, sw, sh, 0, 0, sw, sh);

      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  // Detecta blocos de cartas por proporção relativa no gramado tático do eFootball
  const detectCardBoxesFromImage = (imgSource) => {
    const w = imgSource.width;
    const h = imgSource.height;
    const scanCanvas = document.createElement('canvas');
    const scale = Math.min(1, 500 / w);
    scanCanvas.width = Math.round(w * scale);
    scanCanvas.height = Math.round(h * scale);
    const ctx = scanCanvas.getContext('2d');
    ctx.drawImage(imgSource, 0, 0, scanCanvas.width, scanCanvas.height);

    const sw = scanCanvas.width;
    const sh = scanCanvas.height;
    const imgData = ctx.getImageData(0, 0, sw, sh).data;

    // Varredura em grade proporcional na área do campo (x: 23% a 77%, y: 2% a 96%)
    const cellW = Math.max(6, Math.round(sw * 0.068));
    const cellH = Math.max(8, Math.round(sh * 0.165));
    const stepX = Math.max(3, Math.round(cellW * 0.45));
    const stepY = Math.max(4, Math.round(cellH * 0.45));

    const candidates = [];
    const xStart = Math.round(sw * 0.23);
    const xEnd = Math.round(sw * 0.77) - cellW;
    const yStart = Math.round(sh * 0.01);
    const yEnd = Math.round(sh * 0.97) - cellH;

    for (let y = yStart; y <= yEnd; y += stepY) {
      for (let x = xStart; x <= xEnd; x += stepX) {
        let brightPixels = 0;
        let totalSampled = 0;

        for (let py = y; py < y + cellH; py += 2) {
          for (let px = x; px < x + cellW; px += 2) {
            const idx = (py * sw + px) * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            totalSampled++;

            // Filtra fundo verde escuro do gramado (cartas têm brilho ou saturação mais alta)
            const brightness = (r + g + b) / 3;
            const isPitchGreen = g > r * 1.15 && g > b * 1.15 && brightness < 95;
            if (!isPitchGreen && brightness > 58) {
              brightPixels++;
            }
          }
        }

        const ratio = totalSampled > 0 ? brightPixels / totalSampled : 0;
        if (ratio > 0.36) {
          candidates.push({
            rx: x / sw,
            ry: y / sh,
            rw: cellW / sw,
            rh: cellH / sh,
            score: ratio
          });
        }
      }
    }

    // Supressão de sobreposição (NMS) para manter 1 recorte limpo por carta
    candidates.sort((a, b) => b.score - a.score);
    const finalBoxes = [];
    for (const cand of candidates) {
      const overlaps = finalBoxes.some((kept) => {
        const dx = Math.abs((cand.rx + cand.rw / 2) - (kept.rx + kept.rw / 2));
        const dy = Math.abs((cand.ry + cand.rh / 2) - (kept.ry + kept.rh / 2));
        return dx < cand.rw * 0.72 && dy < cand.rh * 0.72;
      });
      if (!overlaps) {
        finalBoxes.push(cand);
      }
      if (finalBoxes.length >= 11) break;
    }

    // Ordena do ataque (topo) para o goleiro (base)
    finalBoxes.sort((a, b) => (Math.round(a.ry * 10) - Math.round(b.ry * 10)) || (a.rx - b.rx));
    return finalBoxes;
  };

  const inferPositionByY = (ry) => {
    if (ry < 0.22) return 'CA';
    if (ry < 0.44) return 'MAT';
    if (ry < 0.62) return 'VOL';
    if (ry < 0.80) return 'ZAG';
    return 'GO';
  };

  const analyzePrints = async () => {
    for (const file of selectedFiles) {
      const bitmap = await createImageBitmap(file);
      const boxes = detectCardBoxesFromImage(bitmap);

      if (boxes.length > 0) {
        for (let i = 0; i < boxes.length; i++) {
          const box = boxes[i];
          const croppedBlob = await cropRegionToBlob(bitmap, box.rx, box.ry, box.rw, box.rh);
          detectedCards.push({
            tempId: HubUtils.generateId('det'),
            playerName: `Jogador #${detectedCards.length + 1}`,
            overall: 95,
            position: inferPositionByY(box.ry),
            cardType: 'Epic',
            club: '',
            blob: croppedBlob || file
          });
        }
      } else {
        // Fallback caso o print seja de tela diferente (ex: lista de elenco)
        detectedCards.push({
          tempId: HubUtils.generateId('det'),
          playerName: `Jogador #${detectedCards.length + 1}`,
          overall: 95,
          position: 'CA',
          cardType: 'Epic',
          club: '',
          blob: file
        });
      }
    }

    // Limpa os arquivos já processados para permitir adicionar novos prints na revisão sem duplicar os anteriores
    selectedFiles = [];
    document.getElementById('import-selected-thumbs').innerHTML = '';
    document.getElementById('import-detected-count').textContent = detectedCards.length;
  };

  const renderReviewGrid = async () => {
    const grid = document.getElementById('import-review-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const existingCards = await HubDatabase.getAllRecords('cards');

    detectedCards.forEach((card, index) => {
      const isDuplicate = existingCards.some(
        (ec) =>
          HubUtils.normalizeText(ec.playerName) === HubUtils.normalizeText(card.playerName) &&
          Number(ec.overall) === Number(card.overall) &&
          ec.position === card.position
      );

      const item = document.createElement('div');
      item.className = 'hub-card';
      item.innerHTML = `
        <div class="hub-card-media" style="position:relative;">
          <img src="${URL.createObjectURL(card.blob)}" alt="Carta ${index + 1}">
          <button type="button" class="btn btn-danger btn-xs" style="position:absolute; top:4px; right:4px;" onclick="HubSmartImport.removeCard(${index})">✕</button>
        </div>
        <div class="hub-card-body">
          <input type="text" class="form-input" style="padding:0.35rem 0.5rem; font-size:0.82rem;" value="${HubUtils.escapeHtml(card.playerName)}" data-idx="${index}" data-field="playerName" placeholder="Nome do jogador">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4px; margin-top:4px;">
            <input type="number" class="form-input" style="padding:0.35rem 0.5rem; font-size:0.82rem;" value="${card.overall}" data-idx="${index}" data-field="overall" placeholder="OVR">
            <select class="form-select" style="padding:0.35rem 0.4rem; font-size:0.8rem;" data-idx="${index}" data-field="position">
              ${['GO','ZAG','LE','LD','VOL','MLG','MLE','MLD','MAT','PTE','PTD','SA','CA']
                .map((p) => `<option value="${p}" ${card.position === p ? 'selected' : ''}>${p}</option>`)
                .join('')}
            </select>
          </div>
          <select class="form-select" style="padding:0.35rem 0.4rem; font-size:0.78rem; margin-top:4px;" data-idx="${index}" data-field="cardType">
            ${['Epic','Big Time','Show Time','POTW','Highlight','Trending','Standard','Outro']
              .map((t) => `<option value="${t}" ${card.cardType === t ? 'selected' : ''}>${t}</option>`)
              .join('')}
          </select>
          ${isDuplicate ? '<small style="color:var(--warning); display:block; margin-top:4px;">⚠️ Possível duplicata no elenco</small>' : ''}
        </div>
      `;

      item.querySelectorAll('input, select').forEach((el) => {
        el.addEventListener('change', (e) => {
          const idx = Number(e.target.getAttribute('data-idx'));
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
          playerName: (card.playerName || '').trim() || 'Jogador Importado',
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

      HubUtils.showToast(`${detectedCards.length} cartas importadas para o Meu Elenco!`);
      closeModal();
      if (typeof HubSquad !== 'undefined') await HubSquad.renderSquad();
      if (typeof HubApp !== 'undefined') await HubApp.refreshDashboard();
    } catch (e) {
      console.error('Erro na importação:', e);
      HubUtils.showToast('Erro ao salvar cartas importadas.');
    }
  };

  return { init, openModal, closeModal, removeCard };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', HubSmartImport.init);
} else {
  HubSmartImport.init();
}
