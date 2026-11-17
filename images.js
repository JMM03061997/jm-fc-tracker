// images.js - Gerenciamento e cache em memória de imagens sem cortes
const HubImages = {
  cache: new Map(),

  async processUploadFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('Arquivo inválido'));
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 900;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/webp', 0.88);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async saveImage(dataUrl) {
    const id = HubUtils.generateId('img');
    await HubDB.put('images', { id, dataUrl, createdAt: Date.now() });
    this.cache.set(id, dataUrl);
    return id;
  },

  async getImageUrl(imageId) {
    if (!imageId) return 'card-placeholder.svg';
    if (this.cache.has(imageId)) return this.cache.get(imageId);
    const record = await HubDB.getById('images', imageId);
    if (record && record.dataUrl) {
      this.cache.set(imageId, record.dataUrl);
      return record.dataUrl;
    }
    return 'card-placeholder.svg';
  }
};
