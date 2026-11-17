// backup.js - Exportação e Restauração Completa v2.0
const HubBackup = (() => {
  const init = () => {
    document.getElementById('btn-export-backup')?.addEventListener('click', exportBackup);
    const importInput = document.getElementById('input-import-backup');
    document.getElementById('btn-trigger-import')?.addEventListener('click', () => importInput?.click());
    importInput?.addEventListener('change', handleImportFileSelection);
  };

  const updateStorageSummary = async () => {
    const cards = await HubDatabase.getAllRecords('cards');
    const images = await HubDatabase.getAllRecords('cardImages');
    const formations = await HubDatabase.getAllRecords('formations');

    const cEl = document.getElementById('settings-cards-count');
    const iEl = document.getElementById('settings-images-count');
    const fEl = document.getElementById('settings-formations-count');

    if (cEl) cEl.textContent = cards.length;
    if (iEl) iEl.textContent = images.length;
    if (fEl) fEl.textContent = formations.length;
  };

  const exportBackup = async () => {
    try {
      HubUtils.showToast('Preparando backup completo...');
      const storeNames = await HubDatabase.getStoreNames();
      const exportedData = {};

      for (const storeName of storeNames) {
        const records = await HubDatabase.getAllRecords(storeName);
        if (storeName === 'cardImages') {
          const serializedImages = [];
          for (const imgRec of records) {
            if (imgRec.blob) {
              const dataUrl = await HubImages.blobToDataUrl(imgRec.blob);
              serializedImages.push({
                id: imgRec.id,
                mimeType: imgRec.mimeType,
                size: imgRec.size,
                updatedAt: imgRec.updatedAt,
                dataUrl
              });
            }
          }
          exportedData[storeName] = serializedImages;
        } else {
          exportedData[storeName] = records;
        }
      }

      const payload = {
        app: 'JM Football Hub',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        data: exportedData
      };

      const jsonStr = JSON.stringify(payload);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `jm-football-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      HubUtils.showToast('Backup exportado com sucesso!');
    } catch (err) {
      console.error('Erro ao exportar backup:', err);
      HubUtils.showToast('Erro ao gerar arquivo de backup.');
    }
  };

  const handleImportFileSelection = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.app !== 'JM Football Hub' || !parsed.data) {
          HubUtils.showToast('Arquivo de backup inválido ou incompatível.');
          return;
        }

        HubUtils.openModal({
          title: 'Restaurar Backup',
          bodyHtml: `
            <p>Backup válido encontrado (Versão ${HubUtils.escapeHtml(parsed.version || '1.0')}).</p>
            <p style="margin-top:8px;">Como deseja importar os dados?</p>
          `,
          buttons: [
            { text: 'Cancelar', className: 'btn-outline' },
            {
              text: 'Mesclar Dados',
              className: 'btn-primary',
              onClick: () => executeRestore(parsed.data, false)
            },
            {
              text: 'Substituir Tudo',
              className: 'btn-danger',
              onClick: () => executeRestore(parsed.data, true)
            }
          ]
        });
      } catch (err) {
        HubUtils.showToast('Erro ao ler o arquivo JSON.');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const executeRestore = async (data, replaceAll) => {
    try {
      const storeNames = await HubDatabase.getStoreNames();

      if (replaceAll) {
        for (const sName of storeNames) {
          await HubDatabase.clearStore(sName);
        }
      }

      for (const [storeName, records] of Object.entries(data)) {
        if (!storeNames.includes(storeName) || !Array.isArray(records)) continue;

        for (const rec of records) {
          if (storeName === 'cardImages' && rec.dataUrl) {
            const blob = HubImages.dataUrlToBlob(rec.dataUrl);
            await HubDatabase.putRecord('cardImages', {
              id: rec.id,
              blob,
              mimeType: rec.mimeType,
              size: rec.size,
              updatedAt: rec.updatedAt || new Date().toISOString()
            });
          } else {
            await HubDatabase.putRecord(storeName, rec);
          }
        }
      }

      HubUtils.showToast('Backup restaurado com sucesso!');
      await updateStorageSummary();
      if (typeof HubApp !== 'undefined') await HubApp.refreshDashboard();
      if (typeof HubFormations !== 'undefined') await HubFormations.refresh();
    } catch (err) {
      console.error('Erro na restauração:', err);
      HubUtils.showToast('Falha ao restaurar dados.');
    }
  };

  return {
    init,
    updateStorageSummary
  };
})();
