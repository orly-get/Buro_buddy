import { describe, it, expect } from 'vitest';
import {
  USERNAME_EMAIL_DOMAIN,
  normalizeUsername,
  validateUsername,
  validatePassword,
  usernameToEmail,
} from './username';

describe('normalizeUsername', () => {
  it('lowercases and trims', () => {
    expect(normalizeUsername('  Orly  ')).toBe('orly');
  });
});

describe('validateUsername', () => {
  it('accepts a valid username', () => {
    expect(validateUsername('orly_123')).toEqual({ ok: true });
  });
  it('accepts uppercase by normalizing', () => {
    expect(validateUsername('Orly_123')).toEqual({ ok: true });
  });
  it('rejects too short', () => {
    expect(validateUsername('ab').ok).toBe(false);
  });
  it('rejects too long', () => {
    expect(validateUsername('a'.repeat(21)).ok).toBe(false);
  });
  it('rejects illegal characters', () => {
    expect(validateUsername('orly!').ok).toBe(false);
    expect(validateUsername('orly space').ok).toBe(false);
    expect(validateUsername('orly@x').ok).toBe(false);
  });
});

describe('validatePassword', () => {
  it('rejects 7 characters', () => {
    expect(validatePassword('1234567').ok).toBe(false);
  });
  it('accepts 8 characters', () => {
    expect(validatePassword('12345678')).toEqual({ ok: true });
  });
});

describe('usernameToEmail', () => {
  it('maps and normalizes', () => {
    expect(usernameToEmail('Orly')).toBe(`orly@${USERNAME_EMAIL_DOMAIN}`);
  });
  it('trims surrounding whitespace', () => {
    expect(usernameToEmail('  orly  ')).toBe(`orly@${USERNAME_EMAIL_DOMAIN}`);
  });
});
