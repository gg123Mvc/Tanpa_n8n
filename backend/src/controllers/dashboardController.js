import supabase from '../config/database.js';
import { successResponse, errorResponse, ERROR_CODES } from '../utils/errors.js';

// Get Dashboard Data untuk Calon Siswa
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [userRes, personalRes, parentRes, schoolRes, docsRes, annRes] = await Promise.all([
      supabase.from('users').select('full_name, email, registration_number, registration_status, registration_date').eq('id', userId).maybeSingle(),
      supabase.from('personal_data').select('id').eq('user_id', userId).maybeSingle(),
      supabase.from('parent_data').select('id').eq('user_id', userId).maybeSingle(),
      supabase.from('school_data').select('id').eq('user_id', userId).maybeSingle(),
      supabase.from('documents').select('id').eq('user_id', userId),
      supabase.from('announcements').select('id, title, content, created_at').order('created_at', { ascending: false }).limit(5)
    ]);

    if (userRes.error) throw userRes.error;

    const docCount = docsRes.data ? docsRes.data.length : 0;
    const completionStatus = {
      personal_data: !!personalRes.data,
      parent_data: !!parentRes.data,
      school_data: !!schoolRes.data,
      documents: docCount >= 5,
      completion_percentage: Math.round(
        ((personalRes.data ? 1 : 0) +
         (parentRes.data ? 1 : 0) +
         (schoolRes.data ? 1 : 0) +
         (docCount >= 5 ? 1 : 0)) / 4 * 100
      )
    };

    successResponse(res, {
      user: userRes.data || {},
      completion: completionStatus,
      announcements: annRes.data || []
    }, 'Dashboard data berhasil diambil');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Get Announcements
export const getAnnouncements = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, content, thumbnail, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    successResponse(res, data || [], 'Pengumuman berhasil diambil');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Get Announcement Detail
export const getAnnouncementDetail = async (req, res) => {
  try {
    const { announcementId } = req.params;

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', announcementId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return errorResponse(res, 'Pengumuman tidak ditemukan', ERROR_CODES.NOT_FOUND);
    }

    successResponse(res, data, 'Pengumuman berhasil diambil');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Edit Registration Data
export const editRegistrationData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { step, data } = req.body;

    if (!step || !data) {
      return errorResponse(res, 'Step dan data harus diisi', ERROR_CODES.VALIDATION_ERROR);
    }

    if (step === 2) {
      const { error } = await supabase.from('personal_data').update({
        nisn: data.nisn, nik: data.nik, full_name: data.full_name,
        gender: data.gender, birth_place: data.birth_place, birth_date: data.birth_date,
        religion: data.religion, child_number: data.child_number,
        siblings_count: data.siblings_count, full_address: data.full_address
      }).eq('user_id', userId);
      if (error) throw error;
    } else if (step === 3) {
      const { error } = await supabase.from('parent_data').update({
        father_name: data.father_name, father_occupation: data.father_occupation,
        father_education: data.father_education, mother_name: data.mother_name,
        mother_occupation: data.mother_occupation, mother_education: data.mother_education,
        guardian_name: data.guardian_name, guardian_phone: data.guardian_phone,
        family_income: data.family_income, parent_address: data.parent_address
      }).eq('user_id', userId);
      if (error) throw error;
    } else if (step === 4) {
      const { error } = await supabase.from('school_data').update({
        school_name: data.school_name, npsn: data.npsn, school_address: data.school_address,
        graduation_year: data.graduation_year, diploma_number: data.diploma_number,
        average_score: data.average_score, major_choice: data.major_choice
      }).eq('user_id', userId);
      if (error) throw error;
    }

    // Change status back to pending if was revision
    const { data: currentUser } = await supabase.from('users').select('registration_status').eq('id', userId).maybeSingle();
    if (currentUser && currentUser.registration_status === 'revision') {
      await supabase.from('users').update({ registration_status: 'pending' }).eq('id', userId);
    }

    successResponse(res, {}, 'Data berhasil diperbarui');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Download Registration Certificate
export const downloadRegistrationCertificate = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: user, error } = await supabase
      .from('users')
      .select('registration_number, full_name, registration_date')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return errorResponse(res, 'User tidak ditemukan', ERROR_CODES.NOT_FOUND);
    }

    const certificateData = {
      registration_number: user.registration_number,
      full_name: user.full_name,
      registration_date: user.registration_date,
      download_url: `/api/certificates/${user.registration_number}.pdf`
    };

    successResponse(res, certificateData, 'Sertifikat siap diunduh');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};
