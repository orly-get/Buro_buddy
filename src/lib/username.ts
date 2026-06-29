export const USERNAME_EMAIL_DOMAIN = 'u.burobuddy.app';

const USERNAME_RE = /^[a-z0-9_]+$/;
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 20;
const MIN_PASSWORD_LENGTH = 8;

export type ValidationResult = { ok: true } | { ok: false; error: string };

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function validateUsername(username: string): ValidationResult {
  const normalized = normalizeUsername(username);
  if (normalized.length < MIN_USERNAME_LENGTH || normalized.length > MAX_USERNAME_LENGTH) {
    return { ok: false, error: 'שם המשתמש חייב להכיל בין 3 ל-20 תווים' };
  }
  if (!USERNAME_RE.test(normalized)) {
    return { ok: false, error: 'שם המשתמש יכול להכיל אותיות לטיניות קטנות, ספרות וקו תחתון בלבד' };
  }
  return { ok: true };
}

export function validatePassword(password: string): ValidationResult {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: 'הסיסמה חייבת להכיל לפחות 8 תווים' };
  }
  return { ok: true };
}

export function usernameToEmail(username: string): string {
  return `${normalizeUsername(username)}@${USERNAME_EMAIL_DOMAIN}`;
}
