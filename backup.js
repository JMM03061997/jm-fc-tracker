/**
 * JM Football Hub - Módulo de Backup e Restauração (js/backup.js)
 * Exporta banco completo com imagens em Blob convertidas para Base64 e restaura com validação.
 */

const HubBackup = (() => {
  function init() {
    const exportBtn = document.getElementById('btn-export-backup');
    const importInput = document.getElementById('backup-file-input');

    if (exportBtn) {
      exportBtn.addEventListener('click', exportBackup);
    }

    if (importInput) {
      importInput.addEventListener('change', handleImportFileSelection);
    }
  }

  async function updateSummary() {
    const cardsCountEl = document.getElementById('settings-cards-count');
    const imagesCountEl = document.getElementById('settings-images-count');

    try {
      const cards = await HubDatabase.getAllRecords(HubDatabase.STORES.CARDS);
      const images = await HubDatabase.getAllRecords(HubDatabase.STORES.CARD_IMAGES);

      if (cardsCountEl) cardsCountEl.textContent = cards.length;
      if (imagesCountEl) imagesCountEl.textContent = images.length;
    } catch (err) {
      console.error('Erro ao atualizar sumário de configurações:', err);
    }
  }

  async function exportBackup() {
    try {
      HubUtils.showToast('Preparando backup completo...', 'info');

      const cards = await HubDatabase.getAllRecords(HubDatabase.STORES.CARDS);
      const rawImages = await HubDatabase.getAllRecords(HubDatabase.STORES.CARD_IMAGES);
      const squads = await HubDatabase.getAllRecords(HubDatabase.SQUADS);
      const formations = await HubDatabase.getAllRecords(HubDatabase.FORMATIONS);
      const matches = await HubDatabase.getAllRecords(HubDatabase.MATCHES);
      const settings = await HubDatabase.getAllRecords(HubDatabase.SETTINGS);
      const appData = await HubDatabase.getAllRecords(HubDatabase.APP_DATA);

      // Converte Blobs de imagens para DataURL (Base64) para inclusão segura no JSON
      const imagesWithBase64 = [];
      for (const imgRecord of rawImages) {
        let base64Data = null;
        if (imgRecord.blob instanceof Blob) {
          base64Data = await HubImages.blobToDataUrl(imgRecord.blob);
        }
        imagesWithBase64.push({
          id: imgRecord.id,
          dataUrl: base64Data,
          mimeType: imgRecord.mimeType,
          size: imgRecord.size,
          updatedAt: imgRecord.updatedAt
        });
      }

      const backupPayload = {
        app: 'JM Football Hub',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        database: HubDatabase.DB_NAME,
        data: {
          appData,
          cards,
          cardImages: imagesWithBase64,
          squads,
          formations,
          matches,
          settings
        }
      };

      const jsonString = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `jm-football-hub-backup-${dateStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      HubUtils.showToast('Backup exportado com sucesso!');
      await updateSummary();
    } catch (err) {
      console.error('Erro na exportação de backup:', err);
      HubUtils.showToast('Erro ao gerar arquivo de backup.', 'error');
    }
  }

  function handleImportFileSelection(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonContent = e.target.result;
        const backupData = JSON.parse(jsonContent);

        // Validação estrita do arquivo
        if (!backupData || backupData.app !== 'JM Football Hub' || !backupData.data) {
          throw new Error('Arquivo de backup inválido ou incompatível.');
        }

        const cardsCount = (backupData.data.cards || []).length;
        const imagesCount = (backupData.data.cardImages || []).length;

        HubUtils.openModal({
          title: 'Restaurar Backup do JM Football Hub',
          bodyHtml: `
            <p>O arquivo selecionado contém:</p>
            <ul style="margin: 10px 0 15px 20px; color: var(--text-primary);">
              <li><strong>${cardsCount}</strong> cartas cadastradas</li>
              <li><strong>${imagesCount}</strong> imagens de cartas</li>
            </ul>
            <p>Deseja <strong>substituir</strong> todos os dados atuais ou <strong>mesclar</strong> com os dados existentes no dispositivo?</p>
          `,
          buttons: [
            {
              label: 'Cancelar',
              className: 'btn-secondary',
              onClick: () => { event.target.value = ''; }
            },
            {
              label: 'Mesclar Dados',
              className: 'btn-outline',
              onClick: () => executeRestore(backupData, false)
            },
            {
              label: 'Substituir Tudo',
              className: 'btn-danger',
              onClick: () => executeRestore(backupData, true)
            }
          ]
        });
      } catch (err) {
        console.error('Erro ao ler JSON de backup:', err);
        HubUtils.showToast('Arquivo JSON corrompido ou inválido.', 'error');
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  async function executeRestore(backupData, replaceExisting) {
    try {
      HubUtils.showToast('Restaurando dados...', 'info');
      const storesData = backupData.data;

      if (replaceExisting) {
        await HubDatabase.clearStore(HubDatabase.STORES.CARDS);
        await HubDatabase.clearStore(HubDatabase.STORES.CARD_IMAGES);
        await HubDatabase.clearStore(HubDatabase.STORES.SQUADS);
        await HubDatabase.clearStore(HubDatabase.STORES.FORMATIONS);
        await HubDatabase.clearStore(HubDatabase.STORES.MATCHES);
      }

      // Restaura imagens (converte DataURL de volta para Blob)
      if (storesData.cardImages && Array.isArray(storesData.cardImages)) {
        for (const imgRec of storesData.cardImages) {
          let blob = null;
          if (imgRec.dataUrl) {
            blob = await HubImages.dataUrlToBlob(imgRec.dataUrl);
          }
          if (blob) {
            await HubDatabase.putRecord(HubDatabase.STORES.CARD_IMAGES, {
              id: imgRec.id,
              blob: blob,
              mimeType: imgRec.mimeType || 'image/png',
              size: imgRec.size || blob.size,
              updatedAt: imgRec.updatedAt || new Date().toISOString()
            });
          }
        }
      }

      // Restaura cartas
      if (storesData.cards && Array.isArray(storesData.cards)) {
        for (const card of storesData.cards) {
          await HubDatabase.putRecord(HubDatabase.STORES.CARDS, card);
        }
      }

      // Restaura demais stores caso existam
      const optionalStores = ['squads', 'formations', 'matches', 'settings', 'appData'];
      for (const storeName of optionalStores) {
        if (storesData[storeName] && Array.isArray(storesData[storeName])) {
          for (const item of storesData[storeName]) {
            await HubDatabase.putRecord(HubDatabase.STORES[storeName.toUpperCase()] || storeName, item);
          }
        }
      }

      HubUtils.showToast('Restauração concluída com sucesso!');
      await updateSummary();
      await HubApp.refreshDashboard();
      HubNavigation.goTo('home');
    } catch (err) {
      console.error('Erro ao executar restauração:', err);
      HubUtils.showToast('Erro ao gravar dados restaurados.', 'error');
    }
  }

  return {
    init,
    updateSummary,
    exportBackup
  };
})();
