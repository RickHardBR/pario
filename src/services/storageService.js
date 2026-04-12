import { supabase } from './supabaseClient';

/**
 * Serviço de gerenciamento de imagens no Supabase Storage
 * Responsável por upload, deleção e obtenção de URLs públicas
 */

class StorageService {
  constructor() {
    this.bucketName = 'produtos';
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedFormats = ['image/jpeg', 'image/png', 'image/webp'];
  }

  /**
   * Validar arquivo antes do upload
   * @param {File} file - Arquivo a validar
   * @returns {Object} { valid: boolean, error: string }
   */
  validateFile(file) {
    // Verificar se arquivo existe
    if (!file) {
      return { valid: false, error: 'Nenhum arquivo selecionado' };
    }

    // Verificar tamanho
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Máximo: 5MB. Seu arquivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    // Verificar formato
    if (!this.allowedFormats.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato inválido. Aceitos: JPG, PNG, WebP',
      };
    }

    return { valid: true };
  }

  /**
   * Fazer upload de imagem para o Supabase Storage
   * @param {File} file - Arquivo a fazer upload
   * @param {string} productId - ID do produto (para organizar na pasta)
   * @returns {Promise} { success: boolean, path: string, url: string, error: string }
   */
  async uploadImage(file, productId) {
    try {
      // Validar arquivo
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${productId}-${timestamp}-${randomString}.${fileExtension}`;

      // Caminho completo no storage
      const filePath = `${productId}/${fileName}`;

      // Fazer upload
      const { data, error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false, // Não sobrescrever se existir
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        return { success: false, error: uploadError.message };
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        success: true,
        path: filePath,
        url: publicUrlData.publicUrl,
        fileName: fileName,
      };
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Deletar imagem do Supabase Storage
   * @param {string} filePath - Caminho completo do arquivo
   * @returns {Promise} { success: boolean, error: string }
   */
  async deleteImage(filePath) {
    try {
      if (!filePath) {
        return { success: false, error: 'Caminho do arquivo não fornecido' };
      }

      const { error: deleteError } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (deleteError) {
        console.error('Erro ao deletar:', deleteError);
        return { success: false, error: deleteError.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Erro ao deletar imagem:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Obter URL pública de uma imagem
   * @param {string} filePath - Caminho do arquivo
   * @returns {string} URL pública
   */
  getPublicUrl(filePath) {
    if (!filePath) return null;

    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Listar todas as imagens de um produto
   * @param {string} productId - ID do produto
   * @returns {Promise} { success: boolean, files: Array, error: string }
   */
  async listProductImages(productId) {
    try {
      const { data, error: listError } = await supabase.storage
        .from(this.bucketName)
        .list(`produtos/${productId}`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (listError) {
        console.error('Erro ao listar imagens:', listError);
        return { success: false, error: listError.message };
      }

      // Mapear para incluir URLs públicas
      const filesWithUrls = data.map((file) => ({
        name: file.name,
        path: `produtos/${productId}/${file.name}`,
        url: this.getPublicUrl(`produtos/${productId}/${file.name}`),
        createdAt: file.created_at,
      }));

      return { success: true, files: filesWithUrls };
    } catch (err) {
      console.error('Erro ao listar imagens:', err);
      return { success: false, error: err.message };
    }
  }
}

// Exportar instância única (singleton)
export const storageService = new StorageService();