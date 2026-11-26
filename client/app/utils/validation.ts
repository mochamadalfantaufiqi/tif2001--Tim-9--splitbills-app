// client/app/utils/validation.ts

// Fungsi untuk memvalidasi format email
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Fungsi untuk memvalidasi minimal panjang password (minimal 6 karakter)
export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};