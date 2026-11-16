/**
 * JM Football Hub - Camada de Banco de Dados IndexedDB (js/database.js)
 * Gerencia controle de versão, migrações seguras sem perda de dados e transações.
 */

const HubDatabase = (() => {
  const DB_NAME = 'jm_football_hub_db_v1';
  const DB_VERSION = 1;

  const STORES = {
    APP_DATA: 'appData',
    CARDS: 'cards',
    CARD_IMAGES: 'cardImages',
    SQUADS: 'squads',
    FORMATIONS: 'formations',
    MATCHES: 'matches',
    SETTINGS: 'settings'
  };

  let dbInstance = null;

  /**
   * Abre conexão com o IndexedDB e aplica migrações incrementais seguras
   */
  function init() {
    return new Promise((resolve, reject) => {
      if (dbInstance) {
        resolve(dbInstance);
        return;
      }

      if (!('indexedDB' in window)) {
        reject(new Error('Seu navegador não suporta IndexedDB.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const oldVersion = event.oldVersion;

        // Migração para Versão 1 (criação não-destrutiva)
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains(STORES.APP_DATA)) {
            db.createObjectStore(STORES.APP_DATA, { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains(STORES.CARDS)) {
            const cardsStore = db.createObjectStore(STORES.CARDS, { keyPath: 'id' });
            cardsStore.createIndex('playerName', 'playerName', { unique: false });
            cardsStore.createIndex('position', 'position', { unique: false });
            cardsStore.createIndex('overall', 'overall', { unique: false });
            cardsStore.createIndex('archived', 'archived', { unique: false });
          }
          if (!db.objectStoreNames.contains(STORES.CARD_IMAGES)) {
            db.createObjectStore(STORES.CARD_IMAGES, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.SQUADS)) {
            db.createObjectStore(STORES.SQUADS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.FORMATIONS)) {
            db.createObjectStore(STORES.FORMATIONS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.MATCHES)) {
            db.createObjectStore(STORES.MATCHES, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
            db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
          }
        }
      };

      request.onsuccess = async (event) => {
        dbInstance = event.target.result;

        dbInstance.onversionchange = () => {
          dbInstance.close();
          dbInstance = null;
          HubUtils.showToast('Atualização de banco detectada. Recarregue a página.', 'info', 5000);
        };

        try {
          await ensureInitialMetadata();
          resolve(dbInstance);
        } catch (err) {
          reject(err);
        }
      };

      request.onerror = (event) => {
        console.error('Erro ao abrir IndexedDB:', event.target.error);
        reject(new Error('Falha ao inicializar o banco de dados local.'));
      };
    });
  }

  /**
   * Garante registro inicial de metadados do aplicativo sem sobrescrever existentes
   */
  async function ensureInitialMetadata() {
    const existing = await getRecord(STORES.APP_DATA, 'jm_football_hub_v1');
    if (!existing) {
      await putRecord(STORES.APP_DATA, {
        key: 'jm_football_hub_v1',
        app: 'JM Football Hub',
        version: '1.0',
        activeGame: 'eFootball Mobile',
        createdAt: new Date().toISOString()
      });
    }
  }

  /**
   * Executa operação de leitura única
   */
  function getRecord(storeName, key) {
    return new Promise((resolve, reject) => {
      try {
        const tx = dbInstance.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Retorna todos os registros de uma Object Store
   */
  function getAllRecords(storeName) {
    return new Promise((resolve, reject) => {
      try {
        const tx = dbInstance.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Salva ou atualiza registro em transação segura
   */
  function putRecord(storeName, data) {
    return new Promise((resolve, reject) => {
      try {
        const tx = dbInstance.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(data);
        tx.oncomplete = () => resolve(req.result);
        tx.onerror = () => reject(tx.error || req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Remove registro de uma Object Store
   */
  function deleteRecord(storeName, key) {
    return new Promise((resolve, reject) => {
      try {
        const tx = dbInstance.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.delete(key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Limpa uma Object Store específica (usado apenas na restauração validada com modo substituição)
   */
  function clearStore(storeName) {
    return new Promise((resolve, reject) => {
      try {
        const tx = dbInstance.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  return {
    DB_NAME,
    DB_VERSION,
    STORES,
    init,
    getRecord,
    getAllRecords,
    putRecord,
    deleteRecord,
    clearStore
  };
})();
