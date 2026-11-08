import supabase from '../config/database.js';
import { hashPassword, comparePassword, isValidEmail, isValidWhatsApp, isStrongPassword, generateRegistrationNumber } from '../utils/validators.js';
import { generateToken } from '../utils/jwt.js';
import { successResponse, errorResponse, ERROR_CODES } from '../utils/errors.js';

// Register User
export const register = async (req, res) => {
  try {
    const { full_name, email, whatsapp, password, confirmPassword } = req.body;

    // Validation
    if (!full_name || !email || !whatsapp || !password || !confirmPassword) {
      return errorResponse(res, 'Semua field harus diisi', ERROR_CODES.VALIDATION_ERROR);
    }

    if (!isValidEmail(email)) {
      return errorResponse(res, 'Format email tidak valid', ERROR_CODES.VALIDATION_ERROR);
    }

    if (!isValidWhatsApp(whatsapp)) {
      return errorResponse(res, 'Nomor WhatsApp tidak valid', ERROR_CODES.VALIDATION_ERROR);
    }

    if (!isStrongPassword(password)) {
      return errorResponse(res, 'Password minimal 8 karakter', ERROR_CODES.VALIDATION_ERROR);
    }

    if (password !== confirmPassword) {
      return errorResponse(res, 'Password dan konfirmasi password tidak sama', ERROR_CODES.VALIDATION_ERROR);
    }

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingUser) {
      return errorResponse(res, 'Email sudah terdaftar', ERROR_CODES.CONFLICT);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    const registrationNumber = generateRegistrationNumber();

    // Insert user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        registration_number: registrationNumber,
        full_name,
        email,
        whatsapp,
        password: hashedPassword,
        registration_status: 'pending'
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    const userId = newUser.id;
    const token = generateToken(userId, email, 'user');

    successResponse(res, {
      userId,
      registration_number: registrationNumber,
      email,
      token,
      role: 'user'
    }, 'Registrasi berhasil', 201);
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan saat registrasi', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Login User (Mendukung Calon Siswa & Admin)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return errorResponse(res, 'Email dan password harus diisi', ERROR_CODES.VALIDATION_ERROR);
    }

    // 1. Cek tabel users (Calon Siswa)
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, password, full_name, registration_number')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (user) {
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return errorResponse(res, 'Email atau password salah', ERROR_CODES.UNAUTHORIZED);
      }

      const token = generateToken(user.id, user.email, 'user');

      return successResponse(res, {
        userId: user.id,
        email: user.email,
        full_name: user.full_name,
        registration_number: user.registration_number,
        token,
        role: 'user'
      }, 'Login berhasil');
    }

    // 2. Jika bukan siswa, cek tabel admin_users (Super Admin / Admin)
    const { data: admin, error: adminFetchError } = await supabase
      .from('admin_users')
      .select('id, email, password, username, role')
      .eq('email', email)
      .maybeSingle();

    if (adminFetchError) throw adminFetchError;

    if (admin) {
      const isAdminPasswordValid = await comparePassword(password, admin.password);
      if (!isAdminPasswordValid) {
        return errorResponse(res, 'Email atau password salah', ERROR_CODES.UNAUTHORIZED);
      }

      const token = generateToken(admin.id, admin.email, admin.role);

      return successResponse(res, {
        userId: admin.id,
        email: admin.email,
        username: admin.username,
        full_name: admin.username,
        role: admin.role,
        token
      }, 'Login admin berhasil');
    }

    return errorResponse(res, 'Email atau password salah', ERROR_CODES.UNAUTHORIZED);
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan saat login', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email dan password harus diisi', ERROR_CODES.VALIDATION_ERROR);
    }

    const { data: admin, error: fetchError } = await supabase
      .from('admin_users')
      .select('id, email, password, username, role')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!admin) {
      return errorResponse(res, 'Email atau password salah', ERROR_CODES.UNAUTHORIZED);
    }

    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Email atau password salah', ERROR_CODES.UNAUTHORIZED);
    }

    const token = generateToken(admin.id, admin.email, admin.role);

    successResponse(res, {
      userId: admin.id,
      email: admin.email,
      username: admin.username,
      role: admin.role,
      token
    }, 'Admin login berhasil');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan saat login admin', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const { userId, role } = req.user;
    let user = null;

    if (role === 'admin' || role === 'super_admin') {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, username, role')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        user = { ...data, full_name: data.username };
      }
    } else {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, registration_number, registration_status, registration_date')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      user = data;
    }

    if (!user) {
      return errorResponse(res, 'User tidak ditemukan', ERROR_CODES.NOT_FOUND);
    }

    successResponse(res, user, 'Data user berhasil diambil');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return errorResponse(res, 'Semua field harus diisi', ERROR_CODES.VALIDATION_ERROR);
    }

    if (newPassword !== confirmNewPassword) {
      return errorResponse(res, 'Password baru dan konfirmasi tidak sama', ERROR_CODES.VALIDATION_ERROR);
    }

    if (!isStrongPassword(newPassword)) {
      return errorResponse(res, 'Password minimal 8 karakter', ERROR_CODES.VALIDATION_ERROR);
    }

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', req.user.userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!user) {
      return errorResponse(res, 'User tidak ditemukan', ERROR_CODES.NOT_FOUND);
    }

    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Password lama tidak sesuai', ERROR_CODES.UNAUTHORIZED);
    }

    const hashedNewPassword = await hashPassword(newPassword);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedNewPassword })
      .eq('id', req.user.userId);

    if (updateError) throw updateError;

    successResponse(res, {}, 'Password berhasil diubah');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'Terjadi kesalahan', ERROR_CODES.INTERNAL_ERROR);
  }
};
