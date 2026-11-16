/**
 * JM Football Hub - Gerenciamento Independente de Imagens (js/images.js)
 * Valida formatos e tamanhos, gera prévias, armazena e recupera Blobs no IndexedDB
 * mantendo proporção e qualidade originais.
 */

const HubImages = (() => {
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
  const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
  const PLACEHOLDER_PATH = './assets/images/card-placeholder.svg';

  // Cache em memória de ObjectURLs para evitar vazamento de memória e acelerar renderização
  const objectUrlCache = new Map();

  /**
   * Valida arquivo de imagem selecionado pelo usuário
   */
  function validateImageFile(file) {
    if (!file) {
      return { valid: false, error: 'Nenhum arquivo selecionado.' };
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato inválido. Utilize apenas imagens PNG, JPG ou WebP.'
      };
    }
    if (file.size > MAX_SIZE_BYTES) {
      return {
        valid: false,
        error: 'A imagem ultrapassa o limite máximo permitido de 8 MB.'
      };
    }
    return { valid: true };
  }

  /**
   * Gera URL de prévia temporária a partir de um File/Blob sem alterar proporções
   */
  function createPreviewUrl(fileOrBlob) {
    if (!fileOrBlob) return PLACEHOLDER_PATH;
    return URL.createObjectURL(fileOrBlob);
  }

  /**
   * Salva Blob de imagem no IndexedDB com identificador próprio
   */
  async function saveImageBlob(fileOrBlob, existingId = null) {
    const imageId = existingId || HubUtils.generateId('img');
    const record = {
      id: imageId,
      blob: fileOrBlob,
      mimeType: fileOrBlob.type || 'image/png',
      size: fileOrBlob.size || 0,
      updatedAt: new Date().toISOString()
    };

    await HubDatabase.putRecord(HubDatabase.STORES.CARD_IMAGES, record);

    // Atualiza cache de ObjectURL caso já existisse
    if (objectUrlCache.has(imageId)) {
      URL.revokeObjectURL(objectUrlCache.get(imageId));
      objectUrlCache.delete(imageId);
    }

    return imageId;
  }

  /**
   * Recupera URL exibível de uma imagem armazenada no IndexedDB
   */
  async function getImageUrl(imageId) {
    if (!imageId) return PLACEHOLDER_PATH;

    if (objectUrlCache.has(imageId)) {
      return objectUrlCache.get(imageId);
    }

    try {
      const record = await HubDatabase.getRecord(HubDatabase.STORES.CARD_IMAGES, imageId);
      if (record && record.blob instanceof Blob) {
        const url = URL.createObjectURL(record.blob);
        objectUrlCache.set(imageId, url);
        return url;
      }
      return PLACEHOLDER_PATH;
    } catch (err) {
      console.error('Erro ao carregar imagem do IndexedDB:', err);
      return PLACEHOLDER_PATH;
    }
  }

  /**
   * Remove imagem do IndexedDB e limpa cache de URL
   */
  async function deleteImage(imageId) {
    if (!imageId) return;
    if (objectUrlCache.has(imageId)) {
      URL.revokeObjectURL(objectUrlCache.get(imageId));
      objectUrlCache.delete(imageId);
    }
    await HubDatabase.deleteRecord(HubDatabase.STORES.CARD_IMAGES, imageId);
  }

  /**
   * Converte Blob para DataURL (Base64) apenas durante exportação de backup
   */
  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Falha ao converter imagem para backup.'));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Converte DataURL (Base64) de volta para Blob nativo durante restauração de backup
   */
  async function dataUrlToBlob(dataUrl) {
    const response = await fetch(dataUrl);
    return await response.blob();
  }

  function clearMemoryCache() {
    objectUrlCache.forEach((url) => URL.revokeObjectURL(url));
    objectUrlCache.clear();
  }

  return {
    PLACEHOLDER_PATH,
    validateImageFile,
    createPreviewUrl,
    saveImageBlob,
    getImageUrl,
    deleteImage,
    blobToDataUrl,
    dataUrlToBlob,
    clearMemoryCache
  };
})();
