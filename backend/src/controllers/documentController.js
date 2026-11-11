import supabase from '../config/database.js';
import { successResponse, errorResponse, ERROR_CODES } from '../utils/errors.js';

// Upload Document (Step 5)
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'File harus diupload', ERROR_CODES.VALIDATION_ERROR);
    }

    const { document_type } = req.body;
    const userId = req.user.userId;

    if (!document_type || !['photo', 'family_card', 'birth_certificate', 'report_card', 'diploma'].includes(document_type)) {
      return errorResponse(res, 'Tipe dokumen tidak valid', ERROR_CODES.VALIDATION_ERROR);
    }

    const filePath = `uploads/${req.file.filename}`;

    // Check if document type already exists
    const { data: existing, error: checkError } = await supabase
      .from('documents')
      .select('id')
      .eq('user_id', userId)
      .eq('document_type', document_type)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      const { error } = await supabase
        .from('documents')
        .update({
          file_path: filePath,
          file_name: req.file.filename,
          file_size: req.file.size,
          upload_date: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('document_type', document_type);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          document_type,
          file_path: filePath,
          file_name: req.file.filename,
          file_size: req.file.size
        });
      if (error) throw error;
    }

    successResponse(res, {
      document_type,
      file_name: req.file.filename,
      file_size: req.file.size,
      file_path: filePath
    }, 'Dokumen berhasil diupload', 201);
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan saat upload', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Get Uploaded Documents
export const getUploadedDocuments = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from('documents')
      .select('id, document_type, file_name, file_size, file_path, upload_date')
      .eq('user_id', userId);

    if (error) throw error;

    successResponse(res, data || [], 'Dokumen berhasil diambil');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Delete Document
export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.userId;

    // Verify ownership
    const { data: doc, error: checkError } = await supabase
      .from('documents')
      .select('user_id')
      .eq('id', documentId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!doc || doc.user_id !== userId) {
      return errorResponse(res, 'Dokumen tidak ditemukan', ERROR_CODES.NOT_FOUND);
    }

    const { error } = await supabase.from('documents').delete().eq('id', documentId);
    if (error) throw error;

    successResponse(res, {}, 'Dokumen berhasil dihapus');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Submit Registration (Step 6)
export const submitRegistration = async (req, res) => {
  try {
    const { confirmation_agreed } = req.body;
    const userId = req.user.userId;

    if (!confirmation_agreed) {
      return errorResponse(res, 'Anda harus menyetujui pernyataan', ERROR_CODES.VALIDATION_ERROR);
    }

    // Check if all required data is filled
    const [personalRes, parentRes, schoolRes, docsRes] = await Promise.all([
      supabase.from('personal_data').select('id').eq('user_id', userId).maybeSingle(),
      supabase.from('parent_data').select('id').eq('user_id', userId).maybeSingle(),
      supabase.from('school_data').select('id').eq('user_id', userId).maybeSingle(),
      supabase.from('documents').select('id').eq('user_id', userId)
    ]);

    if (!personalRes.data || !parentRes.data || !schoolRes.data || !docsRes.data || docsRes.data.length === 0) {
      return errorResponse(res, 'Semua data dan dokumen harus dilengkapi', ERROR_CODES.VALIDATION_ERROR);
    }

    // Update status menjadi pending verification
    const { error } = await supabase
      .from('users')
      .update({ registration_status: 'pending' })
      .eq('id', userId);

    if (error) throw error;

    successResponse(res, {
      status: 'pending',
      message: 'Pendaftaran berhasil disubmit menunggu verifikasi admin'
    }, 'Pendaftaran berhasil disubmit');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan saat submit', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Get Registration Status
export const getRegistrationStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('registration_number, registration_status, registration_date')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!user) {
      return errorResponse(res, 'User tidak ditemukan', ERROR_CODES.NOT_FOUND);
    }

    // Get revision notes if status is revision
    let revisionNotes = null;
    if (user.registration_status === 'revision') {
      const { data: notes } = await supabase
        .from('revision_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      revisionNotes = notes || null;
    }

    successResponse(res, {
      ...user,
      revision_notes: revisionNotes
    }, 'Status pendaftaran berhasil diambil');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};
