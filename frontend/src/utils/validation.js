// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// WhatsApp validation (Indonesia)
export const isValidWhatsApp = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  const phoneRegex = /^(?:\+62|62|0)8[1-9]\d{6,9}$/;
  return phoneRegex.test(cleaned);
};

// Password validation
export const isStrongPassword = (password) => {
  return password.length >= 8;
};

// NISN validation (10 digits)
export const isValidNISN = (nisn) => {
  return /^\d{10}$/.test(nisn);
};

// NIK validation (16 digits)
export const isValidNIK = (nik) => {
  return /^\d{16}$/.test(nik);
};

// Date validation
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// File type validation
export const isValidFileType = (fileName, allowedTypes = ['jpg', 'jpeg', 'png', 'pdf']) => {
  const extension = fileName.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
};

// File size validation
export const isValidFileSize = (fileSize, maxSize = 5 * 1024 * 1024) => {
  return fileSize <= maxSize;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
};

// Format date to Indonesian
export const formatDateToIndonesian = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('id-ID', options);
};

// Format date to input format (YYYY-MM-DD)
export const formatDateToInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
};

// Validate form step
export const validateStep = (stepNumber, formData) => {
  const errors = {};

  if (stepNumber === 1) {
    // Validate registration step
    if (!formData.full_name?.trim()) errors.full_name = 'Nama lengkap harus diisi';
    if (!formData.email?.trim()) errors.email = 'Email harus diisi';
    if (!isValidEmail(formData.email)) errors.email = 'Format email tidak valid';
    if (!formData.whatsapp?.trim()) errors.whatsapp = 'Nomor WhatsApp harus diisi';
    if (!isValidWhatsApp(formData.whatsapp)) errors.whatsapp = 'Nomor WhatsApp tidak valid';
    if (!formData.password?.trim()) errors.password = 'Password harus diisi';
    if (!isStrongPassword(formData.password)) errors.password = 'Password minimal 8 karakter';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Password tidak cocok';
  }

  if (stepNumber === 2) {
    // Validate personal data
    if (!formData.nisn?.trim()) errors.nisn = 'NISN harus diisi';
    if (!isValidNISN(formData.nisn)) errors.nisn = 'NISN harus 10 digit';
    if (!formData.nik?.trim()) errors.nik = 'NIK harus diisi';
    if (!isValidNIK(formData.nik)) errors.nik = 'NIK harus 16 digit';
    if (!formData.full_name?.trim()) errors.full_name = 'Nama lengkap harus diisi';
    if (!formData.gender) errors.gender = 'Jenis kelamin harus dipilih';
    if (!formData.birth_place?.trim()) errors.birth_place = 'Tempat lahir harus diisi';
    if (!formData.birth_date) errors.birth_date = 'Tanggal lahir harus diisi';
    if (!formData.religion) errors.religion = 'Agama harus dipilih';
  }

  if (stepNumber === 3) {
    // Validate parent data
    if (!formData.father_name?.trim()) errors.father_name = 'Nama ayah harus diisi';
    if (!formData.mother_name?.trim()) errors.mother_name = 'Nama ibu harus diisi';
  }

  if (stepNumber === 4) {
    // Validate school data
    if (!formData.school_name?.trim()) errors.school_name = 'Nama sekolah harus diisi';
    if (!formData.npsn?.trim()) errors.npsn = 'NPSN harus diisi';
    if (!formData.graduation_year?.trim()) errors.graduation_year = 'Tahun lulus harus diisi';
    if (!formData.major_choice) errors.major_choice = 'Pilihan jurusan harus dipilih';
  }

  return errors;
};
