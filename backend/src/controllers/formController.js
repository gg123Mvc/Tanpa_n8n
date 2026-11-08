import supabase from '../config/database.js';
import { isValidNISN, isValidNIK } from '../utils/validators.js';
import { successResponse, errorResponse, ERROR_CODES } from '../utils/errors.js';

// Save Personal Data (Step 2)
export const savePersonalData = async (req, res) => {
  try {
    const { nisn, nik, full_name, gender, birth_place, birth_date, religion, child_number, siblings_count, full_address } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!nisn || !nik || !full_name || !gender || !birth_place || !birth_date) {
      return errorResponse(res, 'Data required harus diisi', ERROR_CODES.VALIDATION_ERROR);
    }

    if (!isValidNISN(nisn)) {
      return errorResponse(res, 'NISN harus 10 digit', ERROR_CODES.VALIDATION_ERROR);
    }

    if (!isValidNIK(nik)) {
      return errorResponse(res, 'NIK harus 16 digit', ERROR_CODES.VALIDATION_ERROR);
    }

    // Check if record exists
    const { data: existing, error: checkError } = await supabase
      .from('personal_data')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) throw checkError;

    const payload = {
      nisn, nik, full_name, gender, birth_place, birth_date,
      religion, child_number, siblings_count, full_address,
      auto_saved: true,
      auto_save_time: new Date().toISOString()
    };

    if (existing) {
      const { error } = await supabase.from('personal_data').update(payload).eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('personal_data').insert({ user_id: userId, ...payload });
      if (error) throw error;
    }

    successResponse(res, { auto_saved: true, timestamp: new Date() }, 'Data pribadi tersimpan');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Get Personal Data
export const getPersonalData = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from('personal_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return successResponse(res, {}, 'Data tidak ditemukan');
    }

    successResponse(res, data, 'Data pribadi berhasil diambil');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Save Parent Data (Step 3)
export const saveParentData = async (req, res) => {
  try {
    const { father_name, father_occupation, father_education, mother_name, mother_occupation, mother_education, guardian_name, guardian_phone, family_income, parent_address } = req.body;
    const userId = req.user.userId;

    const { data: existing, error: checkError } = await supabase
      .from('parent_data')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) throw checkError;

    const payload = {
      father_name, father_occupation, father_education,
      mother_name, mother_occupation, mother_education,
      guardian_name, guardian_phone, family_income, parent_address
    };

    if (existing) {
      const { error } = await supabase.from('parent_data').update(payload).eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('parent_data').insert({ user_id: userId, ...payload });
      if (error) throw error;
    }

    successResponse(res, {}, 'Data orang tua tersimpan');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Get Parent Data
export const getParentData = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from('parent_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return successResponse(res, {}, 'Data tidak ditemukan');
    }

    successResponse(res, data, 'Data orang tua berhasil diambil');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Save School Data (Step 4)
export const saveSchoolData = async (req, res) => {
  try {
    const { school_name, npsn, school_address, graduation_year, diploma_number, average_score, major_choice } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!school_name || !npsn || !school_address || !graduation_year) {
      return errorResponse(res, 'Data required harus diisi', ERROR_CODES.VALIDATION_ERROR);
    }

    const { data: existing, error: checkError } = await supabase
      .from('school_data')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) throw checkError;

    const payload = {
      school_name, npsn, school_address, graduation_year,
      diploma_number, average_score, major_choice
    };

    if (existing) {
      const { error } = await supabase.from('school_data').update(payload).eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('school_data').insert({ user_id: userId, ...payload });
      if (error) throw error;
    }

    successResponse(res, {}, 'Data sekolah tersimpan');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Get School Data
export const getSchoolData = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from('school_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return successResponse(res, {}, 'Data tidak ditemukan');
    }

    successResponse(res, data, 'Data sekolah berhasil diambil');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Get All Registration Data
export const getAllRegistrationData = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [userRes, personalRes, parentRes, schoolRes, documentsRes] = await Promise.all([
      supabase.from('users').select('full_name, email, whatsapp, registration_status, registration_date').eq('id', userId).maybeSingle(),
      supabase.from('personal_data').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('parent_data').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('school_data').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('documents').select('*').eq('user_id', userId)
    ]);

    if (userRes.error) throw userRes.error;

    successResponse(res, {
      user: userRes.data || {},
      personal_data: personalRes.data || {},
      parent_data: parentRes.data || {},
      school_data: schoolRes.data || {},
      documents: documentsRes.data || []
    }, 'Data pendaftaran berhasil diambil');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};
