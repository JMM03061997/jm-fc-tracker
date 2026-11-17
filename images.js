// images.js - Gerenciamento de Imagens e Blobs JM Football Hub v2.0
const HubImages = (() => {
  const urlCache = new Map();
  const MAX_SIZE = 8 * 1024 * 1024; // 8MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

  const validateFile = (file) => {
    if (!file) return { valid: false, error: 'Nenhum arquivo selecionado.' };
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Formato inválido. Use PNG, JPG ou WebP.' };
    }
    if (file.size > MAX_SIZE) {
      return { valid: false, error: 'Imagem muito grande. Máximo de 8MB.' };
    }
    return { valid: true };
  };

  const saveImageBlob = async (fileBlob, existingId = null) => {
    const id = existingId || HubUtils.generateId('img');
    const record = {
      id,
      blob: fileBlob,
      mimeType: fileBlob.type || 'image/png',
      size: fileBlob.size,
      updatedAt: new Date().toISOString()
    };
    await HubDatabase.putRecord('cardImages', record);

    if (urlCache.has(id)) {
      URL.revokeObjectURL(urlCache.get(id));
      urlCache.delete(id);
    }
    return id;
  };

  const getImageUrl = async (imageId) => {
    if (!imageId) return 'card-placeholder.svg';
    if (urlCache.has(imageId)) return urlCache.get(imageId);

    try {
      const record = await HubDatabase.getRecord('cardImages', imageId);
      if (record && record.blob) {
        const objectUrl = URL.createObjectURL(record.blob);
        urlCache.set(imageId, objectUrl);
        return objectUrl;
      }
    } catch (e) {
      console.warn('Falha ao carregar imagem:', imageId, e);
    }
    return 'card-placeholder.svg';
  };

  const deleteImage = async (imageId) => {
    if (!imageId) return;
    if (urlCache.has(imageId)) {
      URL.revokeObjectURL(urlCache.get(imageId));
      urlCache.delete(imageId);
    }
    await HubDatabase.deleteRecord('cardImages', imageId);
  };

  const blobToDataUrl = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const dataUrlToBlob = (dataUrl) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  return {
    validateFile,
    saveImageBlob,
    getImageUrl,
    deleteImage,
    blobToDataUrl,
    dataUrlToBlob
  };
})();
