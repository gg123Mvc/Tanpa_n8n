import supabase from '../config/database.js';
import { successResponse, errorResponse, ERROR_CODES } from '../utils/errors.js';

// Get Dashboard Stats for Admin
export const getAdminStats = async (req, res) => {
  try {
    const [totalRes, pendingRes, acceptedRes, rejectedRes, revisionRes, majorsRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('registration_status', 'pending'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('registration_status', 'accepted'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('registration_status', 'rejected'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('registration_status', 'revision'),
      supabase.from('school_data').select('major_choice')
    ]);

    // Count majors manually
    const majorCounts = {};
    if (majorsRes.data) {
      for (const row of majorsRes.data) {
        const m = row.major_choice || 'Tidak Diisi';
        majorCounts[m] = (majorCounts[m] || 0) + 1;
      }
    }
    const majors = Object.entries(majorCounts).map(([major_choice, count]) => ({ major_choice, count }));

    successResponse(res, {
      total: totalRes.count || 0,
      pending: pendingRes.count || 0,
      accepted: acceptedRes.count || 0,
      rejected: rejectedRes.count || 0,
      revision: revisionRes.count || 0,
      majors
    }, 'Admin stats berhasil diambil');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Get All Applicants
export const getAllApplicants = async (req, res) => {
  try {
    const { status, search, limit = 10, offset = 0 } = req.query;
    const pageLimit = parseInt(limit);
    const pageOffset = parseInt(offset);

    let query = supabase
      .from('users')
      .select(`
        id, registration_number, full_name, email, registration_status, registration_date,
        school_data ( major_choice, school_name )
      `, { count: 'exact' })
      .order('registration_date', { ascending: false })
      .range(pageOffset, pageOffset + pageLimit - 1);

    if (status) {
      query = query.eq('registration_status', status);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,registration_number.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    // Flatten school_data
    const applicants = (data || []).map(u => ({
      ...u,
      major_choice: u.school_data?.major_choice || null,
      school_name: u.school_data?.school_name || null,
      school_data: undefined
    }));

    successResponse(res, { applicants, total: count || 0 }, 'Daftar pendaftar berhasil diambil');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Get Applicant Detail
export const getApplicantDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, registration_number, full_name, email, whatsapp, registration_status, registration_date')
      .eq('id', id)
      .maybeSingle();

    if (userError) throw userError;

    if (!user) {
      return errorResponse(res, 'Pendaftar tidak ditemukan', ERROR_CODES.NOT_FOUND);
    }

    const [personalRes, parentRes, schoolRes, docsRes, revisionRes] = await Promise.all([
      supabase.from('personal_data').select('*').eq('user_id', id).maybeSingle(),
      supabase.from('parent_data').select('*').eq('user_id', id).maybeSingle(),
      supabase.from('school_data').select('*').eq('user_id', id).maybeSingle(),
      supabase.from('documents').select('*').eq('user_id', id),
      supabase.from('revision_notes').select('*').eq('user_id', id).order('created_at', { ascending: false })
    ]);

    successResponse(res, {
      user,
      personalData: personalRes.data || null,
      parentData: parentRes.data || null,
      schoolData: schoolRes.data || null,
      documents: docsRes.data || [],
      revisionNotes: revisionRes.data || []
    }, 'Detail pendaftar berhasil diambil');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Update Applicant Status
export const updateApplicantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;

    if (!['pending', 'accepted', 'rejected', 'revision'].includes(status)) {
      return errorResponse(res, 'Status tidak valid', ERROR_CODES.VALIDATION_ERROR);
    }

    const { error } = await supabase
      .from('users')
      .update({ registration_status: status })
      .eq('id', id);

    if (error) throw error;

    // If status is revision, add a note
    if (status === 'revision' && message) {
      await supabase.from('revision_notes').insert({
        user_id: parseInt(id),
        admin_name: req.user.username || 'Admin',
        revision_message: message
      });
    }

    successResponse(res, {}, `Status pendaftar berhasil diubah menjadi ${status}`);
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Manage Announcements
export const getAnnouncements = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*, admin_users ( username )')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const announcements = (data || []).map(a => ({
      ...a,
      creator_name: a.admin_users?.username || null,
      admin_users: undefined
    }));

    successResponse(res, announcements, 'Daftar pengumuman berhasil diambil');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, thumbnail } = req.body;
    const adminId = req.user.userId;

    if (!title || !content) {
      return errorResponse(res, 'Judul dan konten harus diisi', ERROR_CODES.VALIDATION_ERROR);
    }

    const { error } = await supabase.from('announcements').insert({
      title, content,
      thumbnail: thumbnail || null,
      created_by: adminId
    });

    if (error) throw error;

    successResponse(res, {}, 'Pengumuman berhasil dibuat', 201);
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

export const uploadAnnouncementImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'File gambar harus diupload', ERROR_CODES.VALIDATION_ERROR);
    }
    const filePath = `uploads/${req.file.filename}`;
    successResponse(res, { filePath }, 'Gambar berhasil diupload', 201);
  } catch (error) {
    console.error('Upload Error:', error);
    errorResponse(res, 'Terjadi kesalahan saat upload gambar', ERROR_CODES.INTERNAL_ERROR);
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, thumbnail } = req.body;

    const { error } = await supabase.from('announcements').update({
      title, content, thumbnail: thumbnail || null
    }).eq('id', id);

    if (error) throw error;

    successResponse(res, {}, 'Pengumuman berhasil diperbarui');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;

    successResponse(res, {}, 'Pengumuman berhasil dihapus');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};
