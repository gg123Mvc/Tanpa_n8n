import KnowledgeBase from '../models/knowledgeBaseModel.js';
import { successResponse, errorResponse, ERROR_CODES } from '../utils/errors.js';

// Ambil semua data (untuk admin dashboard)
export const getAllKnowledgeBase = async (req, res) => {
  try {
    const data = await KnowledgeBase.getAll();
    successResponse(res, data, 'Berhasil mengambil data knowledge base');
  } catch (error) {
    console.error('Error in getAllKnowledgeBase:', error);
    errorResponse(res, 'Gagal mengambil data knowledge base', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Ambil data berdasarkan ID
export const getKnowledgeBaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await KnowledgeBase.getById(id);
    
    if (!data) {
      return errorResponse(res, 'Data tidak ditemukan', ERROR_CODES.NOT_FOUND);
    }
    
    successResponse(res, data, 'Berhasil mengambil data knowledge base');
  } catch (error) {
    console.error('Error in getKnowledgeBaseById:', error);
    errorResponse(res, 'Gagal mengambil data knowledge base', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Tambah data baru
export const createKnowledgeBase = async (req, res) => {
  try {
    const { category, title, content, status } = req.body;
    
    if (!category || !title || !content) {
      return errorResponse(res, 'Kategori, Judul, dan Isi tidak boleh kosong', ERROR_CODES.VALIDATION_ERROR);
    }
    
    const insertId = await KnowledgeBase.create({ category, title, content, status });
    const newData = await KnowledgeBase.getById(insertId);
    
    successResponse(res, newData, 'Berhasil menambahkan data knowledge base', 201);
  } catch (error) {
    console.error('Error in createKnowledgeBase:', error);
    errorResponse(res, 'Gagal menambahkan data knowledge base', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Update data
export const updateKnowledgeBase = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, title, content, status } = req.body;
    
    if (!category || !title || !content || !status) {
      return errorResponse(res, 'Semua field tidak boleh kosong', ERROR_CODES.VALIDATION_ERROR);
    }
    
    const success = await KnowledgeBase.update(id, { category, title, content, status });
    
    if (!success) {
      return errorResponse(res, 'Data tidak ditemukan atau tidak ada perubahan', ERROR_CODES.NOT_FOUND);
    }
    
    const updatedData = await KnowledgeBase.getById(id);
    successResponse(res, updatedData, 'Berhasil memperbarui data knowledge base');
  } catch (error) {
    console.error('Error in updateKnowledgeBase:', error);
    errorResponse(res, 'Gagal memperbarui data knowledge base', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Hapus data
export const deleteKnowledgeBase = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await KnowledgeBase.delete(id);
    
    if (!success) {
      return errorResponse(res, 'Data tidak ditemukan', ERROR_CODES.NOT_FOUND);
    }
    
    successResponse(res, null, 'Berhasil menghapus data knowledge base');
  } catch (error) {
    console.error('Error in deleteKnowledgeBase:', error);
    errorResponse(res, 'Gagal menghapus data knowledge base', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Ubah status (active/inactive)
export const toggleKnowledgeBaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (status !== 'active' && status !== 'inactive') {
      return errorResponse(res, 'Status tidak valid', ERROR_CODES.VALIDATION_ERROR);
    }
    
    const success = await KnowledgeBase.toggleStatus(id, status);
    
    if (!success) {
      return errorResponse(res, 'Data tidak ditemukan', ERROR_CODES.NOT_FOUND);
    }
    
    successResponse(res, null, `Status berhasil diubah menjadi ${status}`);
  } catch (error) {
    console.error('Error in toggleKnowledgeBaseStatus:', error);
    errorResponse(res, 'Gagal mengubah status knowledge base', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Helper: Ambil data knowledge base dalam format text untuk AI prompt
export const getFormattedKnowledgeBase = async () => {
  try {
    const data = await KnowledgeBase.getActive();
    if (!data || data.length === 0) return '';
    
    let formattedText = 'Info:\n';
    
    data.forEach(item => {
      formattedText += `- ${item.title}: ${item.content}\n`;
    });
    
    return formattedText;
  } catch (error) {
    console.error('Error formatting knowledge base:', error);
    return ''; // Return empty string on error so AI still functions (though without KB)
  }
};
