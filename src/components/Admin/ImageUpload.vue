<template>
  <div class="image-upload">
    <!-- Área de Upload -->
    <div class="upload-area" @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop">
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        @change="handleFileSelect"
        class="file-input"
        aria-label="Selecionar imagem"
      />

      <div class="upload-content">
        <span class="upload-icon">📸</span>
        <h3 class="upload-title">Arraste a imagem aqui</h3>
        <p class="upload-subtitle">ou clique para selecionar</p>
        <p class="upload-hint">Formatos: JPG, PNG, WebP | Máximo: 5MB</p>
      </div>
    </div>

    <!-- Progresso de Upload -->
    <div v-if="isUploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <p class="progress-text">{{ uploadProgress }}% - Enviando...</p>
    </div>

    <!-- Mensagem de Erro -->
    <div v-if="error" class="error-message">
      <span class="error-icon">❌</span>
      <span>{{ error }}</span>
      <button @click="error = null" class="close-btn">×</button>
    </div>

    <!-- Mensagem de Sucesso -->
    <div v-if="successMessage" class="success-message">
      <span class="success-icon">✅</span>
      <span>{{ successMessage }}</span>
      <button @click="successMessage = null" class="close-btn">×</button>
    </div>

    <!-- Preview da Imagem Enviada -->
    <div v-if="uploadedImage" class="image-preview">
      <h4 class="preview-title">Imagem Enviada</h4>
      <div class="preview-container">
        <img :src="uploadedImage.url" :alt="uploadedImage.fileName" class="preview-image" />
        <div class="preview-info">
          <p><strong>Nome:</strong> {{ uploadedImage.fileName }}</p>
          <p><strong>URL:</strong> <code>{{ uploadedImage.url }}</code></p>
          <button @click="copyToClipboard" class="btn btn--secondary">📋 Copiar URL</button>
          <button @click="deleteImage" class="btn btn--danger">🗑️ Deletar</button>
        </div>
      </div>
    </div>

    <!-- Histórico de Imagens -->
    <div v-if="showHistory && imageHistory.length > 0" class="image-history">
      <h4 class="history-title">Imagens Anteriores</h4>
      <div class="history-grid">
        <div v-for="image in imageHistory" :key="image.path" class="history-item">
          <img :src="image.url" :alt="image.name" class="history-image" />
          <div class="history-actions">
            <button @click="selectImage(image)" class="btn btn--small">Usar</button>
            <button @click="deleteHistoryImage(image)" class="btn btn--small btn--danger">Deletar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storageService } from '../../services/storageService';

// Props
const props = defineProps({
  productId: {
    type: String,
    required: true,
  },
  showHistory: {
    type: Boolean,
    default: true,
  },
});

// Emits
const emit = defineEmits(['image-uploaded', 'image-deleted']);

// Refs
const fileInput = ref(null);
const isUploading = ref(false);
const uploadProgress = ref(0);
const error = ref(null);
const successMessage = ref(null);
const uploadedImage = ref(null);
const imageHistory = ref([]);
const isDragging = ref(false);

// Métodos
const handleDragOver = (e) => {
  e.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (e) => {
  e.preventDefault();
  isDragging.value = false;

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFileSelect({ target: { files } });
  }
};

const handleFileSelect = async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  await uploadFile(file);
};

const uploadFile = async (file) => {
  error.value = null;
  successMessage.value = null;
  isUploading.value = true;
  uploadProgress.value = 0;

  try {
    // Simular progresso (Supabase não retorna progresso nativo)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 30;
      }
    }, 200);

    // Fazer upload
    const result = await storageService.uploadImage(file, props.productId);

    clearInterval(progressInterval);
    uploadProgress.value = 100;

    if (!result.success) {
      error.value = result.error;
      isUploading.value = false;
      return;
    }

    // Sucesso
    uploadedImage.value = {
      url: result.url,
      path: result.path,
      fileName: result.fileName,
    };

    successMessage.value = '✅ Imagem enviada com sucesso!';

    // Emitir evento
    emit('image-uploaded', {
      url: result.url,
      path: result.path,
      fileName: result.fileName,
    });

    // Recarregar histórico
    await loadImageHistory();

    // Limpar input
    if (fileInput.value) {
      fileInput.value.value = '';
    }

    // Limpar progresso após 2 segundos
    setTimeout(() => {
      isUploading.value = false;
      uploadProgress.value = 0;
    }, 2000);
  } catch (err) {
    error.value = 'Erro ao fazer upload: ' + err.message;
    isUploading.value = false;
  }
};

const loadImageHistory = async () => {
  const result = await storageService.listProductImages(props.productId);

  if (result.success) {
    imageHistory.value = result.files;
  }
};

const deleteImage = async () => {
  if (!uploadedImage.value) return;

  if (!confirm('Tem certeza que deseja deletar esta imagem?')) return;

  const result = await storageService.deleteImage(uploadedImage.value.path);

  if (result.success) {
    successMessage.value = '✅ Imagem deletada com sucesso!';
    uploadedImage.value = null;
    emit('image-deleted', uploadedImage.value.path);
    await loadImageHistory();
  } else {
    error.value = result.error;
  }
};

const deleteHistoryImage = async (image) => {
  if (!confirm('Tem certeza que deseja deletar esta imagem?')) return;

  const result = await storageService.deleteImage(image.path);

  if (result.success) {
    successMessage.value = '✅ Imagem deletada com sucesso!';
    emit('image-deleted', image.path);
    await loadImageHistory();
  } else {
    error.value = result.error;
  }
};

const selectImage = (image) => {
  uploadedImage.value = image;
  emit('image-uploaded', image);
};

const copyToClipboard = () => {
  if (!uploadedImage.value) return;

  navigator.clipboard.writeText(uploadedImage.value.url);
  successMessage.value = '📋 URL copiada para a área de transferência!';

  setTimeout(() => {
    successMessage.value = null;
  }, 2000);
};

// Lifecycle
onMounted(() => {
  loadImageHistory();
});
</script>

<style scoped>
/* ===== CONTAINER ===== */
.image-upload {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background-color: #F8F6F3;
  border-radius: 12px;
}

/* ===== ÁREA DE UPLOAD ===== */
.upload-area {
  border: 2px dashed #D4511A;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #FFFFFF;
}

.upload-area:hover {
  border-color: #2C2C2C;
  background-color: rgba(212, 81, 26, 0.05);
}

.upload-area.dragging {
  border-color: #2C2C2C;
  background-color: rgba(212, 81, 26, 0.1);
}

.file-input {
  display: none;
}

.upload-content {
  pointer-events: none;
}

.upload-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.upload-title {
  font-size: 18px;
  color: #2C2C2C;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.upload-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* ===== PROGRESSO ===== */
.upload-progress {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #E0E0E0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #D4511A, #FFD700);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  margin: 0;
  text-align: center;
}

/* ===== MENSAGENS ===== */
.error-message,
.success-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  animation: slideIn 0.3s ease-out;
}

.error-message {
  background-color: #FFEBEE;
  color: #C84C3D;
  border-left: 4px solid #C84C3D;
}

.success-message {
  background-color: #E8F5E9;
  color: #1B4D3E;
  border-left: 4px solid #1B4D3E;
}

.error-icon,
.success-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  margin-left: auto;
  color: inherit;
  padding: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== PREVIEW ===== */
.image-preview {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #E0E0E0;
}

.preview-title {
  font-size: 14px;
  color: #2C2C2C;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.preview-container {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-info p {
  font-size: 12px;
  margin: 0;
  color: #666;
}

.preview-info code {
  background-color: #F0F0F0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  word-break: break-all;
  color: #D4511A;
}

/* ===== HISTÓRICO ===== */
.image-history {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #E0E0E0;
}

.history-title {
  font-size: 14px;
  color: #2C2C2C;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.history-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #E0E0E0;
  transition: all 0.3s;
}

.history-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.history-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.history-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  gap: 4px;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.history-item:hover .history-actions {
  opacity: 1;
}

/* ===== BOTÕES ===== */
.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.btn--secondary {
  background-color: #D4511A;
  color: #FFFFFF;
}

.btn--secondary:hover {
  background-color: #2C2C2C;
}

.btn--danger {
  background-color: #C84C3D;
  color: #FFFFFF;
}

.btn--danger:hover {
  background-color: #A63830;
}

.btn--small {
  padding: 4px 8px;
  font-size: 11px;
  flex: 1;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 768px) {
  .image-upload {
    padding: 16px;
    gap: 16px;
  }

  .upload-area {
    padding: 24px 16px;
  }

  .preview-container {
    flex-direction: column;
    align-items: center;
  }

  .preview-image {
    width: 100%;
    height: 200px;
  }

  .history-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
}
</style>