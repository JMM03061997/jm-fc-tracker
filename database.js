// database.js - Camada IndexedDB JM Football Hub v2.0
const HubDatabase = (() => {
  let db = null;
  const DB_NAME = 'jm_football_hub_db_v1';
  const DB_VERSION = 1; // Preserva integralmente os dados e stores da v1.0

  const init = () => {
    return new Promise((resolve, reject) => {
      if (db) {
        resolve(db);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('Erro ao abrir IndexedDB:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        const stores = ['appData', 'cards', 'cardImages', 'squads', 'formations', 'matches', 'settings'];

        stores.forEach((storeName) => {
          if (!database.objectStoreNames.contains(storeName)) {
            database.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };
    });
  };

  const getRecord = (storeName, id) => {
    return new Promise(async (resolve, reject) => {
      const database = await init();
      const tx = database.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  };

  const getAllRecords = (storeName) => {
    return new Promise(async (resolve, reject) => {
      const database = await init();
      const tx = database.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  };

  const putRecord = (storeName, record) => {
    return new Promise(async (resolve, reject) => {
      const database = await init();
      const tx = database.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      if (record && typeof record === 'object') {
        record.updatedAt = new Date().toISOString();
      }

      const req = store.put(record);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  };

  const deleteRecord = (storeName, id) => {
    return new Promise(async (resolve, reject) => {
      const database = await init();
      const tx = database.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  };

  const clearStore = (storeName) => {
    return new Promise(async (resolve, reject) => {
      const database = await init();
      const tx = database.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  };

  const getStoreNames = async () => {
    const database = await init();
    return Array.from(database.objectStoreNames);
  };

  return {
    init,
    getRecord,
    getAllRecords,
    putRecord,
    deleteRecord,
    clearStore,
    getStoreNames
  };
})();
