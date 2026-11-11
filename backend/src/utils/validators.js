import bcrypt from 'bcryptjs';

// Hash Password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare Password
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Validate Email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate WhatsApp Number (Indonesia)
export const isValidWhatsApp = (phone) => {
  const phoneRegex = /^(?:\+62|62|0)8[1-9]\d{6,9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Validate Password Strength
export const isStrongPassword = (password) => {
  return password.length >= 8;
};

// Validate NISN (10 digits)
export const isValidNISN = (nisn) => {
  return /^\d{10}$/.test(nisn);
};

// Validate NIK (16 digits)
export const isValidNIK = (nik) => {
  return /^\d{16}$/.test(nik);
};

// Generate Registration Number
export const generateRegistrationNumber = () => {
  const prefix = 'SPMB';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Format Rupiah
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount);
};

// Validate File Type
export const isValidFileType = (fileName, allowedTypes) => {
  const fileExtension = fileName.split('.').pop().toLowerCase();
  return allowedTypes.includes(fileExtension);
};

// Format Date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

// Validate File Size
export const isValidFileSize = (fileSize, maxSize = 5242880) => {
  return fileSize <= maxSize;
};
